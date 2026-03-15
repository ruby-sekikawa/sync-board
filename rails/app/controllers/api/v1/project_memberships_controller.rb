# frozen_string_literal: true

class Api::V1::ProjectMembershipsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_project
  before_action :set_membership, only: [:update, :destroy]

  def index
    authorize @project, :show?
    render json: { memberships: @project.project_memberships.includes(:user).map {|m| serialize_membership(m) } }
  end

  def create
    authorize @project, :update?
    target_user = User.find_by(email: params[:email])
    if target_user.nil?
      return render json: { errors: ["指定されたメールアドレスのユーザーが見つかりません"] }, status: :unprocessable_entity
    end

    membership = @project.project_memberships.build(user: target_user, role: params[:role])
    if membership.save
      render json: { membership: serialize_membership(membership) }, status: :created
    else
      render json: { errors: membership.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @project, :update?
    if last_owner_change?
      return render json: { errors: ["最後のオーナーのロールは変更できません"] }, status: :unprocessable_entity
    end

    if @membership.update(role: params[:role])
      render json: { membership: serialize_membership(@membership) }
    else
      render json: { errors: @membership.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @project, :update?
    if last_owner_destroy?
      return render json: { errors: ["最後のオーナーは削除できません"] }, status: :unprocessable_entity
    end

    @membership.destroy!
    head :no_content
  end

  private

    def set_project
      @project = Project.find(params[:project_id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["リソースが見つかりません"] }, status: :not_found
    end

    def set_membership
      @membership = @project.project_memberships.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["リソースが見つかりません"] }, status: :not_found
    end

    def last_owner_change?
      @membership.owner? && @project.project_memberships.where(role: :owner).count == 1
    end

    def last_owner_destroy?
      @membership.owner? && @project.project_memberships.where(role: :owner).count == 1
    end

    def serialize_membership(membership)
      ProjectMembershipSerializer.new(membership).as_json
    end
end

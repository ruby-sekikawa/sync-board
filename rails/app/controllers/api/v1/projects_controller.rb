# frozen_string_literal: true

class Api::V1::ProjectsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_project, only: [:show, :update, :destroy]

  def index
    projects = policy_scope(Project)
    render json: { projects: projects.map {|p| serialize_project(p) } }
  end

  def show
    authorize @project
    render json: { project: serialize_project(@project) }
  end

  def create
    project = Project.new(project_params.merge(owner: current_user))
    authorize project
    if project.save
      project.project_memberships.create!(user: current_user, role: :owner)
      render json: { project: serialize_project(project) }, status: :created
    else
      render json: { errors: project.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @project
    if @project.update(project_params)
      render json: { project: serialize_project(@project) }
    else
      render json: { errors: @project.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @project
    @project.destroy!
    head :no_content
  end

  private

    def set_project
      @project = Project.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["リソースが見つかりません"] }, status: :not_found
    end

    def project_params
      params.permit(:name, :description)
    end

    def serialize_project(project)
      ProjectSerializer.new(project, current_user: current_user).as_json
    end
end

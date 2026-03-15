# frozen_string_literal: true

class BoardPolicy < ApplicationPolicy
  def index?
    project_member?
  end

  def show?
    project_member?
  end

  def create?
    project_owner_or_editor?
  end

  def update?
    project_owner_or_editor?
  end

  def destroy?
    project_owner?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.joins(project: :project_memberships).where(project_memberships: { user: })
    end
  end

  private

    def project
      record.project
    end

    def project_member?
      project.member?(user)
    end

    def project_owner_or_editor?
      %w[owner editor].include?(project.role_for(user))
    end

    def project_owner?
      project.owner?(user)
    end
end

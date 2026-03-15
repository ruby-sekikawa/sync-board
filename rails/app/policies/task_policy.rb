# frozen_string_literal: true

class TaskPolicy < ApplicationPolicy
  def index?
    project_member?
  end

  def create?
    project_owner_or_editor?
  end

  def update?
    project_owner_or_editor?
  end

  def destroy?
    project_owner_or_editor?
  end

  def move?
    project_owner_or_editor?
  end

  private

    def project
      record.board.project
    end

    def project_member?
      project.member?(user)
    end

    def project_owner_or_editor?
      %w[owner editor].include?(project.role_for(user))
    end
end

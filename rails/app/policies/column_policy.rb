# frozen_string_literal: true

class ColumnPolicy < ApplicationPolicy
  def create?
    project_owner_or_editor?
  end

  def update?
    project_owner_or_editor?
  end

  def destroy?
    project_owner_or_editor?
  end

  private

    def project
      record.board.project
    end

    def project_owner_or_editor?
      %w[owner editor].include?(project.role_for(user))
    end
end

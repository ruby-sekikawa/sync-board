# frozen_string_literal: true

class ProjectPolicy < ApplicationPolicy
  def index?
    member?
  end

  def show?
    member?
  end

  def create?
    true
  end

  def update?
    owner?
  end

  def destroy?
    owner?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.joins(:project_memberships).where(project_memberships: { user: user })
    end
  end

  private

    def member?
      record.member?(user)
    end

    def owner?
      record.owner?(user)
    end
end

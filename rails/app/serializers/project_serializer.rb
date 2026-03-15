class ProjectSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :owner_id, :current_user_role, :members_count, :created_at, :updated_at

  def current_user_role
    object.role_for(current_user)
  end

  def members_count
    object.project_memberships.size
  end

  private

    def current_user
      instance_options[:current_user]
    end
end

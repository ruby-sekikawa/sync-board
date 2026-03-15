class ProjectMembershipSerializer < ActiveModel::Serializer
  attributes :id, :project_id, :user_id, :role, :created_at

  belongs_to :user, serializer: MemberUserSerializer
end

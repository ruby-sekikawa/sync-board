class TaskSerializer < ActiveModel::Serializer
  attributes :id, :column_id, :board_id, :title, :description,
             :assignee_id, :due_date, :priority, :position,
             :created_by_user_id, :created_at, :updated_at

  belongs_to :assignee, serializer: MemberUserSerializer, if: -> { object.assignee.present? }
end

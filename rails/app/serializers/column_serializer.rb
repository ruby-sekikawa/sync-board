class ColumnSerializer < ActiveModel::Serializer
  attributes :id, :board_id, :name, :position, :created_at, :updated_at, :tasks

  def tasks
    object.tasks.map {|t| TaskSerializer.new(t).as_json }
  end
end

class BoardSerializer < ActiveModel::Serializer
  attributes :id, :project_id, :name, :description, :created_at, :updated_at

  has_many :columns, serializer: ColumnSerializer
end

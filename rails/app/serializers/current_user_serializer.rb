class CurrentUserSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :image
end

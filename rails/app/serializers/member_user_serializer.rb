class MemberUserSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :image
end

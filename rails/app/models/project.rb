# frozen_string_literal: true

class Project < ApplicationRecord
  belongs_to :owner, class_name: "User"
  has_many :project_memberships, dependent: :destroy
  has_many :members, through: :project_memberships, source: :user
  has_many :boards, dependent: :destroy

  validates :name, presence: true, length: { maximum: 100 }

  def membership_for(user)
    project_memberships.find_by(user:)
  end

  def role_for(user)
    membership_for(user)&.role
  end

  def member?(user)
    project_memberships.exists?(user:)
  end

  def owner?(user)
    role_for(user) == "owner"
  end
end

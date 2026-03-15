# frozen_string_literal: true

class ProjectMembership < ApplicationRecord
  belongs_to :project
  belongs_to :user

  enum :role, { owner: "owner", editor: "editor", viewer: "viewer" }

  validates :role, presence: true
  validates :user_id, uniqueness: { scope: :project_id }
end

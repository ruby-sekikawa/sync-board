# frozen_string_literal: true

class Task < ApplicationRecord
  belongs_to :column
  belongs_to :board
  belongs_to :assignee, class_name: "User", optional: true
  belongs_to :created_by_user, class_name: "User"

  enum :priority, { low: "low", medium: "medium", high: "high" }

  validates :title, presence: true, length: { maximum: 255 }
  validates :priority, presence: true
  validate :max_tasks_per_column, on: :create

  default_scope { order(:position) }

  private

    def max_tasks_per_column
      return unless column
      return unless column.tasks.count >= 500

      errors.add(:base, "1カラムにつき最大500件まで作成できます")
    end
end

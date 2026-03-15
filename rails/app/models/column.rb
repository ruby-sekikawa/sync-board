# frozen_string_literal: true

class Column < ApplicationRecord
  belongs_to :board
  has_many :tasks, dependent: :destroy

  validates :name, presence: true, length: { maximum: 100 }
  validate :max_columns_per_board, on: :create

  default_scope { order(:position) }

  private

    def max_columns_per_board
      return unless board
      return unless board.columns.count >= 20

      errors.add(:base, "1ボードにつき最大20列まで作成できます")
    end
end

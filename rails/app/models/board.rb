# frozen_string_literal: true

class Board < ApplicationRecord
  belongs_to :project
  has_many :columns, dependent: :destroy
  has_many :tasks, dependent: :destroy

  validates :name, presence: true, length: { maximum: 100 }
end

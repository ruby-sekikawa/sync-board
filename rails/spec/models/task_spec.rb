# frozen_string_literal: true

require "rails_helper"

RSpec.describe Task, type: :model do
  let(:board) { create(:board) }
  let(:column) { create(:column, board:) }
  let(:user) { create(:user) }

  describe "バリデーション" do
    subject(:task) { build(:task, column:, board:, created_by_user: user) }

    it "有効なタスクが保存できる" do
      expect(task).to be_valid
    end

    it "titleが必須" do
      task.title = ""
      expect(task).not_to be_valid
      expect(task.errors[:title]).to be_present
    end

    it "titleは255文字以内" do
      task.title = "a" * 256
      expect(task).not_to be_valid
    end

    it "titleが255文字の場合は有効" do
      task.title = "a" * 255
      expect(task).to be_valid
    end

    it "priorityが必須" do
      task.priority = nil
      expect(task).not_to be_valid
    end

    it "無効なpriorityは受け付けない" do
      expect { task.priority = "invalid" }.to raise_error(ArgumentError)
    end

    context "start_dateのデフォルト値" do
      it "start_dateが未指定の場合は今日の日付が設定される" do
        task = create(:task, column:, board:, created_by_user: user, start_date: nil)
        expect(task.start_date).to eq Time.zone.today
      end

      it "start_dateが指定された場合はその値が使われる" do
        date = Date.new(2026, 1, 1)
        task = create(:task, column:, board:, created_by_user: user, start_date: date)
        expect(task.start_date).to eq date
      end
    end

    context "1カラムあたり500件制限" do
      before { create_list(:task, 500, column:, board:, created_by_user: user) }

      it "500件を超えるタスクを作成できない" do
        expect(task).not_to be_valid
        expect(task.errors[:base]).to include("1カラムにつき最大500件まで作成できます")
      end
    end
  end
end

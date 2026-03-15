require "rails_helper"

RSpec.describe Board, type: :model do
  describe "バリデーション" do
    it "name・projectがあれば有効" do
      expect(build(:board)).to be_valid
    end

    it "nameがなければ無効" do
      expect(build(:board, name: nil)).not_to be_valid
    end

    it "nameが100文字以内なら有効" do
      expect(build(:board, name: "a" * 100)).to be_valid
    end

    it "nameが101文字以上なら無効" do
      expect(build(:board, name: "a" * 101)).not_to be_valid
    end
  end

  describe "アソシエーション" do
    it "ボード削除時にカラムもcascade削除される" do
      board = create(:board)
      create(:column, board:)
      expect { board.destroy }.to change { Column.count }.by(-1)
    end
  end
end

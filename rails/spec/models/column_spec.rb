require "rails_helper"

RSpec.describe Column, type: :model do
  describe "バリデーション" do
    it "name・boardがあれば有効" do
      expect(build(:column)).to be_valid
    end

    it "nameがなければ無効" do
      expect(build(:column, name: nil)).not_to be_valid
    end

    it "nameが100文字以内なら有効" do
      expect(build(:column, name: "a" * 100)).to be_valid
    end

    it "nameが101文字以上なら無効" do
      expect(build(:column, name: "a" * 101)).not_to be_valid
    end

    it "1ボードにつき20列まで作成できる" do
      board = create(:board)
      create_list(:column, 20, board:)
      extra = build(:column, board:)
      expect(extra).not_to be_valid
      expect(extra.errors[:base]).to include("1ボードにつき最大20列まで作成できます")
    end
  end
end

require "rails_helper"

RSpec.describe User, type: :model do
  context "factoryのデフォルト設定に従った場合" do
    let(:user) { create(:user) }

    it "認証済みの user レコードを正常に新規作成できる" do
      expect(user).to be_valid
      expect(user).to be_confirmed
    end
  end

  describe "バリデーション" do
    it "nameがなければ無効" do
      user = build(:user, name: nil)
      expect(user).not_to be_valid
      expect(user.errors[:name]).to include("を入力してください")
    end

    it "nameが空文字なら無効" do
      user = build(:user, name: "")
      expect(user).not_to be_valid
    end

    it "nameがあれば有効" do
      user = build(:user, name: "テストユーザー")
      expect(user).to be_valid
    end
  end
end

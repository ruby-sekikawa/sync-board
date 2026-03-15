require "rails_helper"

RSpec.describe ProjectMembership, type: :model do
  describe "バリデーション" do
    it "project・user・roleがあれば有効" do
      expect(build(:project_membership)).to be_valid
    end

    it "同一プロジェクトへの同一ユーザーの重複登録は無効" do
      membership = create(:project_membership)
      duplicate = build(:project_membership, project: membership.project, user: membership.user)
      expect(duplicate).not_to be_valid
    end

    it "無効なroleは設定できない" do
      expect { build(:project_membership, role: :invalid_role) }.to raise_error(ArgumentError)
    end
  end
end

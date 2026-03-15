require "rails_helper"

RSpec.describe Project, type: :model do
  describe "バリデーション" do
    it "name・ownerがあれば有効" do
      expect(build(:project)).to be_valid
    end

    it "nameがなければ無効" do
      expect(build(:project, name: nil)).not_to be_valid
    end

    it "nameが空文字なら無効" do
      expect(build(:project, name: "")).not_to be_valid
    end

    it "nameが100文字以内なら有効" do
      expect(build(:project, name: "a" * 100)).to be_valid
    end

    it "nameが101文字以上なら無効" do
      expect(build(:project, name: "a" * 101)).not_to be_valid
    end
  end

  describe "アソシエーション" do
    it "プロジェクト削除時にmembershipsもcascade削除される" do
      project = create(:project)
      create(:project_membership, project:, user: create(:user))
      expect { project.destroy }.to change { ProjectMembership.count }.by(-1)
    end
  end
end

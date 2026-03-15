require "rails_helper"

RSpec.describe ProjectPolicy, type: :policy do
  let(:owner_user) { create(:user) }
  let(:editor_user) { create(:user) }
  let(:viewer_user) { create(:user) }
  let(:outsider) { create(:user) }
  let(:project) { create(:project, owner: owner_user) }

  before do
    create(:project_membership, project:, user: owner_user, role: :owner)
    create(:project_membership, project:, user: editor_user, role: :editor)
    create(:project_membership, project:, user: viewer_user, role: :viewer)
  end

  describe "index?" do
    it "ownerは許可" do
      expect(ProjectPolicy.new(owner_user, project).index?).to be true
    end

    it "editorは許可" do
      expect(ProjectPolicy.new(editor_user, project).index?).to be true
    end

    it "viewerは許可" do
      expect(ProjectPolicy.new(viewer_user, project).index?).to be true
    end

    it "非メンバーは拒否" do
      expect(ProjectPolicy.new(outsider, project).index?).to be false
    end
  end

  describe "show?" do
    it "ownerは許可" do
      expect(ProjectPolicy.new(owner_user, project).show?).to be true
    end

    it "非メンバーは拒否" do
      expect(ProjectPolicy.new(outsider, project).show?).to be false
    end
  end

  describe "create?" do
    it "全ユーザーに許可" do
      expect(ProjectPolicy.new(outsider, project).create?).to be true
    end
  end

  describe "update?" do
    it "ownerは許可" do
      expect(ProjectPolicy.new(owner_user, project).update?).to be true
    end

    it "editorは拒否" do
      expect(ProjectPolicy.new(editor_user, project).update?).to be false
    end

    it "viewerは拒否" do
      expect(ProjectPolicy.new(viewer_user, project).update?).to be false
    end

    it "非メンバーは拒否" do
      expect(ProjectPolicy.new(outsider, project).update?).to be false
    end
  end

  describe "destroy?" do
    it "ownerは許可" do
      expect(ProjectPolicy.new(owner_user, project).destroy?).to be true
    end

    it "editorは拒否" do
      expect(ProjectPolicy.new(editor_user, project).destroy?).to be false
    end

    it "非メンバーは拒否" do
      expect(ProjectPolicy.new(outsider, project).destroy?).to be false
    end
  end
end

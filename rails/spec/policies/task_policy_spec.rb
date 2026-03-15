# frozen_string_literal: true

require "rails_helper"

RSpec.describe TaskPolicy, type: :policy do
  let(:owner_user) { create(:user) }
  let(:editor_user) { create(:user) }
  let(:viewer_user) { create(:user) }
  let(:non_member) { create(:user) }
  let(:project) { create(:project, owner: owner_user) }
  let(:board) { create(:board, project:) }
  let(:column) { create(:column, board:) }
  let(:task) { create(:task, column:, board:, created_by_user: owner_user) }

  before do
    create(:project_membership, project:, user: owner_user, role: "owner")
    create(:project_membership, project:, user: editor_user, role: "editor")
    create(:project_membership, project:, user: viewer_user, role: "viewer")
  end

  describe "create?" do
    it "ownerは許可" do
      expect(TaskPolicy.new(owner_user, task).create?).to be true
    end

    it "editorは許可" do
      expect(TaskPolicy.new(editor_user, task).create?).to be true
    end

    it "viewerは不許可" do
      expect(TaskPolicy.new(viewer_user, task).create?).to be false
    end

    it "非メンバーは不許可" do
      expect(TaskPolicy.new(non_member, task).create?).to be false
    end
  end

  describe "update?" do
    it "ownerは許可" do
      expect(TaskPolicy.new(owner_user, task).update?).to be true
    end

    it "editorは許可" do
      expect(TaskPolicy.new(editor_user, task).update?).to be true
    end

    it "viewerは不許可" do
      expect(TaskPolicy.new(viewer_user, task).update?).to be false
    end
  end

  describe "destroy?" do
    it "ownerは許可" do
      expect(TaskPolicy.new(owner_user, task).destroy?).to be true
    end

    it "editorは許可" do
      expect(TaskPolicy.new(editor_user, task).destroy?).to be true
    end

    it "viewerは不許可" do
      expect(TaskPolicy.new(viewer_user, task).destroy?).to be false
    end
  end

  describe "move?" do
    it "ownerは許可" do
      expect(TaskPolicy.new(owner_user, task).move?).to be true
    end

    it "editorは許可" do
      expect(TaskPolicy.new(editor_user, task).move?).to be true
    end

    it "viewerは不許可" do
      expect(TaskPolicy.new(viewer_user, task).move?).to be false
    end
  end
end

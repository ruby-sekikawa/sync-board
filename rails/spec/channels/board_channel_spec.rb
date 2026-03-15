# frozen_string_literal: true

require "rails_helper"

RSpec.describe BoardChannel, type: :channel do
  let(:owner) { create(:user) }
  let(:non_member) { create(:user) }
  let(:project) { create(:project, owner:) }
  let(:board) { create(:board, project:) }

  before do
    create(:project_membership, project:, user: owner, role: "owner")
  end

  describe "subscribe" do
    context "認証済みメンバーの場合" do
      before { stub_connection current_user: owner }

      it "サブスクライブに成功しストリームが開始される" do
        subscribe(board_id: board.id)
        expect(subscription).to be_confirmed
        expect(subscription.streams).to include("board_#{board.id}")
      end
    end

    context "未認証ユーザーの場合" do
      before { stub_connection current_user: nil }

      it "サブスクライブが拒否される" do
        subscribe(board_id: board.id)
        expect(subscription).to be_rejected
      end
    end

    context "非メンバーの場合" do
      before { stub_connection current_user: non_member }

      it "サブスクライブが拒否される" do
        subscribe(board_id: board.id)
        expect(subscription).to be_rejected
      end
    end

    context "存在しないboardの場合" do
      before { stub_connection current_user: owner }

      it "サブスクライブが拒否される" do
        subscribe(board_id: 0)
        expect(subscription).to be_rejected
      end
    end
  end

  describe "unsubscribe" do
    before { stub_connection current_user: owner }

    it "ストリームが停止される" do
      subscribe(board_id: board.id)
      unsubscribe
      expect(subscription.streams).to be_empty
    end
  end
end

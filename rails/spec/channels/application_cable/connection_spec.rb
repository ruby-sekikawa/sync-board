# frozen_string_literal: true

require "rails_helper"

RSpec.describe ApplicationCable::Connection, type: :channel do
  let(:user) { create(:user) }

  context "有効なトークンの場合" do
    it "接続に成功しcurrent_userがセットされる" do
      token_data = user.create_new_auth_token
      connect "/cable", params: {
        "access-token" => token_data["access-token"],
        "client" => token_data["client"],
        "uid" => token_data["uid"],
      }
      expect(connection.current_user).to eq user
    end
  end

  context "無効なトークンの場合" do
    it "接続が拒否される" do
      expect {
        connect "/cable", params: {
          "access-token" => "invalid",
          "client" => "invalid",
          "uid" => user.email,
        }
      }.to have_rejected_connection
    end
  end

  context "トークンが未指定の場合" do
    it "接続が拒否される" do
      expect { connect "/cable" }.to have_rejected_connection
    end
  end
end

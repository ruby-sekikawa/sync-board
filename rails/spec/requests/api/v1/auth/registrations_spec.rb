require "rails_helper"

RSpec.describe "Api::V1::Auth::Registrations", type: :request do
  describe "POST /api/v1/auth/sign_up" do
    subject { post(api_v1_user_registration_path, params:) }

    context "nameあり・正常なパラメーターの場合" do
      let(:params) do
        {
          email: "test@example.com",
          password: "password123",
          password_confirmation: "password123",
          name: "テストユーザー",
          confirm_success_url: "http://localhost:8000"
        }
      end

      it "ユーザーが作成され、nameが保存される" do
        expect { subject }.to change(User, :count).by(1)
        res = JSON.parse(response.body)
        expect(res["data"]["name"]).to eq "テストユーザー"
        expect(response).to have_http_status(:ok)
      end
    end

    context "nameなしの場合" do
      let(:params) do
        {
          email: "test@example.com",
          password: "password123",
          password_confirmation: "password123",
          confirm_success_url: "http://localhost:8000"
        }
      end

      it "ユーザー作成が失敗し422が返る" do
        expect { subject }.not_to change(User, :count)
        res = JSON.parse(response.body)
        expect(res["errors"]["full_messages"]).to include("名前を入力してください")
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end

require "rails_helper"

RSpec.describe "Api::V1::Columns", type: :request do
  let(:owner) { create(:user) }
  let(:viewer) { create(:user) }
  let!(:project) do
    p = create(:project, owner:)
    create(:project_membership, project: p, user: owner, role: :owner)
    create(:project_membership, project: p, user: viewer, role: :viewer)
    p
  end
  let!(:board) { create(:board, project:) }
  let(:owner_headers) { owner.create_new_auth_token }

  describe "POST /api/v1/boards/:board_id/columns" do
    subject { post(api_v1_board_columns_path(board), params:, headers:) }

    context "ownerの場合" do
      let(:headers) { owner_headers }
      let(:params) { { name: "TODO", position: 65536.0 } }

      it "カラムを作成できる" do
        expect { subject }.to change(Column, :count).by(1)
        res = JSON.parse(response.body)
        expect(res["column"]["name"]).to eq "TODO"
        expect(response).to have_http_status(:created)
      end
    end

    context "viewerの場合" do
      let(:headers) { viewer.create_new_auth_token }
      let(:params) { { name: "TODO" } }

      it "403を返す" do
        subject
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "20列を超える場合" do
      let(:headers) { owner_headers }
      let(:params) { { name: "追加カラム" } }

      before { create_list(:column, 20, board:) }

      it "422を返す" do
        expect { subject }.not_to change(Column, :count)
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PATCH /api/v1/boards/:board_id/columns/:id" do
    subject { patch(api_v1_board_column_path(board, column), params:, headers:) }

    let!(:column) { create(:column, board:, name: "旧名前") }
    let(:params) { { name: "新名前", position: 32768.0 } }

    context "ownerの場合" do
      let(:headers) { owner_headers }

      it "カラムを更新できる" do
        subject
        expect(column.reload.name).to eq "新名前"
        expect(column.reload.position).to eq 32768.0
        expect(response).to have_http_status(:ok)
      end
    end

    context "viewerの場合" do
      let(:headers) { viewer.create_new_auth_token }

      it "403を返す" do
        subject
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "DELETE /api/v1/boards/:board_id/columns/:id" do
    subject { delete(api_v1_board_column_path(board, column), headers:) }

    let!(:column) { create(:column, board:) }

    context "ownerの場合" do
      let(:headers) { owner_headers }

      it "カラムを削除できる" do
        expect { subject }.to change(Column, :count).by(-1)
        expect(response).to have_http_status(:no_content)
      end
    end

    context "viewerの場合" do
      let(:headers) { viewer.create_new_auth_token }

      it "403を返す" do
        subject
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end

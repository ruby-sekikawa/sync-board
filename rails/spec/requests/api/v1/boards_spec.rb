require "rails_helper"

RSpec.describe "Api::V1::Boards", type: :request do
  let(:owner) { create(:user) }
  let(:editor) { create(:user) }
  let(:viewer) { create(:user) }
  let!(:project) do
    p = create(:project, owner:)
    create(:project_membership, project: p, user: owner, role: :owner)
    create(:project_membership, project: p, user: editor, role: :editor)
    create(:project_membership, project: p, user: viewer, role: :viewer)
    p
  end
  let(:owner_headers) { owner.create_new_auth_token }

  describe "GET /api/v1/projects/:project_id/boards" do
    subject { get(api_v1_project_boards_path(project), headers: owner_headers) }

    let!(:board) { create(:board, project:) }

    it "ボード一覧を返す" do
      subject
      res = JSON.parse(response.body)
      expect(res["boards"].length).to eq 1
      expect(res["boards"][0]["id"]).to eq board.id
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /api/v1/projects/:project_id/boards" do
    subject { post(api_v1_project_boards_path(project), params:, headers:) }

    context "ownerの場合" do
      let(:headers) { owner_headers }
      let(:params) { { name: "スプリント1", description: "説明" } }

      it "ボードを作成できる" do
        expect { subject }.to change { Board.count }.by(1)
        res = JSON.parse(response.body)
        expect(res["board"]["name"]).to eq "スプリント1"
        expect(response).to have_http_status(:created)
      end
    end

    context "editorの場合" do
      let(:headers) { editor.create_new_auth_token }
      let(:params) { { name: "スプリント2" } }

      it "ボードを作成できる" do
        expect { subject }.to change { Board.count }.by(1)
        expect(response).to have_http_status(:created)
      end
    end

    context "viewerの場合" do
      let(:headers) { viewer.create_new_auth_token }
      let(:params) { { name: "スプリント3" } }

      it "403を返す" do
        expect { subject }.not_to change { Board.count }
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "nameが空の場合" do
      let(:headers) { owner_headers }
      let(:params) { { name: "" } }

      it "422を返す" do
        expect { subject }.not_to change { Board.count }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "GET /api/v1/projects/:project_id/boards/:id" do
    subject { get(api_v1_project_board_path(project, board), headers: owner_headers) }

    let!(:board) { create(:board, project:) }
    let!(:column) { create(:column, board:) }

    it "columns含むボード詳細を返す" do
      subject
      res = JSON.parse(response.body)
      expect(res["board"]["id"]).to eq board.id
      expect(res["board"]["columns"].length).to eq 1
      expect(res["board"]["columns"][0]["tasks"]).to eq []
      expect(response).to have_http_status(:ok)
    end
  end

  describe "PATCH /api/v1/projects/:project_id/boards/:id" do
    subject { patch(api_v1_project_board_path(project, board), params: { name: "更新後ボード名" }, headers:) }

    let!(:board) { create(:board, project:) }

    context "ownerの場合" do
      let(:headers) { owner_headers }

      it "ボードを更新できる" do
        subject
        expect(board.reload.name).to eq "更新後ボード名"
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

  describe "DELETE /api/v1/projects/:project_id/boards/:id" do
    subject { delete(api_v1_project_board_path(project, board), headers:) }

    let!(:board) { create(:board, project:) }

    context "ownerの場合" do
      let(:headers) { owner_headers }

      it "ボードを削除できる" do
        expect { subject }.to change { Board.count }.by(-1)
        expect(response).to have_http_status(:no_content)
      end
    end

    context "editorの場合" do
      let(:headers) { editor.create_new_auth_token }

      it "403を返す" do
        subject
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end

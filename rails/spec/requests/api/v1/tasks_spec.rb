# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Tasks", type: :request do
  let(:owner) { create(:user) }
  let(:viewer) { create(:user) }
  let!(:project) do
    p = create(:project, owner:)
    create(:project_membership, project: p, user: owner, role: :owner)
    create(:project_membership, project: p, user: viewer, role: :viewer)
    p
  end
  let(:board) { create(:board, project:) }
  let(:column) { create(:column, board:) }
  let(:owner_headers) { owner.create_new_auth_token }
  let(:viewer_headers) { viewer.create_new_auth_token }

  describe "GET /api/v1/boards/:board_id/tasks" do
    let(:non_member) { create(:user) }
    let(:non_member_headers) { non_member.create_new_auth_token }
    let!(:first_task) { create(:task, column:, board:, created_by_user: owner, position: 65536.0) }
    let!(:second_task) { create(:task, column:, board:, created_by_user: owner, position: 131072.0) }

    context "ownerの場合" do
      it "タスク一覧を返す" do
        get "/api/v1/boards/#{board.id}/tasks", headers: owner_headers
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json["tasks"].size).to eq 2
      end
    end

    context "viewerの場合" do
      it "タスク一覧を返す" do
        get "/api/v1/boards/#{board.id}/tasks", headers: viewer_headers
        expect(response).to have_http_status(:ok)
      end
    end

    context "非メンバーの場合" do
      it "403を返す" do
        get "/api/v1/boards/#{board.id}/tasks", headers: non_member_headers
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "POST /api/v1/boards/:board_id/tasks" do
    let(:editor) { create(:user) }
    let(:editor_headers) { editor.create_new_auth_token }
    let(:valid_params) do
      {
        title: "新タスク",
        description: "説明",
        column_id: column.id,
        priority: "high",
        position: 65536.0,
      }
    end

    before { create(:project_membership, project:, user: editor, role: :editor) }

    context "ownerの場合" do
      it "タスクを作成できる" do
        expect {
          post "/api/v1/boards/#{board.id}/tasks", params: valid_params, headers: owner_headers, as: :json
        }.to change { Task.count }.by(1)
        expect(response).to have_http_status(:created)
        json = response.parsed_body
        expect(json["task"]["title"]).to eq "新タスク"
        expect(json["task"]["created_by_user_id"]).to eq owner.id
      end
    end

    context "editorの場合" do
      it "タスクを作成できる" do
        post "/api/v1/boards/#{board.id}/tasks", params: valid_params, headers: editor_headers, as: :json
        expect(response).to have_http_status(:created)
      end
    end

    context "viewerの場合" do
      it "403を返す" do
        post "/api/v1/boards/#{board.id}/tasks", params: valid_params, headers: viewer_headers, as: :json
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "パラメータが無効な場合" do
      it "422を返す" do
        post "/api/v1/boards/#{board.id}/tasks",
             params: { title: "", column_id: column.id, priority: "high" },
             headers: owner_headers, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PATCH /api/v1/boards/:board_id/tasks/:id" do
    let!(:task) { create(:task, column:, board:, created_by_user: owner) }

    context "ownerの場合" do
      it "タスクを更新できる" do
        patch "/api/v1/boards/#{board.id}/tasks/#{task.id}",
              params: { title: "更新後タイトル", priority: "low" },
              headers: owner_headers, as: :json
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["task"]["title"]).to eq "更新後タイトル"
      end
    end

    context "viewerの場合" do
      it "403を返す" do
        patch "/api/v1/boards/#{board.id}/tasks/#{task.id}",
              params: { title: "更新" },
              headers: viewer_headers, as: :json
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "存在しないタスクの場合" do
      it "404を返す" do
        patch "/api/v1/boards/#{board.id}/tasks/0",
              params: { title: "更新" },
              headers: owner_headers, as: :json
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe "PATCH /api/v1/boards/:board_id/tasks/:id/move" do
    let(:other_column) { create(:column, board:, position: 131072.0) }
    let!(:task) { create(:task, column:, board:, created_by_user: owner, position: 65536.0) }

    context "ownerの場合" do
      it "同カラム内で並び替えできる" do
        patch "/api/v1/boards/#{board.id}/tasks/#{task.id}/move",
              params: { column_id: column.id, position: 32768.0 },
              headers: owner_headers, as: :json
        expect(response).to have_http_status(:ok)
        expect(task.reload.position).to eq 32768.0
      end

      it "別カラムに移動できる" do
        patch "/api/v1/boards/#{board.id}/tasks/#{task.id}/move",
              params: { column_id: other_column.id, position: 65536.0 },
              headers: owner_headers, as: :json
        expect(response).to have_http_status(:ok)
        expect(task.reload.column_id).to eq other_column.id
      end

      it "moveアクション後にbroadcastが実行される" do
        allow(ActionCable.server).to receive(:broadcast)
        patch "/api/v1/boards/#{board.id}/tasks/#{task.id}/move",
              params: { column_id: column.id, position: 32768.0 },
              headers: owner_headers, as: :json
        expect(ActionCable.server).to have_received(:broadcast).with("board_#{board.id}", hash_including(type: "task_moved"))
      end
    end

    context "viewerの場合" do
      it "403を返す" do
        patch "/api/v1/boards/#{board.id}/tasks/#{task.id}/move",
              params: { column_id: column.id, position: 32768.0 },
              headers: viewer_headers, as: :json
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "DELETE /api/v1/boards/:board_id/tasks/:id" do
    let!(:task) { create(:task, column:, board:, created_by_user: owner) }

    context "ownerの場合" do
      it "タスクを削除できる" do
        expect {
          delete "/api/v1/boards/#{board.id}/tasks/#{task.id}", headers: owner_headers
        }.to change { Task.count }.by(-1)
        expect(response).to have_http_status(:no_content)
      end
    end

    context "viewerの場合" do
      it "403を返す" do
        delete "/api/v1/boards/#{board.id}/tasks/#{task.id}", headers: viewer_headers
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end

require "rails_helper"

RSpec.describe "Api::V1::Projects", type: :request do
  let(:user) { create(:user) }
  let(:headers) { user.create_new_auth_token }

  describe "GET /api/v1/projects" do
    subject { get(api_v1_projects_path, headers:) }

    context "認証済みの場合" do
      let!(:own_project) do
        project = create(:project, owner: user)
        create(:project_membership, project:, user:, role: :owner)
        project
      end
      let!(:other_project) { create(:project) }

      it "自分がメンバーのプロジェクトのみ返す" do
        subject
        res = JSON.parse(response.body)
        expect(res["projects"].length).to eq 1
        expect(res["projects"][0]["id"]).to eq own_project.id
        expect(response).to have_http_status(:ok)
      end
    end

    context "未認証の場合" do
      let(:headers) { nil }

      it "401を返す" do
        subject
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/projects" do
    subject { post(api_v1_projects_path, params:, headers:) }

    context "有効なパラメーターの場合" do
      let(:params) { { name: "新プロジェクト", description: "説明" } }

      it "プロジェクトが作成され、作成者がownerとして登録される" do
        expect { subject }.to change { Project.count }.by(1).
                                and change { ProjectMembership.count }.by(1)
        res = JSON.parse(response.body)
        expect(res["project"]["name"]).to eq "新プロジェクト"
        expect(res["project"]["current_user_role"]).to eq "owner"
        expect(response).to have_http_status(:created)
      end
    end

    context "nameが空の場合" do
      let(:params) { { name: "" } }

      it "422を返す" do
        expect { subject }.not_to change { Project.count }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "GET /api/v1/projects/:id" do
    subject { get(api_v1_project_path(project), headers:) }

    let(:project) do
      p = create(:project, owner: user)
      create(:project_membership, project: p, user:, role: :owner)
      p
    end

    context "メンバーの場合" do
      it "プロジェクト詳細を返す" do
        subject
        res = JSON.parse(response.body)
        expect(res["project"]["id"]).to eq project.id
        expect(response).to have_http_status(:ok)
      end
    end

    context "非メンバーの場合" do
      let(:headers) { create(:user).create_new_auth_token }

      it "403を返す" do
        subject
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "PATCH /api/v1/projects/:id" do
    subject { patch(api_v1_project_path(project), params:, headers:) }

    let(:params) { { name: "更新後名前" } }

    context "ownerの場合" do
      let(:project) do
        p = create(:project, owner: user)
        create(:project_membership, project: p, user:, role: :owner)
        p
      end

      it "プロジェクトを更新できる" do
        subject
        expect(project.reload.name).to eq "更新後名前"
        expect(response).to have_http_status(:ok)
      end
    end

    context "editorの場合" do
      let(:project) do
        owner = create(:user)
        p = create(:project, owner:)
        create(:project_membership, project: p, user: owner, role: :owner)
        create(:project_membership, project: p, user:, role: :editor)
        p
      end

      it "403を返す" do
        subject
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "DELETE /api/v1/projects/:id" do
    subject { delete(api_v1_project_path(project), headers:) }

    context "ownerの場合" do
      let(:project) do
        p = create(:project, owner: user)
        create(:project_membership, project: p, user:, role: :owner)
        p
      end

      it "プロジェクトを削除できる" do
        project
        expect { subject }.to change { Project.count }.by(-1)
        expect(response).to have_http_status(:no_content)
      end
    end

    context "editorの場合" do
      let(:project) do
        owner = create(:user)
        p = create(:project, owner:)
        create(:project_membership, project: p, user: owner, role: :owner)
        create(:project_membership, project: p, user:, role: :editor)
        p
      end

      it "403を返す" do
        subject
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "GET /api/v1/projects/:project_id/memberships" do
    subject { get(api_v1_project_memberships_path(project), headers:) }

    let(:project) do
      p = create(:project, owner: user)
      create(:project_membership, project: p, user:, role: :owner)
      p
    end

    it "メンバー一覧を返す" do
      subject
      res = JSON.parse(response.body)
      expect(res["memberships"].length).to eq 1
      expect(res["memberships"][0]["role"]).to eq "owner"
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /api/v1/projects/:project_id/memberships" do
    subject { post(api_v1_project_memberships_path(project), params:, headers:) }

    let!(:project) do
      p = create(:project, owner: user)
      create(:project_membership, project: p, user:, role: :owner)
      p
    end
    let(:new_user) { create(:user) }
    let(:params) { { email: new_user.email, role: :editor } }

    context "ownerの場合" do
      it "メンバーを追加できる" do
        new_user
        expect { subject }.to change { ProjectMembership.count }.by(1)
        expect(response).to have_http_status(:created)
      end
    end

    context "editorの場合" do
      let(:headers) do
        editor = create(:user)
        create(:project_membership, project:, user: editor, role: :editor)
        editor.create_new_auth_token
      end

      it "403を返す" do
        subject
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "存在しないメールアドレスの場合" do
      let(:params) { { email: "notfound@example.com", role: :editor } }

      it "422を返す" do
        subject
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PATCH /api/v1/projects/:project_id/memberships/:id" do
    subject { patch(api_v1_project_membership_path(project, membership), params:, headers:) }

    let(:project) do
      p = create(:project, owner: user)
      create(:project_membership, project: p, user:, role: :owner)
      p
    end
    let(:target_user) { create(:user) }
    let!(:membership) { create(:project_membership, project:, user: target_user, role: :editor) }
    let(:params) { { role: :viewer } }

    context "ownerの場合" do
      it "ロールを変更できる" do
        subject
        expect(membership.reload.role).to eq "viewer"
        expect(response).to have_http_status(:ok)
      end
    end

    context "最後のownerのroleを変更しようとした場合" do
      let(:membership) { ProjectMembership.find_by(project:, user:) }
      let(:params) { { role: :editor } }

      it "422を返す" do
        subject
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "DELETE /api/v1/projects/:project_id/memberships/:id" do
    subject { delete(api_v1_project_membership_path(project, membership), headers:) }

    let(:project) do
      p = create(:project, owner: user)
      create(:project_membership, project: p, user:, role: :owner)
      p
    end
    let(:target_user) { create(:user) }
    let!(:membership) { create(:project_membership, project:, user: target_user, role: :editor) }

    context "ownerの場合" do
      it "メンバーを削除できる" do
        expect { subject }.to change { ProjectMembership.count }.by(-1)
        expect(response).to have_http_status(:no_content)
      end
    end

    context "最後のownerを削除しようとした場合" do
      let(:membership) { ProjectMembership.find_by(project:, user:) }

      it "422を返す" do
        subject
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end

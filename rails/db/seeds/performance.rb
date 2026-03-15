# frozen_string_literal: true

# パフォーマンス計測用シードデータ
# 200タスクのガントチャートでのfps確認に使用
#
# 実行方法:
#   docker compose exec rails bundle exec rails runner db/seeds/performance.rb
#
# 削除方法:
#   docker compose exec rails bundle exec rails runner "Project.where(name: 'パフォーマンステスト').destroy_all"

Rails.logger.debug "パフォーマンステスト用データを作成します..."

# テストユーザー作成（既存ならスキップ）
user = User.find_or_initialize_by(email: "perf@example.com")
if user.new_record?
  user.assign_attributes(
    name: "パフォーマンステスト用ユーザー",
    password: "password",
    password_confirmation: "password",
    uid: "perf@example.com",
    provider: "email",
  )
  user.save!(validate: false)
  Rails.logger.debug "  ユーザー作成: #{user.email}"
else
  Rails.logger.debug "  ユーザー既存: #{user.email}"
end

# プロジェクト作成
project = Project.find_or_create_by!(name: "パフォーマンステスト") do |p|
  p.description = "200タスクのガントチャート計測用プロジェクト"
end
Rails.logger.debug "  プロジェクト: #{project.name}"

# オーナーメンバーシップ
ProjectMembership.find_or_create_by!(project: project, user: user) do |m|
  m.role = "owner"
end

# ボード作成
board = Board.find_or_create_by!(project: project, name: "パフォーマンスボード")
Rails.logger.debug "  ボード: #{board.name}"

# カラム作成
columns = ["TODO", "進行中", "レビュー", "完了"].map.with_index(1) do |name, i|
  Column.find_or_create_by!(board: board, name: name) do |c|
    c.position = i * 65536.0
  end
end
Rails.logger.debug "  カラム: #{columns.map(&:name).join(", ")}"

# 既存タスクを削除して再作成
Task.where(board: board).delete_all

priorities = %w[low medium high]
start_date = Date.new(2026, 1, 1)

200.times do |i|
  column = columns[i % columns.size]
  due_offset = rand(1..180)
  priority = priorities[i % priorities.size]

  Task.create!(
    board: board,
    column: column,
    title: "パフォーマンステストタスク #{i + 1}",
    description: "ガントチャート表示テスト用タスク",
    priority: priority,
    due_date: start_date + due_offset.days,
    position: (i + 1) * 65536.0,
    created_by_user: user,
  )
end

Rails.logger.debug "  タスク作成: 200件"
Rails.logger.debug ""
Rails.logger.debug "完了！ブラウザで以下にアクセスしてください:"
Rails.logger.debug "  http://localhost:8000/projects/#{project.id}/gantt"

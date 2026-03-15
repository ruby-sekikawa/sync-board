FactoryBot.define do
  factory :task do
    sequence(:title) {|n| "タスク#{n}" }
    description { "説明" }
    priority { "medium" }
    position { 65536.0 }
    association :created_by_user, factory: :user

    board { column&.board || association(:board) }
    association :column
  end
end

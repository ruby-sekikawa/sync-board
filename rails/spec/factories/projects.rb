FactoryBot.define do
  factory :project do
    sequence(:name) {|n| "プロジェクト#{n}" }
    description { "プロジェクトの説明" }
    association :owner, factory: :user
  end
end

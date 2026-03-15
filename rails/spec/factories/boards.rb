FactoryBot.define do
  factory :board do
    sequence(:name) {|n| "ボード#{n}" }
    description { "ボードの説明" }
    association :project
  end
end

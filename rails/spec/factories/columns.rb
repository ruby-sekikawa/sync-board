FactoryBot.define do
  factory :column do
    sequence(:name) {|n| "カラム#{n}" }
    position { 65536.0 }
    association :board
  end
end

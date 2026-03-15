class CreateTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :tasks do |t|
      t.references :column, null: false, foreign_key: { on_delete: :cascade }
      t.references :board, null: false, foreign_key: { on_delete: :cascade }
      t.string :title, null: false, limit: 255
      t.text :description
      t.references :assignee, foreign_key: { to_table: :users, on_delete: :nullify }
      t.date :due_date
      t.string :priority, null: false, default: "medium", limit: 10
      t.float :position, null: false, default: 65536.0
      t.references :created_by_user, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :tasks, :due_date
    add_index :tasks, [:column_id, :position]
  end
end

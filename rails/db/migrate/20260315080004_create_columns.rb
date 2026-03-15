class CreateColumns < ActiveRecord::Migration[7.1]
  def change
    create_table :columns do |t|
      t.references :board, null: false, foreign_key: { on_delete: :cascade }
      t.string :name, null: false, limit: 100
      t.float :position, null: false, default: 65536.0

      t.timestamps
    end

    add_index :columns, [:board_id, :position]
  end
end

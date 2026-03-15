class CreateBoards < ActiveRecord::Migration[7.1]
  def change
    create_table :boards do |t|
      t.references :project, null: false, foreign_key: { on_delete: :cascade }
      t.string :name, null: false, limit: 100
      t.text :description

      t.timestamps
    end

  end
end

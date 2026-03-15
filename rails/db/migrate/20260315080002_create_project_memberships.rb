class CreateProjectMemberships < ActiveRecord::Migration[7.1]
  def change
    create_table :project_memberships do |t|
      t.references :project, null: false, foreign_key: { on_delete: :cascade }
      t.references :user, null: false, foreign_key: true
      t.string :role, null: false, default: "viewer", limit: 20

      t.timestamps
    end

    add_index :project_memberships, [:project_id, :user_id], unique: true
  end
end

class AddStartDateToTasks < ActiveRecord::Migration[7.1]
  def up
    add_column :tasks, :start_date, :date, after: :assignee_id
    execute "UPDATE tasks SET start_date = DATE(created_at)"
  end

  def down
    remove_column :tasks, :start_date
  end
end

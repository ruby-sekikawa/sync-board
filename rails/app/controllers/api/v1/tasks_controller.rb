# frozen_string_literal: true

class Api::V1::TasksController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_board
  before_action :set_task, only: [:update, :destroy, :move]

  def index
    authorize Task.new(board: @board), :index?
    tasks = @board.tasks
    render json: { tasks: tasks.map {|t| TaskSerializer.new(t).as_json } }
  end

  def create
    task = @board.tasks.build(task_params)
    task.created_by_user = current_user
    authorize task
    if task.save
      task_json = TaskSerializer.new(task).as_json
      broadcast(type: "task_created", task: task_json)
      render json: { task: task_json }, status: :created
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @task
    if @task.update(task_params)
      task_json = TaskSerializer.new(@task).as_json
      broadcast(type: "task_updated", task: task_json)
      render json: { task: task_json }
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @task
    task_id = @task.id
    column_id = @task.column_id
    @task.destroy!
    broadcast(type: "task_deleted", task_id:, column_id:)
    head :no_content
  end

  def move
    authorize @task
    previous_column_id = @task.column_id
    previous_position = @task.position
    if @task.update(move_params)
      task_json = TaskSerializer.new(@task).as_json
      broadcast(type: "task_moved", task: task_json, previous_column_id:, previous_position:)
      render json: { task: task_json, previous_column_id: }
    else
      render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

    def set_board
      @board = Board.find(params[:board_id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["リソースが見つかりません"] }, status: :not_found
    end

    def set_task
      @task = @board.tasks.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["リソースが見つかりません"] }, status: :not_found
    end

    def task_params
      params.permit(:title, :description, :column_id, :assignee_id, :due_date, :priority, :position)
    end

    def move_params
      params.permit(:column_id, :position)
    end

    def broadcast(payload)
      ActionCable.server.broadcast("board_#{@board.id}", payload)
    end
end

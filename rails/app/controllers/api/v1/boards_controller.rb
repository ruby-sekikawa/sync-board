# frozen_string_literal: true

class Api::V1::BoardsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_project
  before_action :set_board, only: [:show, :update, :destroy]

  def index
    authorize @project, :show?
    boards = @project.boards
    render json: { boards: boards.map {|b| BoardSerializer.new(b, include: []).as_json } }
  end

  def show
    authorize @board
    render json: { board: BoardSerializer.new(@board).as_json }
  end

  def create
    board = @project.boards.build(board_params)
    authorize board
    if board.save
      render json: { board: BoardSerializer.new(board, include: []).as_json }, status: :created
    else
      render json: { errors: board.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @board
    if @board.update(board_params)
      render json: { board: BoardSerializer.new(@board, include: []).as_json }
    else
      render json: { errors: @board.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @board
    @board.destroy!
    head :no_content
  end

  private

    def set_project
      @project = Project.find(params[:project_id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["リソースが見つかりません"] }, status: :not_found
    end

    def set_board
      @board = @project.boards.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["リソースが見つかりません"] }, status: :not_found
    end

    def board_params
      params.permit(:name, :description)
    end
end

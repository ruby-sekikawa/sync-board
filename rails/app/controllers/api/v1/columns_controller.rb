# frozen_string_literal: true

class Api::V1::ColumnsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_board
  before_action :set_column, only: [:update, :destroy]

  def create
    column = @board.columns.build(column_params)
    authorize column
    if column.save
      column_json = ColumnSerializer.new(column).as_json
      broadcast(type: "column_created", column: column_json)
      render json: { column: column_json }, status: :created
    else
      render json: { errors: column.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @column
    if @column.update(column_params)
      column_json = ColumnSerializer.new(@column).as_json
      broadcast(type: "column_updated", column: column_json)
      render json: { column: column_json }
    else
      render json: { errors: @column.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @column
    column_id = @column.id
    @column.destroy!
    broadcast(type: "column_deleted", column_id:)
    head :no_content
  end

  private

    def set_board
      @board = Board.find(params[:board_id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["リソースが見つかりません"] }, status: :not_found
    end

    def set_column
      @column = @board.columns.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["リソースが見つかりません"] }, status: :not_found
    end

    def column_params
      params.permit(:name, :position)
    end

    def broadcast(payload)
      ActionCable.server.broadcast("board_#{@board.id}", payload)
    end
end

# frozen_string_literal: true

class BoardChannel < ApplicationCable::Channel
  def subscribed
    return reject unless current_user

    board = Board.find_by(id: params[:board_id])
    return reject unless board
    return reject unless board.project.member?(current_user)

    stream_from "board_#{board.id}"
  end

  def unsubscribed
    stop_all_streams
  end
end

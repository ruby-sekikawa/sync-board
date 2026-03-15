class Api::V1::BaseController < ApplicationController
  include Pundit::Authorization

  alias_method :current_user, :current_api_v1_user
  alias_method :authenticate_user!, :authenticate_api_v1_user!
  alias_method :user_signed_in?, :api_v1_user_signed_in?

  rescue_from Pundit::NotAuthorizedError, with: :render_forbidden

  private

    def render_forbidden
      render json: { errors: ["この操作を実行する権限がありません"] }, status: :forbidden
    end
end

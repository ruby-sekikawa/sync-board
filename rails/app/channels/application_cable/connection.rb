# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

      def find_verified_user
        token = request.params["access-token"]
        client = request.params["client"]
        uid = request.params["uid"]

        return reject_unauthorized_connection if token.blank? || client.blank? || uid.blank?

        user = User.find_by(uid:)
        return reject_unauthorized_connection unless user

        token_data = user.tokens[client]
        return reject_unauthorized_connection unless token_data

        unless DeviseTokenAuth::TokenFactory.token_hash_is_token?(token_data["token"], token)
          return reject_unauthorized_connection
        end

        user
      end
  end
end

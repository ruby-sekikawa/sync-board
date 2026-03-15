Rails.application.routes.draw do
  mount ActionCable.server => "/cable"
  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?
  namespace :api do
    namespace :v1 do
      get "health_check", to: "health_check#index"
      mount_devise_token_auth_for "User", at: "auth", controllers: {
        registrations: "api/v1/auth/registrations"
      }

      resources :projects do
        resources :memberships, controller: "project_memberships", only: [:index, :create, :update, :destroy]
        resources :boards, only: [:index, :show, :create, :update, :destroy]
      end

      resources :boards, only: [] do
        resources :columns, only: [:create, :update, :destroy]
        resources :tasks, only: [:index, :create, :update, :destroy] do
          member do
            patch :move
          end
        end
      end

      namespace :current do
        resource :user, only: [:show]
      end
    end
  end
end

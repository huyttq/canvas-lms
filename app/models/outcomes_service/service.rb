#
# Copyright (C) 2020 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.
#

module OutcomesService
  class Service
    class << self
      def url(context)
        settings = settings(context)
        protocol = ENV.fetch('OUTCOMES_SERVICE_PROTOCOL', Rails.env.production? ? 'https' : 'http')
        domain = settings[:domain]
        "#{protocol}://#{domain}" if domain.present?
      end

      def enabled_in_context?(context)
        settings = settings(context)
        settings[:consumer_key].present? && settings[:jwt_secret].present? && settings[:domain].present?
      end

      def jwt(context, scope, expiration = 1.day.from_now.to_i, overrides: {})
        settings = settings(context)
        if settings.key?(:consumer_key) && settings.key?(:jwt_secret) && settings.key?(:domain)
          consumer_key = settings[:consumer_key]
          jwt_secret = settings[:jwt_secret]
          domain = settings[:domain]
          payload = {
            host: domain,
            consumer_key: consumer_key,
            scope: scope,
            exp: expiration
          }.merge(overrides)
          JWT.encode(payload, jwt_secret, 'HS512')
        end
      end

      private

      def settings(context)
        context.root_account.settings.dig(:provision, 'outcomes') || {}
      end
    end
  end
end


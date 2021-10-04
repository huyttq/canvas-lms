# frozen_string_literal: true
require 'nokogiri'

module Qti
class IllustratingInteraction < AssessmentItemConverter
  include Canvas::Migration::XMLHelper

  def initialize(opts)
    super(opts)
  end

  def parse_question_data
    Rails.logger.debug "############IllustratingInteraction #{@doc.to_s}"
    @question[:question_type] = "illustrating_question"

    if @question[:answers].present?
      attach_feedback_values(@question[:answers])
    end

    get_feedback

    meta = @doc.at_css('instructureMetadata')
    if data = get_node_att(meta, 'instructureField[name=kson_data]', 'value')
      ksonData = Nokogiri::HTML.parse data
      @question[:kson_data] = ksonData.text
    end
    if data = get_node_att(meta, 'instructureField[name=illustrating_background_url]', 'value')
      urlData = Nokogiri::HTML.parse data
      @question[:illustrating_background_url] = urlData.text
    end
    Rails.logger.debug "############IllustratingInteraction parse_question_data #{@question.inspect}"

    @question
  end
end
end

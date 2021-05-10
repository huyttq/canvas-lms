class AddDidNotAttendTrainingToQuizSubmission < ActiveRecord::Migration[6.0]
  tag :predeploy

  def change
    add_column :quiz_submissions, :did_not_attend_training, :boolean
  end
end

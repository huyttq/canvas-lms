class AddRequirePhysicalSignatureToQuiz < ActiveRecord::Migration[6.0]
  tag :predeploy

  def change
    add_column :quizzes, :require_physical_signature, :boolean
  end
end

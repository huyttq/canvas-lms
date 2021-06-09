require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper.rb')

describe Quizzes::QuizSubmission do
  context 'with course and quiz' do
    before(:once) do
      course_factory
      @quiz = @course.quizzes.create!
    end

    describe "#merge_submission_data" do
      context 'multiple_dropdowns_question type' do
        it "should clone all answers and lock the question if the result is correct" do
          quiz_with_graded_submission([{:question_data => multiple_dropdowns_question_data}]) do
            {
              "question_#{@questions[0].id}_4e6185159bea49c4d29047379b400ad5" => "6994",
              "question_#{@questions[0].id}_3f507e80e33ef092a02948a064433ec5" => "7676",
              "question_#{@questions[0].id}_78635a3709b540a59678c806b102d038" => "9908",
              "question_#{@questions[0].id}_657b11f1c17376f178c4d80c4c25d0ab" => "1121",
              "question_#{@questions[0].id}_02c8346333761ffe9bbddee7b1c5a537" => "4390",
              "question_#{@questions[0].id}_1865cbc77c83d7571ed8b3a108d11d3d" => "7604",
              "question_#{@questions[0].id}_94239fc44b4f8aaf36bd3596768f4816" => "6955",
              "question_#{@questions[0].id}_cd073d17d0d9558fb2be7d7bf9a1c840" => "3353",
              "question_#{@questions[0].id}_69d0969351d989767d7096f28daf7461" => "3390",
            }
          end

          @quiz_submission.reload
          new_submission = {}
          @quiz_submission.merge_submission_data(new_submission)
          qid = @questions[0].id

          expect(new_submission["question_#{qid}_locked"]).to eq "true"
          expect(new_submission["question_#{qid}_4e6185159bea49c4d29047379b400ad5"]).to eq 6994
          expect(new_submission["question_#{qid}_3f507e80e33ef092a02948a064433ec5"]).to eq 7676
          expect(new_submission["question_#{qid}_78635a3709b540a59678c806b102d038"]).to eq 9908
          expect(new_submission["question_#{qid}_657b11f1c17376f178c4d80c4c25d0ab"]).to eq 1121
          expect(new_submission["question_#{qid}_02c8346333761ffe9bbddee7b1c5a537"]).to eq 4390
          expect(new_submission["question_#{qid}_1865cbc77c83d7571ed8b3a108d11d3d"]).to eq 7604
          expect(new_submission["question_#{qid}_94239fc44b4f8aaf36bd3596768f4816"]).to eq 6955
          expect(new_submission["question_#{qid}_cd073d17d0d9558fb2be7d7bf9a1c840"]).to eq 3353
          expect(new_submission["question_#{qid}_69d0969351d989767d7096f28daf7461"]).to eq 3390
        end

        it "should clone ONLY correct answers and do not lock the question if the result is partial" do
          quiz_with_graded_submission([{:question_data => multiple_dropdowns_question_data}]) do
            {
              "question_#{@questions[0].id}_4e6185159bea49c4d29047379b400ad5" => "1883", #structure6 wrong answer
              "question_#{@questions[0].id}_657b11f1c17376f178c4d80c4c25d0ab" => "9570", #structure7 wrong answer
              "question_#{@questions[0].id}_3f507e80e33ef092a02948a064433ec5" => "7676",
              "question_#{@questions[0].id}_78635a3709b540a59678c806b102d038" => "9908",
              "question_#{@questions[0].id}_02c8346333761ffe9bbddee7b1c5a537" => "4390",
              "question_#{@questions[0].id}_1865cbc77c83d7571ed8b3a108d11d3d" => "7604",
              "question_#{@questions[0].id}_94239fc44b4f8aaf36bd3596768f4816" => "6955",
              "question_#{@questions[0].id}_cd073d17d0d9558fb2be7d7bf9a1c840" => "3353",
              "question_#{@questions[0].id}_69d0969351d989767d7096f28daf7461" => "3390",
            }
          end

          @quiz_submission.reload
          new_submission = {}
          @quiz_submission.merge_submission_data(new_submission)
          qid = @questions[0].id

          expect(new_submission["question_#{qid}_locked"]).to be_nil
          expect(new_submission["question_#{qid}_marked"]).to eq "true"
          expect(new_submission["question_#{qid}_4e6185159bea49c4d29047379b400ad5"]).to be_nil
          expect(new_submission["question_#{qid}_657b11f1c17376f178c4d80c4c25d0ab"]).to be_nil
          expect(new_submission["question_#{qid}_3f507e80e33ef092a02948a064433ec5"]).to eq 7676
          expect(new_submission["question_#{qid}_78635a3709b540a59678c806b102d038"]).to eq 9908
          expect(new_submission["question_#{qid}_02c8346333761ffe9bbddee7b1c5a537"]).to eq 4390
          expect(new_submission["question_#{qid}_1865cbc77c83d7571ed8b3a108d11d3d"]).to eq 7604
          expect(new_submission["question_#{qid}_94239fc44b4f8aaf36bd3596768f4816"]).to eq 6955
          expect(new_submission["question_#{qid}_cd073d17d0d9558fb2be7d7bf9a1c840"]).to eq 3353
          expect(new_submission["question_#{qid}_69d0969351d989767d7096f28daf7461"]).to eq 3390
        end
      end
    end

    describe "#temporary_data" do
      context 'first attempt' do
        it 'should return empty submission data' do
          assignment_quiz([{:question_data => {:name => 'question 1', :points_possible => 1, 'question_type' => 'essay_question'}}])
          quiz_submission = @quiz.generate_submission(@user)
          expect(quiz_submission.temporary_data).to be_empty
        end
      end

      context 'second attempt' do
        it 'should clone submission data from last attempt' do
          quiz_with_graded_submission([{:question_data => {:name => 'question 1', :points_possible => 1, 'question_type' => 'essay_question'}}]) do
            {
              "text_after_answers"            => "",
              "question_#{@questions[0].id}"  => "<p>Lorem ipsum answer.</p>",
              "context_id"                    => "#{@course.id}",
              "context_type"                  => "Course",
              "user_id"                       => "#{@user.id}",
              "quiz_id"                       => "#{@quiz.id}",
              "course_id"                     => "#{@course.id}",
              "question_text"                 => "Lorem ipsum question",
            }
          end

          @quiz_submission.update_scores({
            'context_id' => @course.id,
            'override_scores' => true,
            'context_type' => 'Course',
            'submission_version_number' => '1',
            "question_score_#{@questions[0].id}" => "0"
          })
          @quiz_submission.reload
          # create new attempt
          @quiz_submission = @quiz.generate_submission(@user)
          @quiz_submission.submission_data = { "question_#{@questions[0].id}" => "<p>New answer</p>" }
          expect(@quiz_submission.temporary_data["question_#{@questions[0].id}"]).to eq "<p>New answer</p>"
        end
      end
    end
  end
end

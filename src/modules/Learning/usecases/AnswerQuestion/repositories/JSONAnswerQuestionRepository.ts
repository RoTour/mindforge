import { QuestionSchema, type Question } from '@modules/Learning/entities/Question';
import { QuestionNotFound } from '../../ValidateQuestion/errors/QuestionNotFound';
import * as IAnswerQuestionRepository from './IAnswerQuestionRepository';

type _JSONAnswerQuestionRepository = {
	saveQuestion: IAnswerQuestionRepository.SaveQuestion;
	getQuestion: IAnswerQuestionRepository.GetQuestion;
};

export const JSONAnswerQuestionRepository = (): _JSONAnswerQuestionRepository => {
	const parseQuestions = async (): Promise<Question[]> => {
		let questions: Question[] = [];
		try {
			const data = localStorage.getItem('questions');
			questions = QuestionSchema.array().parse(JSON.parse(data ?? ''));
		} catch {
			questions = [];
		}
		return questions;
	};

	return {
		saveQuestion: async (question) => {
			const questions = await parseQuestions();
			const questionToEdit = questions.find((q) => q.id === question.id);
			if (!questionToEdit) {
				throw new QuestionNotFound(question.id);
			}
			questionToEdit.lastAttemptDate = question.lastAttemptDate;
			questionToEdit.successStreak = question.successStreak;

			console.debug('Questions to save:', questions);

			localStorage.setItem('questions', JSON.stringify(questions));
		},
		getQuestion: async (questionId) => {
			const questions = await parseQuestions();
			return questions.find((question) => question.id === questionId);
		}
	};
};

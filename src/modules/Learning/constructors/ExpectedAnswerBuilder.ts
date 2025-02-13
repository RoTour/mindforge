import type { Question } from '../entities/Question'
import { QuestionAnswerSeparator } from '../entities/Question'

export const ExpectedAnswerBuilder = (question: Question) => {
	return {
		build() {
			const nbOfAnswers = question.answer.split(QuestionAnswerSeparator).length
			const plural = nbOfAnswers > 1 || question.type === 'MULTIPLE_CHOICES'

			const readableAnswer = question.answer.split(QuestionAnswerSeparator).map(a => a.trim()).join(', ')
			return `Expected ${plural ? 'answers' : 'answer'}: ${readableAnswer}`
		}
	}
}
// src/quiz-context/infra/QuestionRepository/PrismaQuestionRepository.int.test.ts
import { PrismaClient } from '$prisma/client';
import { KeyNotion } from '$quiz/domain/KeyNotion.valueObject';
import { Question } from '$quiz/domain/Question.entity';
import { Teacher } from '$quiz/domain/Teacher.entity';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { getPrismaTestClient } from '../../../../test/setupIntegration';
import { PrismaQuestionRepository } from './PrismaQuestionRepository';

describe('PrismaQuestionRepository integration tests', () => {
	let prisma: PrismaClient;
	let repository: PrismaQuestionRepository;
	let author: Teacher;

	beforeAll(() => {
		prisma = getPrismaTestClient();
	});
	beforeEach(async () => {
		repository = new PrismaQuestionRepository(prisma);

		// Arrange: Create a teacher to be the author of the question
		author = Teacher.create({ authUserId: 'test-auth-user' });
		await prisma.teacher.create({ data: { id: author.id.id(), authUserId: author.authUserId } });
	});

	it('should save and retrieve a question with its key notions', async () => {
		// Arrange
		const keyNotions = [
			new KeyNotion({ text: 'DI', description: 'Dependency Injection' }),
			new KeyNotion({
				text: 'IoC',
				description: 'Inversion of Control',
				weight: 0.8,
				synonyms: ['inversion of control']
			})
		];

		const question = Question.create({
			text: 'What is Dependency Injection?',
			authorId: author.id,
			keyNotions: keyNotions
		});

		// Act
		await repository.save(question);
		const retrievedQuestion = await repository.findById(question.id);

		// Assert
		expect(retrievedQuestion).not.toBeNull();
		if (!retrievedQuestion) return;

		expect(retrievedQuestion.id.equals(question.id)).toBe(true);
		expect(retrievedQuestion.text).toBe('What is Dependency Injection?');
		expect(retrievedQuestion.authorId.equals(author.id)).toBe(true);

		// Assert Key Notions
		expect(retrievedQuestion.keyNotions).toHaveLength(2);
		expect(retrievedQuestion.keyNotions).toEqual(keyNotions);

		const iocNotion = retrievedQuestion.keyNotions.find((kn) => kn.text === 'IoC');
		expect(iocNotion).toBeDefined();
		expect(iocNotion?.weight).toBe(0.8);
		expect(iocNotion?.synonyms).toEqual(['inversion of control']);
	});
});

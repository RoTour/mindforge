import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';
import { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';
import { InMemoryQuestionRepository } from '$quiz/question/infra/repositories/InMemoryQuestionRepository';
import { beforeEach, describe, expect, test } from 'vitest';
import { CreateQuestionUsecase, type CreateQuestionCommand } from './CreateQuestion.usecase';
import { NotFoundError } from '$quiz/common/application/errors/NotFoundError';
import { InMemoryTeacherRepository } from '$quiz/teacher/infra/TeacherRepository/InMemoryTeacherRepository';
import { Teacher } from '$quiz/teacher/domain/Teacher.entity';

describe('Unit:CreateQuestion', () => {
	let questionRepository: IQuestionRepository;
	let teacherRepository: InMemoryTeacherRepository;
	let usecase: CreateQuestionUsecase;
	const defaultTeacher = Teacher.create({
		authUserId: 'test-auth-user-id'
	});

	beforeEach(async () => {
		questionRepository = new InMemoryQuestionRepository();
		teacherRepository = new InMemoryTeacherRepository();
		await teacherRepository.save(defaultTeacher);
		usecase = new CreateQuestionUsecase(questionRepository, teacherRepository);
	});

	test('Should save question in repository', async () => {
		// Given
		const command: CreateQuestionCommand = {
			authorId: defaultTeacher.id,
			text: 'What is the capital of France?'
		};

		// When
		const question = await usecase.execute(command);

		// Then
		const savedQuestion = await questionRepository.findById(question.id);
		expect(savedQuestion).not.toBeNull();
	});

	test('Should raise error if teacher does not exist', async () => {
		// Given
		const command: CreateQuestionCommand = {
			authorId: new TeacherId('non-existent-teacher-id'),
			text: 'What is the capital of France?'
		};
		// Removing default teacher importer in beforeEach
		await teacherRepository.clear();

		// When & Then
		await expect(usecase.execute(command)).rejects.toThrowError(NotFoundError);
	});

	test('Should save key notions', async () => {
		const command: CreateQuestionCommand = {
			authorId: defaultTeacher.id,
			text: 'What are the main goals of DDD ?',
			keyNotions: [
				{ text: 'Ubiquitous Language' },
				{ text: 'Bounded Context' },
				{ text: 'Communication', synonyms: ['Collaboration', 'Interaction', 'Business experts'] }
			]
		};

		await usecase.execute(command);

		const savedQuestions = await questionRepository.findByAuthorId(defaultTeacher.id);
		expect(savedQuestions.length).toBe(1);
		expect(savedQuestions[0].keyNotions.at(0)?.text).toEqual(command.keyNotions?.at(0)?.text);
		expect(savedQuestions[0].keyNotions.at(2)?.synonyms?.length).toEqual(
			command.keyNotions?.at(2)?.synonyms?.length
		);
	});
});

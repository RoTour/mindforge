import type { CreateQuestionDto, Question } from '../entities/Question';

export const QuestionBuilder = (dto: CreateQuestionDto) => {
  let generatedOptions: string[] = dto.options ?? [];

  return {
    async withGeneratedOptions(generateOptions: (dto: CreateQuestionDto) => Promise<string[]>) {
      generatedOptions = await generateOptions(dto);
      return this;
    },
    build(): Question {
      return {
        id: crypto.randomUUID(),
        answer: dto.answer,
        conceptId: undefined, // To be implemented later
        lastAttemptDate: undefined,
        prompt: dto.prompt,
        successStreak: 0,
        intervalModifier: 0,
        options: generatedOptions,
        type: dto.type,
      };
    }
  };
};

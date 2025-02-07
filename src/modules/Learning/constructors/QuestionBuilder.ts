import type { CreateQuestionDto, Question } from '../entities/Question';

export const QuestionBuilder = (dto: CreateQuestionDto) => {
  let generatedOptions: string[] = dto.options ?? [];

  return {
    async withGeneratedOptions(generateOptions: (dto: CreateQuestionDto) => Promise<string[]>) {
      generatedOptions = await generateOptions(dto);
      return this;
    },
    safeGenerateId() {
      if (!dto.id) dto.id = crypto.randomUUID();
      return this;
    },
    build(): Question {
      if (!dto.id) this.safeGenerateId();
      return {
        id: dto.id!, // called safeGenerateId() earlier
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

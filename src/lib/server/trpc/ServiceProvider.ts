import { InMemoryPromotionRepository } from '$quiz/infra/PromotionRepository/InMemoryPromotionRepository';
import { ImageStudentListParser } from '$quiz/infra/StudentListParser/ImageStudentListParser';

export const ServiceProvider = {
	PromotionRepository: new InMemoryPromotionRepository(),
	StudentListParser: new ImageStudentListParser()
};

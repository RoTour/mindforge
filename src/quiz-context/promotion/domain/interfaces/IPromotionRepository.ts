import type { Promotion } from '../Promotion.entity';

export interface IPromotionRepository {
	save(promotion: Promotion): Promise<void>;
	findById(id: string): Promise<Promotion | null>;
	findAll(): Promise<Promotion[]>;
	findByOwnerId(teacherId: string): Promise<Promotion[]>;
}

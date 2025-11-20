export type StudentsFromPromotionDTO = {
	id: string;
	name: string;
	lastname?: string;
	email?: string;
	joinedAt?: Date;
	stats: {
		answered: number;
		total: number;
	};
	lastConnection: Date | null;
};

export interface IStudentsOverviewQueries {
	getStudentsFromPromotion: (
		promotionId: string,
		teacherId: string
	) => Promise<Array<StudentsFromPromotionDTO>>;
}

export type StudentsFromPromotionDTO = {
	id: string;
	name: string;
	lastname?: string;
	email?: string;
	joinedAt?: Date;
};

export interface IStudentsOverviewQueries {
	getStudentsFromPromotion: (
		promotionId: string,
		teacherId: string
	) => Promise<Array<StudentsFromPromotionDTO>>;
}

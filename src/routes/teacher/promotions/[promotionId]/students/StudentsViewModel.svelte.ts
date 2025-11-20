import { invalidateAll } from '$app/navigation';
import { createTRPC } from '$lib/trpc';
import type { StudentsFromPromotionDTO } from '$quiz/student/application/interfaces/IStudentsOverviewQueries';

export class StudentsViewModel {
	students = $state<StudentsFromPromotionDTO[]>([]);
	isEditMode = $state(false);
	newStudent = $state<{ firstName: string; lastName: string; email: string } | null>(null);
	selectedStudentIds = $state<Set<string>>(new Set());
	promotionId: string;

	private trpc = createTRPC();

	constructor(initialStudents: StudentsFromPromotionDTO[], promotionId: string) {
		this.students = initialStudents;
		this.promotionId = promotionId;
	}

	toggleEditMode() {
		this.isEditMode = !this.isEditMode;
		if (!this.isEditMode) {
			this.cancelAddingStudent();
			this.selectedStudentIds = new Set(); // Clear selection when exiting edit mode
		}
	}

	toggleSelection(studentId: string) {
		const newSelection = new Set(this.selectedStudentIds);
		if (newSelection.has(studentId)) {
			newSelection.delete(studentId);
		} else {
			newSelection.add(studentId);
		}
		this.selectedStudentIds = newSelection;
	}

	toggleAll(checked: boolean) {
		if (checked) {
			this.selectedStudentIds = new Set(this.students.map((s) => s.id));
		} else {
			this.selectedStudentIds = new Set();
		}
	}

	startAddingStudent() {
		if (this.newStudent) return; // Prevent multiple empty lines
		this.newStudent = { firstName: '', lastName: '', email: '' };
		this.isEditMode = true; // Auto-enable edit mode when adding
	}

	cancelAddingStudent() {
		this.newStudent = null;
	}

	async saveNewStudent() {
		if (!this.newStudent) return;
		if (!this.newStudent.firstName || !this.newStudent.email) {
			alert('First name and email are required');
			return;
		}

		try {
			await this.trpc.student.createStudentForPromotion.mutate({
				promotionId: this.promotionId,
				firstName: this.newStudent.firstName,
				lastName: this.newStudent.lastName,
				email: this.newStudent.email
			});
			this.newStudent = null;
			await invalidateAll();
		} catch (error) {
			console.error('Failed to create student:', error);
			alert('Failed to create student');
		}
	}

	async removeStudent(studentId: string) {
		if (!confirm('Are you sure you want to remove this student?')) return;

		try {
			await this.trpc.student.removeStudentFromPromotion.mutate({
				promotionId: this.promotionId,
				studentId
			});
			this.selectedStudentIds.delete(studentId); // Remove from selection if present
			this.selectedStudentIds = new Set(this.selectedStudentIds); // Trigger reactivity
			await invalidateAll();
		} catch (error) {
			console.error('Failed to remove student:', error);
			alert('Failed to remove student');
		}
	}

	async removeSelectedStudents() {
		if (this.selectedStudentIds.size === 0) return;
		if (
			!confirm(
				`Are you sure you want to remove ${this.selectedStudentIds.size} student${this.selectedStudentIds.size > 1 ? 's' : ''}?`
			)
		)
			return;

		try {
			// Execute removals in parallel
			await Promise.all(
				Array.from(this.selectedStudentIds).map((studentId) =>
					this.trpc.student.removeStudentFromPromotion.mutate({
						promotionId: this.promotionId,
						studentId
					})
				)
			);
			this.selectedStudentIds = new Set();
			await invalidateAll();
		} catch (error) {
			console.error('Failed to remove selected students:', error);
			alert('Failed to remove selected students');
		}
	}
}

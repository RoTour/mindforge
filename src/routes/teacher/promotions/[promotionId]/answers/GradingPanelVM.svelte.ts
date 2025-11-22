import { createTRPC } from '$lib/trpc';
import type { AnswerListItem } from '$quiz/question-session/application/interfaces/ITeacherAnswersQueries';
import { toast } from 'svelte-sonner';

export class GradingPanelVM {
	answer = $state<AnswerListItem>();
	skillsMastered = $state('');
	skillsToReinforce = $state('');
	comment = $state('');
	isSaving = $state(false);
	onGradeSaved: () => void;

	constructor(answer: AnswerListItem, onGradeSaved: () => void) {
		this.answer = answer;
		this.onGradeSaved = onGradeSaved;
		this.updateStateFromAnswer(answer);
	}

	updateStateFromAnswer(answer: AnswerListItem) {
		this.answer = answer;
		this.skillsMastered = answer.teacherGrade?.skillsMastered.join(', ') ?? '';
		this.skillsToReinforce = answer.teacherGrade?.skillsToReinforce.join(', ') ?? '';
		this.comment = answer.teacherGrade?.comment ?? '';
	}

	async handleSave(shouldPublish = false) {
		if (!this.answer) return;

		this.isSaving = true;
		const trpc = createTRPC();
		try {
			await trpc.teacher.answers.gradeAnswer.mutate({
				questionSessionId: this.answer.questionSessionId,
				studentId: this.answer.studentId,
				grade: {
					skillsMastered: this.skillsMastered
						.split(',')
						.map((s) => s.trim())
						.filter((s) => s),
					skillsToReinforce: this.skillsToReinforce
						.split(',')
						.map((s) => s.trim())
						.filter((s) => s),
					comment: this.comment || null
				},
				shouldPublish
			});
			toast.success(shouldPublish ? 'Grade saved and published' : 'Grade saved successfully');
			this.onGradeSaved();
		} catch (e) {
			console.error(e);
			toast.error('Failed to save grade');
		} finally {
			this.isSaving = false;
		}
	}
}

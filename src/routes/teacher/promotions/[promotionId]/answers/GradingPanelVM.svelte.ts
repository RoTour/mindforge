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

	initialSkillsMastered = $state('');
	initialSkillsToReinforce = $state('');
	initialComment = $state('');

	isDirty = $derived(
		this.skillsMastered !== this.initialSkillsMastered ||
			this.skillsToReinforce !== this.initialSkillsToReinforce ||
			this.comment !== this.initialComment
	);

	constructor(answer: AnswerListItem, onGradeSaved: () => void) {
		this.onGradeSaved = onGradeSaved;
		this.updateStateFromAnswer(answer);
	}

	updateStateFromAnswer(answer: AnswerListItem) {
		if (this.answer === answer) return;

		this.answer = answer;
		this.skillsMastered = answer.teacherGrade?.skillsMastered.join(', ') ?? '';
		this.skillsToReinforce = answer.teacherGrade?.skillsToReinforce.join(', ') ?? '';
		this.comment = answer.teacherGrade?.comment ?? '';

		this.initialSkillsMastered = this.skillsMastered;
		this.initialSkillsToReinforce = this.skillsToReinforce;
		this.initialComment = this.comment;
	}

	async handleSave(shouldPublish = false) {
		if (!this.answer) return;

		this.isSaving = true;
		const trpc = createTRPC();
		try {
			await trpc.teacher.answers.gradeAnswer.mutate({
				liveSessionId: this.answer.liveSessionId,
				slotOrder: this.answer.slotOrder,
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

			// Update initial state to match current state so isDirty becomes false
			this.initialSkillsMastered = this.skillsMastered;
			this.initialSkillsToReinforce = this.skillsToReinforce;
			this.initialComment = this.comment;

			this.onGradeSaved();
		} catch (e) {
			console.error(e);
			toast.error('Failed to save grade');
		} finally {
			this.isSaving = false;
		}
	}

	async publishAutoGrade() {
		if (!this.answer) return;

		this.isSaving = true;
		const trpc = createTRPC();
		try {
			await trpc.teacher.answers.publishGrade.mutate({
				liveSessionId: this.answer.liveSessionId,
				slotOrder: this.answer.slotOrder,
				studentId: this.answer.studentId
			});
			toast.success('Auto grade published');
			this.onGradeSaved();
		} catch (e) {
			console.error(e);
			toast.error('Failed to publish auto grade');
		} finally {
			this.isSaving = false;
		}
	}

	transferAutoGrade() {
		if (!this.answer?.autoGrade) return;

		this.skillsMastered = this.answer.autoGrade.skillsMastered.join(', ');
		this.skillsToReinforce = this.answer.autoGrade.skillsToReinforce.join(', ');
		this.comment = this.answer.autoGrade.comment ?? '';

		toast.info('Auto grade content copied to teacher grade');
	}
}

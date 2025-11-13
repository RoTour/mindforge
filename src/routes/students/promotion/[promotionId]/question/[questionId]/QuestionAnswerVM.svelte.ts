// src/routes/students/promotion/[promotionId]/question/[questionId]/QuestionAnswerVM.svelte.ts
import { createTRPC } from '$lib/trpc';
import { goto } from '$app/navigation';

const trpc = createTRPC();

export class QuestionAnswerVM {
    answer = $state('');
    isSubmitting = $state(false);
    error = $state<string | null>(null);

    constructor(
        private readonly promotionId: string,
        private readonly questionSessionId: string
    ) {}

    async submitAnswer() {
        if (!this.answer.trim()) {
            this.error = 'Answer cannot be empty.';
            return;
        }

        this.isSubmitting = true;
        this.error = null;

        try {
            await trpc.questionSession.submitAnswer.mutate({
                promotionId: this.promotionId,
                questionSessionId: this.questionSessionId,
                answerText: this.answer
            });
            // On success, redirect to a "waiting" or "submitted" page.
            // For now, let's redirect back to the lobby.
            await goto(`/students/promotion/${this.promotionId}/lobby`);
        } catch (e: any) {
            this.error = e.message ?? 'An unknown error occurred.';
        } finally {
            this.isSubmitting = false;
        }
    }
}

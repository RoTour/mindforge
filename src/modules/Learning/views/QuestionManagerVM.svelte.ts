// @modules/Learning/views/QuestionManagerVM.svelte.ts
import { RuneStore } from '@redux/runesStore.svelte';
import { store } from '@redux/store';
import { DateTime } from 'luxon';
import { QuestionToUI } from '../mappers/QuestionToUI';
import type { UIQuestion } from './QuestionVM.svelte';

const shuffle = <T>(array: T[]): T[] => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export class QuestionManagerVM {
	private $runeStore = new RuneStore(store);
	public displayedQuestion: UIQuestion | undefined = $derived.by(() => {
		const question = this.$runeStore.state.questions.pendingQuestions.map(QuestionToUI)[0];
		if (!question) return undefined;
		return {
			id: question.id,
			prompt: question.prompt,
			options: shuffle([...question.options]),
			type: question.type
		};
	});

	private dateForNextQuestion: DateTime | null = $derived.by(() => {
		const duration = this.$runeStore.state.questions.timeBeforeNextQuestion;
		if (!duration) return null;
		return DateTime.now().plus(duration);
	});
	private countdownInterval: NodeJS.Timeout | undefined = undefined;

	public countdown: {
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
	} = $state({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0
	});

	constructor() {
		$effect(() => {
			console.debug('EFFECT - QuestionManagerVM', {
				dateForNextQuestion: this.dateForNextQuestion
			});
			if (!this.dateForNextQuestion) {
				this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
				return;
			}
			const duration = this.dateForNextQuestion.diffNow(['days', 'hours', 'minutes', 'seconds']);
			console.debug('EFFECT - QuestionManagerVM', {
				duration
			});
			this.countdown = {
				days: Math.floor(duration.days),
				hours: Math.floor(duration.hours),
				minutes: Math.floor(duration.minutes),
				seconds: Math.floor(duration.seconds),
			};

	clearInterval(this.countdownInterval);
			this.countdownInterval = setInterval(() => {
				if (!this.dateForNextQuestion) return;
				const duration = this.dateForNextQuestion.diffNow(['days', 'hours', 'minutes', 'seconds']);
				console.debug('INTERVAL', { duration });
				this.countdown = {
					days: Math.floor(duration.days),
					hours: Math.floor(duration.hours),
					minutes: Math.floor(duration.minutes),
					seconds: Math.floor(duration.seconds),
				};
			}, 1000);
		});
	}
}

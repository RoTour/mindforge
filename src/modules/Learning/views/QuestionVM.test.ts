import { expect } from '@storybook/test';
import { describe, test } from 'vitest';
import type { UIQuestion } from './QuestionVM.svelte';
import { QuestionVM } from './QuestionVM.svelte';

describe('QuestionVM', () => {
	test('Given a question with SIMPLE type, should not allow multiple answers', () => {
		// Given
		const question = { options: ['1', '2', '3'], type: 'SIMPLE' } as UIQuestion;
		const vm = new QuestionVM({question});
		vm.toggleSelect('1');

		// When
		vm.toggleSelect('2');

		// Then
		expect(vm.propositions).toEqual(['2']);
	});

	test('Given a question with MULTIPLE_CHOICES type, should allow multiple answers', () => {
		// Given
		const question = { options: ['1', '2', '3'], type: 'MULTIPLE_CHOICES' } as UIQuestion;
		const vm = new QuestionVM({question});

		// When
		vm.toggleSelect('1');
		vm.toggleSelect('2');

		// Then
		expect(vm.propositions).toEqual(expect.arrayContaining(['2', '1']));
		expect(vm.propositions.length).toBe(2);
	});
});

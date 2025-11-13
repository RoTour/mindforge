<!-- /Users/rotour/projects/mindforge/src/routes/teacher/create-promotion/AutoGenerateEmailDialog.svelte -->
<script lang="ts">
	import type { CreateStudentDTO } from '$quiz/student/application/dtos/StudentDTO';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog/index.js';

	type Props = {
		students: CreateStudentDTO[];
		open: boolean;
	};
	let { students, open = $bindable() }: Props = $props();

	let emailTemplate = $state('${name}.${lastName}@example.com');
	let templateInput: HTMLInputElement | null = $state(null);

	function sanitizeForEmail(str: string | null | undefined): string {
		if (!str) return '';
		return str
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '') // Remove accents
			.replace(/[^a-zA-Z0-9]/g, ''); // Remove spaces and all other special characters
	}

	function insertTag(tag: string) {
		if (!templateInput) return;
		const start = templateInput.selectionStart ?? emailTemplate.length;
		const end = templateInput.selectionEnd ?? emailTemplate.length;
		emailTemplate = emailTemplate.slice(0, start) + tag + emailTemplate.slice(end);
		templateInput.focus();
		setTimeout(() => {
			if (!templateInput) return;
			templateInput.selectionStart = templateInput.selectionEnd = start + tag.length;
		}, 0);
	}

	function generateEmails() {
		if (!emailTemplate) return;
		students.forEach((student) => {
			const generatedEmail = emailTemplate
				.replace(/\${name}/gi, sanitizeForEmail(student.name))
				.replace(/\${lastName}/gi, sanitizeForEmail(student.lastName));
			student.email = generatedEmail.toLowerCase();
		});
		open = false; // Close the dialog
	}
</script>

<Dialog bind:open>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Auto-generate Emails</DialogTitle>
			<DialogDescription>
				Create an email template using tags. The emails for all students will be updated.
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4 py-4">
			<div>
				<p class="text-sm font-medium">Click to add tags:</p>
				<div class="flex flex-wrap gap-2 pt-2">
					<Button variant="outline" size="sm" onclick={() => insertTag('${name}')}>
						{'${name}'}
					</Button>
					<Button variant="outline" size="sm" onclick={() => insertTag('${lastName}')}>
						{'${lastName}'}
					</Button>
				</div>
			</div>
			<Input bind:ref={templateInput} bind:value={emailTemplate} />
		</div>
		<DialogFooter>
			<Button onclick={generateEmails}>Generate</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

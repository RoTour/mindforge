<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { resolve } from '$app/paths';
	import { Button } from '../ui/button';

	const signOut = () => {
		authClient.signOut();
		goto(resolve('/auth/sign-in'));
	};
</script>

<nav class="flex p-4">
	<div class="ms-auto flex items-center gap-4">
		<Button variant="link" href={resolve('/teacher/promotions')}>My promotions</Button>
		<Button variant="outline" onclick={signOut}>Sign Out</Button>
	</div>
</nav>

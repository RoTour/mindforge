<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { resolve } from '$app/paths';
	import { Button } from '../ui/button';

	const signOut = () => {
		authClient.signOut();
		goto(resolve('/auth'));
	};
</script>

<nav class="flex p-4">
	<Button variant="outline" onclick={signOut} class="ms-auto">Sign Out</Button>
</nav>

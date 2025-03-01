<script lang="ts">
	const octaves = [1, 2, 3, 4, 5, 6, 7];
	const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
	const notesLength = notes.length * octaves.length;

	interface Props {
		highlight: number[];
	}

	let { highlight = [] }: Props = $props();

	// svelte-ignore non_reactive_update
	let midiStart = 24;
	let width = $state<number>();
	let noteWidth = $state<number>(5);
	$effect(() => {
		if (width) {
			noteWidth = width / notesLength;
		}
	});
</script>

<ul bind:clientWidth={width}>
	{#each octaves as o}
		{#each notes as n}
			{@const note = n + o}
			{@const midiWhite = midiStart++}
			<li style:width="{noteWidth}px" class:selected={highlight.includes(midiWhite)}>
				{#if n !== 'E' && n !== 'B'}
					{@const blackKeyWidth = noteWidth / 1.5}
					{@const midiBlack = midiStart++}
					<span
						style:width="{blackKeyWidth}px"
						style:right="-{blackKeyWidth / 2 + 1}px"
						class:selected={highlight.includes(midiBlack)}
					></span>
				{/if}
				{note}
			</li>
		{/each}
	{/each}
</ul>

<style lang="postcss">
	@reference "tailwindcss/theme";

	ul {
		@apply flex w-full;
	}

	li {
		@apply relative flex h-28 items-end justify-center border border-black text-center text-xs text-gray-500;
	}

	li.selected {
		@apply bg-red-500 text-white;
	}

	li span {
		@apply absolute top-0 h-18 bg-black z-10;
	}

	li span.selected {
		@apply bg-red-500;
	}
</style>

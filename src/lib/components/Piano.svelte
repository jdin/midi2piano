<script lang="ts">
	import { midiToNote, toDiezNote, WHITE_PIANO_NOTES } from '$lib/util/piano';
	import { untrack } from 'svelte';

	interface Props {
		midi?: number[];
		tick?: number;
	}

	let { midi = [], tick }: Props = $props();

	let currentTick = $state<number>();
	let chord = $state<string[]>([]);

	$effect(() => {
		if (typeof tick === 'number' && midi.length) {
			const notes = midi.map(midiToNote);
			if (tick == currentTick) {
				// if (!chord.includes(note)) {
				chord = untrack(() =>
					notes.reduce((acc, note) => {
						return acc.includes(note) ? acc : [...acc, note];
					}, chord)
				);
				// }
			} else {
				currentTick = tick;
				chord = [...notes];
			}
		}
	});

	let width = $state<number>();
	let noteWidth = $state<number>(5);
	$effect(() => {
		if (width) {
			noteWidth = width / WHITE_PIANO_NOTES.length;
		}
	});

</script>

<ul bind:clientWidth={width}>
	{#each WHITE_PIANO_NOTES as note}
		<li style:width="{noteWidth}px" class:selected={chord.includes(note)}>
			{#if note[0] !== 'E' && note[0] !== 'B'}
				{@const blackKeyWidth = noteWidth / 1.5}
				<span
					style:width="{blackKeyWidth}px"
					style:right="-{blackKeyWidth / 2 + 1}px"
					class:selected={chord.includes(toDiezNote(note))}
				></span>
			{/if}
			{note}
		</li>
	{/each}
</ul>

<style lang="postcss">
	@reference "tailwindcss/theme";

	ul {
		@apply flex w-full;
	}

	li {
		@apply relative flex h-28 items-end justify-center border border-black text-center text-xs text-gray-500;
		font-size: 7px;
	}

	li.selected {
		@apply bg-red-500 text-white;
	}

	li span {
		@apply absolute top-0 z-10 h-18 bg-black;
	}

	li span.selected {
		@apply bg-red-500;
	}
</style>

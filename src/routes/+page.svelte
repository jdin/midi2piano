<script lang="ts">
	import LeftIcon from '$lib/components/icons/LeftIcon.svelte';
	import PauseIcon from '$lib/components/icons/PauseIcon.svelte';
	import PlayIcon from '$lib/components/icons/PlayIcon.svelte';
	import RightIcon from '$lib/components/icons/RightIcon.svelte';
	import Piano from '$lib/components/Piano.svelte';
	import MidiPlayer, { type Event, type Player } from 'midi-player-js';
	import { SplendidGrandPiano } from 'smplr';
	import { onMount } from 'svelte';
	import type { ChangeEventHandler, MouseEventHandler } from 'svelte/elements';

	let currentIndex = $state(0);
	let totalTicks = $state(0);
	let isPlaying = $state(false);

	let ticks = $state<Record<number, Event[]>>({});

	let player: Player;

	onMount(async () => {
		const ac = new AudioContext();
		const instrument = new SplendidGrandPiano(ac);
		player = new MidiPlayer.Player((event: Event) => {
			if (event.name == 'Note on') {
				currentIndex = Object.keys(ticks).indexOf(String(event.tick));
				instrument.start({
					note: event.noteName!,
					velocity: event.velocity
				});
			}
		});
	});

	const onMidiSelect: ChangeEventHandler<HTMLInputElement> = async (e) => {
		const file = e.currentTarget.files?.[0];
		if (file) {
			player?.stop();
			const array = await file.arrayBuffer();
			player?.loadArrayBuffer(array);
			totalTicks = player?.['totalTicks'];
			ticks = player
				?.getEvents()
				.flatMap((e) => e)
				.filter((n) => n.name === 'Note on')
				.reduce((acc: Record<number, Event[]>, note) => {
					const tick = note.tick;
					const notes = acc[tick] || [];
					return {
						...acc,
						[tick]: [...notes, note]
					};
				}, {});
		}
	};

	function toggle() {
		if (isPlaying) {
			isPlaying = false;
			player?.stop();
		} else {
			isPlaying = true;
			player?.skipToTick(indexToTick(currentIndex));
			player?.play();
		}
	}

	function indexToTick(index: number): number {
		return parseInt(Object.keys(ticks)[index]);
	}

	function chordLeft() {
		if (currentIndex > 0) currentIndex--;
	}

	function chordRight() {
		if (currentIndex < Object.keys(ticks).length - 1) currentIndex++;
	}

	let midi = $state<number[]>([]);
	let tick = $state<number>(0);

	$effect(() => {
		tick = indexToTick(currentIndex);
	});

	$effect(() => {
		const notes = ticks[tick];
		midi = notes?.map((n) => n.noteNumber!);
	});

	function onKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case ' ':
				toggle();
				break;
			case 'ArrowLeft':
				chordLeft();
				break;
			case 'ArrowRight':
				chordRight();
				break;
		}
	}
</script>

<svelte:window onkeydown={onKeyDown} />

<section>
	<title-header class="flex gap-8">
		<input type="file" onchange={onMidiSelect} accept=".mid" />
	</title-header>

	<Piano {midi} {tick} />

	<info>
		<span>{indexToTick(currentIndex) || '0' }</span>
	</info>

	<input
		id="default-range"
		type="range"
		bind:value={currentIndex}
		max={Object.keys(ticks).length}
		class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
	/>

	<toolbar>
		<button disabled={totalTicks === 0} onclick={chordLeft}>
			<LeftIcon />
		</button>
		<button disabled={totalTicks === 0} onclick={toggle}>
			{#if isPlaying}
				<PauseIcon />
			{:else}
				<PlayIcon />
			{/if}
		</button>
		<button disabled={totalTicks === 0} onclick={chordRight}>
			<RightIcon />
		</button>
	</toolbar>
</section>

<style lang="postcss">
	@reference "tailwindcss/theme";

	section {
		@apply container mx-auto flex h-full flex-col gap-3;
	}

	toolbar {
		@apply flex w-full items-center justify-center gap-4;
	}

	button :global(svg) {
		@apply h-10 w-10;
	}

	button:disabled :global(svg) {
		@apply text-gray-200;
	}

	info {
		@apply flex justify-center;
	}
</style>

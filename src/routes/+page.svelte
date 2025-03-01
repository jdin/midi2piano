<script lang="ts">
	import * as ToneMidi from '@tonejs/midi';
	import * as Tone from 'tone';
	import { onMount } from 'svelte';
	import Piano from '$lib/components/Piano.svelte';
	import type { ChangeEventHandler, KeyboardEventHandler } from 'svelte/elements';

	onMount(async () => {
		init(await ToneMidi.Midi.fromUrl('/THE_CHRISTMAS_SONG.mid'));
	});

	let midi: ToneMidi.Midi | undefined = $state();
	let chords: Chords | undefined = $state();
	let times: number[] = $state([]);
	let curTime: number | undefined = $state();

	$effect(() => {
		if (curTime !== undefined) {
			const chord = chords?.[curTime];
			if (chord) playChord(chord);
		}
	});

	function init(_midi: ToneMidi.Midi) {
		midi = _midi;
		console.log(midi);
		chords = midi.tracks.reduce<Chords>((trackAcc, track, index) => {
			return track.notes.reduce<Chords>((acc, note) => {
				const time = note.time;
				const notes = acc?.[time]?.[index] || [];
				return {
					...acc,
					[time]: { [index]: [...notes, note] }
				};
			}, trackAcc);
		}, {});
		times = Object.keys(chords || {})
			.map(parseFloat)
			.sort((a, b) => a - b);
		curTime = times[0];
	}

	const synths: Tone.PolySynth<Tone.Synth<Tone.SynthOptions>>[] = [];
	let highlight = $state<number[]>([]);
	function playChord(chord: InstrumentsChord) {
		while (synths.length) {
			const synth = synths.shift();
			synth?.disconnect();
		}

		highlight = Object.values(chord)
			.flatMap((c) => c)
			.map((n) => n.midi);

		const now = Tone.now();
		Object.values(chord).forEach((notes) => {
			const synth = new Tone.PolySynth(Tone.Synth, {
				envelope: {
					attack: 0.02,
					decay: 0.1,
					sustain: 0.3,
					release: 1
				}
			}).toDestination();
			synths.push(synth);
			//schedule all of the events
			notes.forEach((note) => {
				synth.triggerAttackRelease(note.name, note.duration, now, note.velocity);
			});
		});
	}

	const onMidiSelect: ChangeEventHandler<HTMLInputElement> = async (e) => {
		const file = e.currentTarget.files?.[0];
		if (file) {
			const array = await file.arrayBuffer();
			init(new ToneMidi.Midi(array));
		}
	};

	function goBack() {
		if (curTime != undefined && times) {
			const index = times.indexOf(curTime);
			if (index > 0) {
				curTime = times[index - 1]
			}
		}
	}

	function goForward() {
		if (curTime != undefined && times) {
			const index = times.indexOf(curTime);
			if (index < times.length - 2) {
				curTime = times[index + 1]
			}
		}
	}

	const onKeyDown: KeyboardEventHandler<Window> = e => {
		switch(e.code) {
			case "ArrowRight": {
				goForward();
				break;
			}
			case "ArrowLeft": {
				goBack();
				break;
			}
		}
	}


	let playing: boolean = $state(false);
	function toggleMidiPlay() {
		if (!playing && midi) {
			playing = true;
            const now = Tone.now() + 0.5;
            midi.tracks.forEach((track) => {
                //create a synth for each track
                const synth = new Tone.PolySynth(Tone.Synth, {
                    envelope: {
                        attack: 0.02,
                        decay: 0.1,
                        sustain: 0.3,
                        release: 1,
                    },
                }).toDestination();
                synths.push(synth);
                //schedule all of the events
                track.notes.forEach((note) => {
                    synth.triggerAttackRelease(
                        note.name,
                        note.duration,
                        note.time + now,
                        note.velocity
                    );
                });
            });
        } else {
			playing = false;
            //dispose the synth and make a new one
            while (synths.length) {
                const synth = synths.shift();
                synth?.disconnect();
            }
        }
	}
</script>

<svelte:window onkeydown={onKeyDown} />

<section>
	<h1>Tonejs</h1>

	<h2>Song: '{midi?.name}'</h2>

	<p>Instruments:</p>
	<ul>
		{#each midi?.tracks || [] as track, index}
			<li>{index} - {track.instrument.name}</li>
		{/each}
	</ul>

	<Piano {highlight} />

	<div>
		<input type="file" onchange={onMidiSelect} accept=".mid"/>
	</div>

	<button onclick={toggleMidiPlay}>{playing ? 'Stop' : 'Play'}</button>

	<div>
		<button onclick={goBack}>{'<<'}</button>
		<select bind:value={curTime}>
			<option value="" disabled>-- select chord --</option>
			{#each times as time}
				{@const instrChord = chords!![time as unknown as number]}
				{@const instrs = Object.keys(instrChord)}
				{@const midis = Object.values(instrChord)
					.flatMap((c) => c)
					.map((c) => c.midi)}
				<option value={time}>{JSON.stringify(instrs)} - {JSON.stringify(midis)}</option>
				<!-- <button onclick={() => playChord(instrChord)}>{time} - {JSON.stringify(instrs)} - {JSON.stringify(midis)}</button> -->
			{/each}
		</select>
		<button onclick={goForward}>{'>>'}</button>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss/theme";

	section {
		@apply container mx-auto flex flex-col gap-3;
	}
</style>

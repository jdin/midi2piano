// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Note {
		name: string;
		duration: number;
		midi: number;
		time: number;
		velocity: number;
	}
	type InstrumentsChord = Record<number, Note[]>;
	type Chords = Record<number, InstrumentsChord>;
}

export {};

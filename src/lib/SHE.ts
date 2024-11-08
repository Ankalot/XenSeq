// taken from ./src/Harmonic_Entropy.ipynb in `research` branch

import { HE } from "./HE";


function SHE(notes: number[]): number {
    let SHE_val = 0;
    const numNotes = notes.length;
    
    for (let i = 0; i < numNotes; i++) {
        for (let j = i; j < numNotes; j++) {
            SHE_val += HE(Math.abs(notes[i] - notes[j]));
        }
    }

    return SHE_val*2/(numNotes)/(numNotes+1);
}


function SHE_new_note(SHE_val: number, notes: number[], new_note: number): number {
    let numNotes = notes.length;
    let SHE_new_note_val = SHE_val/2*(numNotes)*(numNotes+1);

    for (let i = 0; i < numNotes; i++) {
        SHE_new_note_val += HE(Math.abs(new_note - notes[i]));
    }
    SHE_new_note_val += HE(0);

    numNotes += 1
    return SHE_new_note_val*2/(numNotes)/(numNotes+1);
}


export function SHE_possible_notes(notes: number[], new_notes: number[]): number[] {
    const num_new_notes = new_notes.length;
    const SHE_val = SHE(notes);
    const SHEs = new Array(num_new_notes).fill(0);

    for (let i = 0; i < num_new_notes; i++) {
        SHEs[i] = SHE_new_note(SHE_val, notes, new_notes[i]);
    }

    return SHEs;
}
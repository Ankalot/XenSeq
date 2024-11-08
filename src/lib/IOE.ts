// taken from ./src/Categorical_Entropy.ipynb in `research` branch

import { sum, square } from 'mathjs';

import { gaussian_cyclic, renyiEntropy } from './Functions';




//calculate note's intervals probabilities of notes
export function NIP(
        cents: number[],          // Array of cents [0; 1200)
        sigma: number,            // Dispersion of every interval in cents
        notes: number[],          // Notes in cents, in [0; 1200)
        notes_noc: number[]       // Notes' numbers of occurrence
        ): number[] {

    const notes_noc_sum = sum(notes_noc);
    const notes_probs = notes_noc.map(n => n/notes_noc_sum); // Probabilities of notes, sum(P_x) = 1
    const numNotes = notes.length;
    const numCents = cents.length;

    let NIP_arr = new Array(cents.length).fill(0);

    for (let i = 0; i < numNotes; i++) {
        for (let j = 0; j < numNotes; j++) {
            const interval = Math.abs(notes[i] - notes[j]);
            const prob = notes_probs[i] * notes_probs[j];
            for (let k = 0; k < numCents; k++) {
                NIP_arr[k] += gaussian_cyclic(cents[k], interval, sigma)*prob;
            }
        }
    }

    return NIP_arr;
}


//calculate note's intervals probabilities of notes + new note
//    NIP of notes without a new one is given
export function NIP_new_note(
        cents: number[],          // Array of cents [0; 1200)
        NIP_arr: number[],
        sigma: number,            // Dispersion of every interval in cents
        notes: number[],          // Notes in cents, in [0; 1200)
        notes_noc: number[],      // Notes' numbers of occurrence
        new_note: number,         // Cents of a new note, in [0; 1200)
        new_note_noc: number      // Number of occurrence of a new note
        ): number[] {
    
    const numCents = cents.length;
    const numNotes = notes.length;

    //adjusting probabilities
    const notes_noc_sum = sum(notes_noc);
    let NIP_new_note_arr = NIP_arr.map(nip => nip * square(notes_noc_sum/(notes_noc_sum + new_note_noc)));

    const notes_probs = notes_noc.map(n => n/(notes_noc_sum + new_note_noc));
    const new_note_prob = new_note_noc/(notes_noc_sum + new_note_noc)

    for (let i = 0; i < numNotes; i++) {
        const interval = Math.abs(notes[i] - new_note);
        const prob = notes_probs[i] * new_note_prob;
        for (let k = 0; k < numCents; k++) {
            NIP_new_note_arr[k] += gaussian_cyclic(cents[k], interval, sigma)*prob;
        }
    }
    for (let k = 0; k < numCents; k++) {
        NIP_new_note_arr[k] += gaussian_cyclic(cents[k], 0, sigma)*new_note_prob*new_note_prob;
    }

    return NIP_new_note_arr;
}


export function IOE(NIP_arr: number[], a: number): number {
    return renyiEntropy(NIP_arr, a);
}


export function IOE_possible_notes(notes: number[], notes_noc: number[], new_notes: number[]) {
    const a = 1.01;
    const sigma = 10;

    const NIP_arr = NIP(new_notes, sigma, notes, notes_noc);

    const num_new_notes = new_notes.length;
    let IOEs = new Array(num_new_notes).fill(0);

    for (let i = 0; i < num_new_notes; i++) {
        const NIP_new_note_arr = NIP_new_note(new_notes, NIP_arr, sigma, notes, notes_noc, new_notes[i], 1);
        IOEs[i] = IOE(NIP_new_note_arr, a);
    }

    return IOEs;
}
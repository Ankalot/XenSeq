// taken from ./src/Categorical_Entropy.ipynb in `research` branch

import { sum } from 'mathjs';

import { gaussian_cyclic, renyiEntropy } from './Functions';




export function RMOE(
        cents: number[],  
        a: number,           // Rényi entropy parameter, 1 < a < +inf
        sigma: number,       // Dispersion of every note in cents
        notes: number[],     // Notes in cents, in [0; 1200)
        notes_noc: number[], // Notes' numbers of occurrence
        ): number {

    const numCents = cents.length;
    const numNotes = notes.length;

    const notes_noc_sum = sum(notes_noc);
    const notes_probs = notes_noc.map(n => n/notes_noc_sum);

    let RMOE = new Array(numCents).fill(0);

    for (let i = 0; i < numNotes; i++) {
        for (let k = 0; k < numCents; k++) {
            RMOE[k] += gaussian_cyclic(cents[k], notes[i], sigma)*notes_probs[i];
        }
    }

    return renyiEntropy(RMOE, a);
}
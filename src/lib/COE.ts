// taken from ./src/Categorical_Entropy.ipynb in `research` branch

import { NIP, NIP_new_note, IOE } from './IOE'
import { RMOE } from './RMOE'
import { normalize } from './Functions'




function COE(RMOE_arr: number[], IOE_arr: number[]): number[] {
    let RMOE_norm = normalize(RMOE_arr);
    const IOE_norm = normalize(IOE_arr);
    for (let i = 0; i < RMOE_norm.length; i++) {
        RMOE_norm[i] *= IOE_norm[i];
    }
    return RMOE_norm;
}


export function COE_possible_notes(notes: number[], notes_noc: number[], new_notes: number[]) {
    const a = 1.01;
    const sigma = 10;

    const cents = Array.from({ length: 1200 }, (_, i) => i);
    const NIP_arr = NIP(cents, sigma, notes, notes_noc);

    const num_new_notes = new_notes.length;
    let IOEs = new Array(num_new_notes).fill(0);
    let RMOEs = new Array(num_new_notes).fill(0);

    for (let i = 0; i < num_new_notes; i++) {
        const NIP_new_note_arr = NIP_new_note(cents, NIP_arr, sigma, notes, notes_noc, new_notes[i], 1);
        IOEs[i] = IOE(NIP_new_note_arr, a);

        RMOEs[i] = RMOE(cents, a, sigma, [...notes, new_notes[i]], [...notes_noc, 1]);
    }

    return COE(RMOEs, IOEs);
}
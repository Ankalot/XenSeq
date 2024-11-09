import { SHE_possible_notes } from '$lib/SHE';
import { COE_possible_notes } from '$lib/COE';   
import { normalize, interpolateArray, findBestKeys } from '$lib/Functions';


type Note = {
    octave: number,   // [0; num_octaves-1]  int       in number
    cents: number,    // [0; 1200)           float     in cents
    time: number,     // [0; num_measures]   float     in measures
    duration: number, // (0; ...)            float     in measures
    velocity: number, // [0; 1]              float
    selected: boolean
}


function calcNewKeys(
        new_keys_active: boolean,
        keys_from_notes: number[],
        notes: Note[],
        alpha: number,
        dCents: number,
        numNewKeys: number
        ): number[] {

    let new_keys: number[] = [];

    if (new_keys_active && keys_from_notes.length > 0) {
        const keys_noc = keys_from_notes.map(key => {
            return notes.filter(note => note.cents === key).length
        });

        const new_keys_potential = Array.from({ length: 1200 }, (_, i) => i);

        const COE_arr = COE_possible_notes(keys_from_notes, keys_noc, new_keys_potential).map(coe => 1 - coe);
        const SHE_arr = normalize(SHE_possible_notes(keys_from_notes, new_keys_potential));


        const COE_SHE_arr = interpolateArray(COE_arr, SHE_arr, alpha);

        new_keys = findBestKeys(COE_SHE_arr, dCents, numNewKeys, new_keys_potential, keys_from_notes);
    }

    return new_keys;
}


self.onmessage = (event: MessageEvent) => {
    self.postMessage(calcNewKeys(
        event.data.new_keys_active,
        event.data.keys_from_notes,
        event.data.notes,
        event.data.alpha,
        event.data.dCents,
        event.data.numNewKeys
    ));
}
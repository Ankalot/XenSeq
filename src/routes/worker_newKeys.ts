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
        use_pitch_memory: boolean,
        basic_keys: number[],
        notes: Note[],
        alpha: number,
        dCents: number,
        numNewKeys: number
        ): number[] {

    let new_keys: number[] = [];

    if (new_keys_active && basic_keys.length > 0) {
        let keys_noc: number[];
        if (use_pitch_memory) {
            keys_noc = new Array(basic_keys.length).fill(1);
        } else {
            keys_noc = basic_keys.map(key => {
                return notes.filter(note => note.cents === key).length
            });
        }

        const new_keys_potential = Array.from({ length: 1200 }, (_, i) => i);

        const COE_arr = COE_possible_notes(basic_keys, keys_noc, new_keys_potential).map(coe => 1 - coe);
        const SHE_arr = normalize(SHE_possible_notes(basic_keys, new_keys_potential));


        const COE_SHE_arr = interpolateArray(COE_arr, SHE_arr, alpha);

        new_keys = findBestKeys(COE_SHE_arr, dCents, numNewKeys, new_keys_potential, basic_keys);
    }

    return new_keys;
}


self.onmessage = (event: MessageEvent) => {
    self.postMessage(calcNewKeys(
        event.data.new_keys_active,
        event.data.use_pitch_memory,
        event.data.basic_keys,
        event.data.notes,
        event.data.alpha,
        event.data.dCents,
        event.data.numNewKeys
    ));
}
// taken from ./src/Pitch_Memory_v2.ipynb in `research` branch

//import { HE_arr } from "./HE_var1";
import { HE_arr } from "./HE_var2";
import percentile from "percentile";


interface Note {
    time: number;
    duration: number;
    octave: number;
    cents: number;
}


interface NoteMemoryTrace {
    time: number;
    duration: number;
    octave: number;
    cents: number;
}


function assertIsNumber(value: any): asserts value is number {
    if (typeof value !== 'number') {
        throw new TypeError('Value is not a number');
    }
}


export function findNotesMemoryTraces(notes: Note[],
                                      endTime: number,
                                      proc: number): NoteMemoryTrace[] {

    let notesMemoryTraces: NoteMemoryTrace[] = [];
    let criterion = percentile(proc, HE_arr);
    assertIsNumber(criterion);

    for (let note of notes) {
        let noteMemoryTraceDuration = endTime - note.time;
        let noteMemoryTraceMinDuration = Math.min(note.duration, noteMemoryTraceDuration)

        for (let otherNote of notes) {
            if (otherNote != note) {
                //if (Math.abs((note.octave*1200+note.cents) - (otherNote.octave*1200+otherNote.cents)) <= 1200) {// EXPERIMENTAL
                    if ((otherNote.time + otherNote.duration > note.time + note.duration) && 
                        (otherNote.time < (note.time + noteMemoryTraceDuration))) {
                        if (HE_arr[Math.min(Math.round(Math.abs((note.octave*1200+note.cents) - (otherNote.octave*1200+otherNote.cents))%1200),
                                            HE_arr.length-1)] > criterion) {
                            noteMemoryTraceDuration = Math.max(noteMemoryTraceMinDuration, otherNote.time - note.time)
                        }
                    }
                //}
            }
        }

        let noteMemoryTrace:NoteMemoryTrace = {
            time: note.time,
            duration: noteMemoryTraceDuration,
            octave: note.octave,
            cents: note.cents
        };
        notesMemoryTraces.push(noteMemoryTrace);
    }

    return notesMemoryTraces;
}
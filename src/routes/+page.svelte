<script lang="ts">
    import tippy from 'tippy.js';
    import * as Tone from 'tone';
    import * as ToneMidi from '@tonejs/midi';
    import { onMount } from 'svelte';

    import ScaleZoneSlider from "./scale_zone_slider.svelte";
    import NoteLine from "./note.svelte";
    import KeyLineComponent from "./key_line.svelte";
    import Sidebar from './sidebar.svelte';
    import PlayButton from './play_button.svelte';
    import Timeline from './timeline.svelte';
    import PanelButton from './panel_button.svelte';
    import NewKeysButton from './new_keys_button.svelte';
    import LoadingIndicator from './loading_indicator.svelte';
    import PitchMemoryButton from './pitch_memory_button.svelte';
    import NoteMemoryTraceLine from './note_memory_trace_line.svelte'

    import { instrumentSampler } from '$lib/Instrument';
    import { findNotesMemoryTraces } from '$lib/Pitch_Memory_v2';


    // TODO:
    // 1) upgrade pitch memory model

    const num_octaves = 6;
    const octave_height_px_no_scale = 300;

    const num_measures_min = 6;
    const measure_width_px_no_scale = 300;

    let panel_scale = $state(1);
    let measure_width_px = $derived(measure_width_px_no_scale * panel_scale);
    let octave_height_px = $derived(octave_height_px_no_scale * panel_scale);

    const min_note_duration = 1/32;
    let default_note_duration = 1/4;
    let default_note_velocity = 1.0;

    let beats_per_measure = $state(4);
    let divisions_of_beat = $state(4);
    let bpm = $state(110);

    let velocity_input = $state(1);
    let show_velocity_input = $state(false);

    type Note = {
        octave: number,   // [0; num_octaves-1]  int       in number
        cents: number,    // [0; 1200)           float     in cents
        time: number,     // [0; num_measures]   float     in measures
        duration: number, // (0; ...)            float     in measures
        velocity: number, // [0; 1]              float
        selected: boolean
    }
    let notes: Note[] = $state([]);

    function cents2y(cents: number, octave?: number): number {
        if (octave !== undefined) {
            return (num_octaves - (octave + cents/1200))*octave_height_px;
        } else {
            return (num_octaves - cents/1200)*octave_height_px;
        }
    }

    function y2cents(y: number): number {
        return (num_octaves*octave_height_px - y)%octave_height_px*1200/octave_height_px;
    }

    function y2octave(y: number): number {
        return Math.floor((num_octaves*octave_height_px - y)/octave_height_px);
    }

    function time2x(time: number): number {
        return time*measure_width_px;
    }

    function x2time(x: number): number {
        return x/measure_width_px;
    }

    function measures2seconds(measures: number): number {
        return measures*beats_per_measure/bpm*60;
    }

    function seconds2measures(time: number): number {
        return time/beats_per_measure*bpm/60;
    }

    let num_measures = $derived(
        Math.max(
            num_measures_min,
            Math.floor(
                notes.reduce(
                    (max, curr) => (time2x(curr.time) > max ? time2x(curr.time) : max),
                    0
                ) / measure_width_px
            ) + 3
        )
    );


    let keys_from_notes_active = $state(false);
    let new_keys_active = $state(false);
    let new_keys_use_pitch_memory = $state(true);

    // keys when new_keys_active 
    let new_keys: number[] = $state([]);

    // keys when keys_from_notes_active
    let keys_from_notes: number[] = $derived(
        notes
        .filter(note => (time2x(note.time + note.duration) > scale_zone_factor*scale_zone_range[0]
                         && time2x(note.time) < scale_zone_factor*scale_zone_range[1]))
        .filter((obj, index, self) =>
            index === self.findIndex((t) => t.cents === obj.cents))
        .map(item => item.cents).sort((a, b) => a - b)
    );

    // new_keys + keys_from_notes
    let keys: number[] = $derived(
        (keys_from_notes_active ? keys_from_notes.concat(new_keys).sort((a, b) => a - b) : new_keys)
    );

    let alpha = $state(0.5);
    let dCents = $state(25);
    let numNewKeys = $state(3);

    let worker_newKeys: Worker;
    let computingNewKeys = $state(false);

    // calculating new keys
    $effect(() => {       
        if (worker_newKeys != undefined) {
            worker_newKeys.terminate();
            computingNewKeys = false;
        }

        worker_newKeys = new Worker(new URL(`./worker_newKeys.ts`, import.meta.url), {type: 'module'});
        worker_newKeys.onmessage = (event: MessageEvent) => {
            computingNewKeys = false;
            new_keys = event.data;
        };

        let basic_keys: number[];
        if (new_keys_use_pitch_memory) {
            basic_keys = notesMemoryTraces
                .filter(nmt => (time2x(nmt.time + nmt.duration + 0.001) >= scale_zone_factor*scale_zone_range[1]))
                .filter((obj, index, self) => index === self.findIndex((t) => t.cents === obj.cents))
                .map(item => item.cents).sort((a, b) => a - b)
        } else {
            basic_keys = $state.snapshot(keys_from_notes);
        }

        worker_newKeys.postMessage({
            new_keys_active: $state.snapshot(new_keys_active),
            use_pitch_memory: $state.snapshot(new_keys_use_pitch_memory),
            basic_keys: basic_keys,
            notes: $state.snapshot(notes),
            alpha: $state.snapshot(alpha),
            dCents: $state.snapshot(dCents),
            numNewKeys: $state.snapshot(numNewKeys)
        });

        if (new_keys_active) {
            computingNewKeys = true;
        }
    });

    // array of all keys with octave transpositions
    //    boolean indicates whether a note is currently played manually using keyboard
    let keys_are_played: boolean[][] = $state([]);
    $effect(() => {
        keys_are_played = Array.from(
            { length: num_octaves },
            () => Array(keys.length).fill(false)
        );
    });

    let scale_zones_and_timeline_movable: HTMLDivElement;
    let keyboard: HTMLDivElement;
    let panel_wrapper: HTMLDivElement;

    function handleScroll() {
        const scrollLeft = panel_wrapper.scrollLeft;
        scale_zones_and_timeline_movable.style.transform = `translateX(${-scrollLeft}px)`;

        const scrollTop = panel_wrapper.scrollTop;
        keyboard.style.transform = `translateY(${-scrollTop}px)`;
    }

    function handleWheel(event: WheelEvent) {
        if (event.ctrlKey) {
            event.preventDefault();
            const delta = event.deltaY;
            panel_scale += delta * -0.001;
            panel_scale = Math.min(Math.max(0.125, panel_scale), 4);
        }
    }


    const closestValue = (arr: number[], x: number) => {
        return arr.reduce((prev, curr) => {
            return (Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev);
        });
    };

    function handlePanelMouseDown(event: MouseEvent) {
        if (event.button == 0) {
            notes.forEach(note => note.selected=false);
            const svg = event.currentTarget as SVGElement;
            const rect = svg.getBoundingClientRect();
            let x = event.clientX - rect.left; // Calculate x position relative to SVG
            const y = event.clientY - rect.top;  // Calculate y position relative to SVG

            if (snap_notes_to_grid_active) {
                const x_step = measure_width_px/(divisions_of_beat*beats_per_measure)
                x = Math.floor(x/x_step)*x_step;
            }

            if ((keys_from_notes_active || new_keys_active) && keys.length != 0) {
                const cents_y = y2cents(y);
                const cents_key = closestValue(keys, cents_y);
                const octave = y2octave(y);
                notes.push({octave: octave, cents: cents_key, time: x2time(x),
                             duration: default_note_duration, velocity: default_note_velocity,
                             selected: false});
            } else {
                notes.push({octave: y2octave(y), cents: y2cents(y), time: x2time(x),
                             duration: default_note_duration, velocity: default_note_velocity,
                             selected: false});
            }
        }
    }

    function removeNote(i: number) {
        notes.splice(i, 1);
    }

    function selectNote(i: number, shiftKey: boolean) {
        if (!notes[i].selected) {
            notes[i].selected = true;
            if (!shiftKey) {
                notes.forEach((note, index) => {if (index != i) note.selected=false});
            }
        }
    }    


    function startNoteDragging(i: number, x: number, y: number) {
        const selectedNotes = notes.filter(note => note.selected);
        
        function mouseMoveHandler(moveEvent: MouseEvent) {
            const dx = moveEvent.clientX - x;
            const dy = moveEvent.clientY - y;

            selectedNotes.forEach(note => {
                note.time = x2time(time2x(note.time) + dx);

                if (note.time < 0) {
                    note.time = 0;
                }

                if (!keys_from_notes_active && !new_keys_active) {
                    const new_y = cents2y(note.cents, note.octave) + dy;
                    note.cents = y2cents(new_y);
                    note.octave = y2octave(new_y);

                    if (note.octave < 0) {
                        note.octave = 0;
                        note.cents = 0;
                    } else if (note.octave > num_octaves - 1) {
                        note.octave = num_octaves - 1;
                        note.cents = 1199;
                    }
                }
            });

            x = moveEvent.clientX;
            y = moveEvent.clientY;
        }

        function mouseUpHandler() {
            if (snap_notes_to_grid_active) {
                selectedNotes.forEach(note => {
                    const x_step = measure_width_px/(divisions_of_beat*beats_per_measure);
                    note.time = x2time(Math.round(time2x(note.time)/x_step)*x_step);
                });
            }
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', mouseUpHandler);
        }

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', mouseUpHandler);
    }


    function startNoteResizing(i: number, x: number) {       
        const selectedNotes = notes.filter(note => note.selected);
        
        function mouseMoveHandler(moveEvent: MouseEvent) {
            const dx = moveEvent.clientX - x;

            selectedNotes.forEach(note => {
                note.duration += x2time(dx);
                if (note.duration < min_note_duration) {
                    note.duration = min_note_duration;
                }
                default_note_duration = note.duration;
            });

            x = moveEvent.clientX;
        }

        function mouseUpHandler() {
            if (snap_notes_to_grid_active) {
                selectedNotes.forEach(note => {
                    const x_step = measure_width_px/(divisions_of_beat*beats_per_measure);
                    note.duration = x2time(Math.max(Math.round(time2x(note.duration)/x_step), 1)*x_step);
                    default_note_duration = note.duration;
                });
            }
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', mouseUpHandler);
        }

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', mouseUpHandler);
    }


    function changeNoteVelocity(index: number) {
        show_velocity_input = !show_velocity_input;
        velocity_input = notes[index].velocity;
        notes[index].selected = true;
    }

    function onInputVelocityInput() {
        notes.filter(note => note.selected).forEach(note => {
            note.velocity = velocity_input;
        });
        //default_note_velocity = velocity_input;
    }


    // ===================
    // ==== KEYBOARD  ====
    // ===================

    let entered_number = $state('');
    let show_entered_number = $state(false);
    let entered_number_timeout: number | undefined;

    const keyboardKeys = [
        "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", 
        "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote",
        "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", 
    ];
    const baseKeyboardOctave = 1;

    function fadeEnteredNumber() {
        show_entered_number = false;
        clearTimeout(entered_number_timeout);
        entered_number = '';
    }

    function showEnteredNumber() {
        show_entered_number = true;

        clearTimeout(entered_number_timeout);
        entered_number_timeout = window.setTimeout(() => {
            fadeEnteredNumber();
        }, 3000);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.code === "Delete") {
            notes = notes.filter(note => !note.selected);
        } 
        
        if (event.code == "Escape") {
            notes.forEach(note => note.selected = false);
            fadeEnteredNumber();
            show_velocity_input = false;
        }

        if (event.ctrlKey && event.code == "KeyA") {
            event.preventDefault();
            notes.forEach(note => note.selected = true);
            return;
        }

        if (event.code == "Space") {
            event.preventDefault();
            play();
        }

        // set cents of selected note(-s)
        if (notes.some(note => note.selected)) {
            if (event.key >= '0' && event.key <= '9' || event.key === ".") {
                entered_number += event.key;
                showEnteredNumber();
                return;
            }

            if (event.key === "Enter") {
                const cents = Number(entered_number)
                if (isFinite(cents)) {
                    notes.forEach(note => {
                        if (note.selected) {
                            note.cents = cents % 1200;
                            note.octave += Math.floor(cents/1200);
                            if (note.octave > num_octaves - 1) {
                                note.octave = num_octaves - 1;
                            }
                        }
                    })
                }
                fadeEnteredNumber();
            }

            if (event.key === "Backspace") {
                entered_number = entered_number.slice(0, -1);
            }
        }

        // play a key if in "keys from notes" mode
        if ((keys_from_notes_active || new_keys_active) && keyboardKeys.includes(event.code)) {
            const keyInd = keyboardKeys.indexOf(event.code);
            const numKeys = keys.length;
            const octave = baseKeyboardOctave + Math.floor(keyInd/numKeys);
            if (octave < num_octaves && !keys_are_played[octave][keyInd % numKeys]) {
                if (octave < num_octaves) {
                    const key = keys[keyInd % numKeys];
                    sampler_extra.triggerAttack(cents2hz(key, octave));
                    keys_are_played[octave][keyInd % numKeys] = true;
                }
            }
        }

        // move notes
        if (event.code === "ArrowUp") {
            event.preventDefault();
            if (event.shiftKey) {
                notes.filter(note => note.selected).forEach(note => {
                    if (note.octave < num_octaves - 1) {
                        note.octave += 1;
                    }
                });
            } else {
                notes.filter(note => note.selected).forEach(note => {
                    note.octave = note.octave + Math.floor((note.cents + 1) / 1200); 
                    note.cents = (note.cents + 1) % 1200;
                    if (note.octave >= num_octaves) {
                        note.octave = num_octaves - 1;
                        note.cents = 1199;
                    }
                })
            }
        }

        // move notes
        if (event.code === "ArrowDown") {
            event.preventDefault();
            if (event.shiftKey) {
                notes.filter(note => note.selected).forEach(note => {
                    if (note.octave > 0) {
                        note.octave -= 1;
                    }
                });
            } else {
                notes.filter(note => note.selected).forEach(note => {
                    if (note.cents < 1) {
                        if (note.octave > 0) {
                            note.cents = 1200 + note.cents - 1;
                            note.octave -= 1;
                        } else {
                            note.cents = 0;
                        }
                    } else {
                        note.cents -= 1;
                    }
                });
            }
        }
    }

    function handleKeyup(event: KeyboardEvent) {
        // release a key if in "keys from notes" mode
        if ((keys_from_notes_active || new_keys_active) && keyboardKeys.includes(event.code)) {
            const keyInd = keyboardKeys.indexOf(event.code);
            const numKeys = keys.length;
            const octave = baseKeyboardOctave + Math.floor(keyInd/numKeys);
            if (octave < num_octaves && keys_are_played[octave][keyInd % numKeys]) {
                if (octave < num_octaves) {
                    const key = keys[keyInd % numKeys];
                    sampler_extra.triggerRelease(cents2hz(key, octave));
                    keys_are_played[octave][keyInd % numKeys] = false;
                }
            }
        }
    }


    function tooltip(node: HTMLElement, options: {content: string}) {
        const instance = tippy(node, options);
        return {
            destroy() {
                instance.destroy();
            }
        };
    }


    let sidebar_is_opened = $state(false);
    let scale_zone_cents_active = $state(false);
    let show_grid_active = $state(true);
    let snap_notes_to_grid_active = $state(true); 


    let scale_zone_min = 0;
    let scale_zone_max = $derived(num_measures*beats_per_measure*divisions_of_beat);
    // svelte-ignore state_referenced_locally
    let scale_zone_range = $state([scale_zone_min, scale_zone_max]);
    let scale_zone_factor = $derived(num_measures*measure_width_px/scale_zone_max);

    // is used for selected notes or "show cents of notes in scale zone" mode
    type KeyLine = {y_px: number, cents: number};
    let keyLines: KeyLine[] = $derived(
        (scale_zone_cents_active ? 
            notes.filter(note => (
                    time2x(note.time + note.duration) > scale_zone_factor*scale_zone_range[0]
                    && time2x(note.time) < scale_zone_factor*scale_zone_range[1]
                )
            )
        :
            notes.filter(note => note.selected)
        )
        .map(({octave, cents, time, duration, selected}) => ({
            y_px: cents2y(cents, octave),
            cents: cents}))
        .filter((obj, index, self) =>
            index === self.findIndex((t) => t.y_px === obj.y_px)
        )
    );


    function exportFile(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function exportSequence() {
        // EXPORT MIDI (.mid)
        const midi = new ToneMidi.Midi();
        midi.header.setTempo(bpm);
        midi.header.timeSignatures.push({ ticks: 0, timeSignature: [beats_per_measure, 4] });
        const track = midi.addTrack();

        const keys = notes.filter((obj, index, self) =>
            index === self.findIndex((t) => t.cents === obj.cents))
        .map(item => item.cents).sort((a, b) => a - b);
        const num_notes_in_scale = keys.length;

        notes.forEach(note => {
            track.addNote({
                midi: note.octave*num_notes_in_scale + keys.indexOf(note.cents),
                time: measures2seconds(note.time),
                duration: measures2seconds(note.duration),
                velocity: note.velocity,
            });
        });
        
        const midiData = midi.toArray();
        const midiBlob = new Blob([new Uint8Array(midiData)], { type: 'audio/midi' });
        exportFile(midiBlob, 'output.mid');

        // EXPORT SCALA (.scl)
        const scalaData = `! output.scl \n ${num_notes_in_scale} \n!\n ${
            keys.map(key => key.toFixed(2)).join('\n ')}`;
        const scalaBlob = new Blob([scalaData], { type: 'audio/scala' });
        exportFile(scalaBlob, 'output.scl');
    }


    function importSequence(event: Event) {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        if (!files) return;

        const fileArray = Array.from(files);
        const midFile = fileArray.find(file => file.name.endsWith('.mid'));
        const sclFile = fileArray.find(file => file.name.endsWith('.scl'));

        if (midFile && sclFile) {
            let keys: number[];

            const reader = new FileReader(); // Create a FileReader instance
            reader.onload = function(e: ProgressEvent<FileReader>) {
                if (!e.target) return;
                const content = e.target.result as string; // Get the file content
                if (!content) return;
                keys = content.substring(content.lastIndexOf('!') + 1).trim().split(/\s+/).map(Number);

                const midiReader = new FileReader();
                midiReader.onload = function(emidi: ProgressEvent<FileReader>) {
                    if (!emidi.target) return;
                    const content = emidi.target.result as ArrayBuffer;
                    if (!content) return;
                    const midi = new ToneMidi.Midi(content);

                    bpm = midi.header.tempos[0].bpm;
                    beats_per_measure = midi.header.timeSignatures[0].timeSignature[0];
                    
                    notes = midi.tracks.flatMap(track => 
                        track.notes.map(note => ({
                            octave: Math.floor(note.midi / keys.length),
                            cents: keys[note.midi % keys.length],
                            time: seconds2measures(note.time),
                            duration: seconds2measures(note.duration),
                            velocity: note.velocity,
                            selected: false
                        }))
                    );
                }
                midiReader.readAsArrayBuffer(midFile);
            };
            reader.readAsText(sclFile);
        }
    }


    let show_notes_memory_traces = $state(false);
    let pitch_memory_perc = $state(30);

    type NoteMemoryTrace = {
        time: number;
        duration: number;
        octave: number;
        cents: number;
    }
    let notesMemoryTraces: NoteMemoryTrace[] = $derived(
        findNotesMemoryTraces(
            notes.filter(note => (time2x(note.time + note.duration) > scale_zone_factor*scale_zone_range[0]
                         && time2x(note.time) < scale_zone_factor*scale_zone_range[1])),
            x2time(scale_zone_factor*scale_zone_range[1]),
            pitch_memory_perc
        )
    );


    let currentInstrument = $state('piano');

    let isPlaying = $state(false);
    let timelineValue = $state(0);
    let min_freq = $state(32.7);
    let sampler: Tone.Sampler;
    let vol: Tone.Volume;
    let volume = $state(0.7);

    let sampler_extra: Tone.Sampler;

    function updateSamplers() {
        if (sampler) {sampler.releaseAll(); sampler.unsync()};
        sampler = instrumentSampler(currentInstrument);
        sampler.connect(vol);
        sampler.sync();
        if (sampler_extra) sampler_extra.releaseAll();
        sampler_extra = instrumentSampler(currentInstrument);
        sampler_extra.connect(vol);
    }

    function notesToSampler() {
        sampler.unsync(); // unsync-sync deletes triggerAttackRelease
        sampler.sync();
        notes.forEach(note => {
            sampler.triggerAttackRelease(
                cents2hz(note.cents, note.octave), 
                measures2seconds(note.duration),
                measures2seconds(note.time),
                note.velocity
            );
        });
    }

    onMount(() => {
        // this is necessary so that the components from the top panel fit correctly
        handleScroll(); 

        // init samplers
        vol = new Tone.Volume(20 * Math.log10(volume)).toDestination();
        updateSamplers();

        // move timeline slider
        Tone.getTransport().scheduleRepeat((time) => {
            timelineValue = Tone.getTransport().seconds;
        }, "64n");

        // when playing you can add notes and they will be played
        $effect(() => {
            notesToSampler();
        });
    });

    function cents2hz(cents: number, octave: number) {
        return min_freq*Math.pow(2, (octave+cents/1200));
    }

    async function startAudio() {
        await Tone.start();
        console.log("audio is ready");
    }

    function play() {
        if (!isPlaying) {
            startAudio();

            notesToSampler();
            //Tone.getTransport().bpm.value = bpm;
            //Tone.getTransport().timeSignature = [beats_per_measure, 4];
            Tone.getTransport().start();

            isPlaying = true;
        } else {
            sampler.releaseAll();
            sampler.unsync(); // i hope unsync-sync deletes triggerAttackRelease
            sampler.sync();
            Tone.getTransport().stop();
            Tone.getTransport().seconds = 0;
            timelineValue = Tone.getTransport().seconds;
            
            isPlaying = false;
        }
    }

    function measureClick(event: MouseEvent, measureInd: number) {
        const div = event.currentTarget as HTMLElement;
        const rect = div.getBoundingClientRect();
        const x = event.clientX - rect.left;

        Tone.getTransport().seconds = measures2seconds(x/measure_width_px + measureInd);
        timelineValue = Tone.getTransport().seconds;
        
        play();
    }

    function handleKeyMousedown(octave: number, keyInd: number) {
        if (!keys_are_played[octave][keyInd]) {
            const key = keys[keyInd];
            sampler_extra.triggerAttack(cents2hz(key, octave));
            keys_are_played[octave][keyInd] = true;
        }
    }

    function handleKeyMouseup(octave: number, keyInd: number) {
        if (keys_are_played[octave][keyInd]) {
            const key = keys[keyInd];
            sampler_extra.triggerRelease(cents2hz(key, octave));
            keys_are_played[octave][keyInd] = false;
        }
    }
</script>


<svelte:window onkeydown={handleKeydown} onkeyup={handleKeyup}/>

<LoadingIndicator active={computingNewKeys}/>

<div id="entered_number_sign" style="--opacity: {show_entered_number ? 1 : 0}">
    {entered_number}
</div>

<div id = "velocity_input_wrapper" style=  "display: {show_velocity_input ? "block" : "none"};">
    <input
        oninput={onInputVelocityInput}
        id = "velocity_input"
        bind:value={velocity_input}
        type="range"
        min="0"
        max="1"
        step=".01"
    />
</div>

<svelte:head>
	<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet"/>
</svelte:head>
<Sidebar bind:open={sidebar_is_opened}/>

<div id = "sequencer">
    <div id = "scale_zones_and_timeline_wrapper">
        <div id = "blank">
            <PlayButton
                handleOnclick={play}
                isPlaying={isPlaying}
            />

            <div style="margin-top: 15px; margin-left: 5px;"
            use:tooltip={{ content: '0 cents Octave 0, Hz' }}>
                <input 
                    id = "min_freq_input"
                    bind:value={min_freq}
                    type="number"
                    min="1"
                    max="9999"
                />
            </div>
        </div>

        <div id = "scale_zones_and_timeline_movable" bind:this={scale_zones_and_timeline_movable}>
            <div id = "scale_zone_slider_wrapper">
                <ScaleZoneSlider min_val={scale_zone_min} max_val={scale_zone_max} 
                bind:values={scale_zone_range}/>
            </div>
            <Timeline
                isPlaying={isPlaying}
                playhead_x={seconds2measures(timelineValue)*measure_width_px}
                num_measures={num_measures}
                measure_width_px={measure_width_px}
                handleMeasureClick={measureClick}
            />
        </div>
    </div>

    <div id = "keyboard_and_panel_wrapper">
        <div id = "keyboard_wrapper">
            <div id = "keyboard" style = "height: {num_octaves*octave_height_px}px;"
                    bind:this={keyboard} onscroll={handleScroll}>
                <svg width={120} height={num_octaves*octave_height_px}>
                    {#each Array(num_octaves+1) as _, index}
                        <line 
                            x1="0" 
                            y1={index * octave_height_px} 
                            x2={120} 
                            y2={index * octave_height_px} 
                            stroke="var(--very-dark)" 
                            stroke-width="3"
                        />
                    {/each}

                    {#each Array(num_octaves) as _, index}
                        <text x="18" y="{octave_height_px * (0.5 + index)}" fill="var(--very-dark)"
                        text-anchor="middle" transform="rotate(-90, 18, {octave_height_px * (0.5 + index)})"
                        style="user-select: none;">
                            {"OCTAVE " + (num_octaves - index - 1)}
                        </text>
                    {/each}

                    {#if keys_from_notes_active || new_keys_active}
                        {#each Array.from({ length: num_octaves }) as _, octave}
                            {#each keys as key, index}
                                <KeyLineComponent y_px={(num_octaves - octave-key/1200)*octave_height_px}
                                 cents={key} len_px={20} keyboard={true} text_shift={-40*(index%2)}
                                 is_played={keys_are_played[octave][index]}
                                 is_new_key={new_keys.includes(key)}
                                 keyOnMousedown={() => handleKeyMousedown(octave, index)}
                                 keyOnMouseup={() => handleKeyMouseup(octave, index)}
                                 />
                            {/each}
                        {/each}
                    {:else}
                        {#each keyLines as {y_px, cents}, index}
                            <KeyLineComponent y_px={y_px} cents={cents} len_px={20} keyboard={true}/>
                        {/each}
                    {/if}
                </svg>
            </div>
        </div>
        
        <div id = "panel_raw_wrapper" bind:this={panel_wrapper} onscroll={handleScroll}>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div id = "panel" style="height: {num_octaves*octave_height_px}px; width: {num_measures*measure_width_px}px"
            oncontextmenu={(e) => {e.preventDefault();}}>
                <svg width={num_measures*measure_width_px} height={num_octaves*octave_height_px} role="presentation"
                onmousedown={handlePanelMouseDown}
                onwheel={handleWheel}>

                    {#each Array(num_octaves+1) as _, index}
                        <line 
                            x1="0" 
                            y1={index * octave_height_px} 
                            x2={num_measures * measure_width_px} 
                            y2={index * octave_height_px} 
                            stroke="var(--very-dark)"
                            stroke-width="3"
                        />
                    {/each}

                    {#each Array(num_measures+1) as _, index}
                        <line 
                            x1={index * measure_width_px} 
                            y1={0} 
                            x2={index * measure_width_px} 
                            y2={num_octaves*octave_height_px} 
                            stroke="var(--very-dark)"
                            stroke-width="3"
                        />
                    {/each}

                    {#if show_grid_active}
                        {#each Array(num_measures+1) as _, measure_ind}
                            {#each Array(beats_per_measure) as _, beats_ind}
                                <line 
                                    x1={(measure_ind + beats_ind/beats_per_measure) * measure_width_px} 
                                    y1={0}
                                    x2={(measure_ind + beats_ind/beats_per_measure) * measure_width_px} 
                                    y2={num_octaves*octave_height_px} 
                                    stroke="var(--background-dark)"
                                    stroke-width="2"
                                />
                                {#each Array(divisions_of_beat) as _, division_ind}
                                    <line 
                                        x1={(measure_ind + (beats_ind + division_ind/divisions_of_beat)/beats_per_measure)
                                            * measure_width_px}
                                        y1={0}
                                        x2={(measure_ind + (beats_ind + division_ind/divisions_of_beat)/beats_per_measure)
                                            * measure_width_px}
                                        y2={num_octaves*octave_height_px} 
                                        stroke="var(--background-dark)"
                                        stroke-width="1"
                                    />
                                {/each}
                            {/each}
                        {/each}
                    {/if}

                    {#if keys_from_notes_active || new_keys_active}
                        {#each Array.from({ length: num_octaves }) as _, octave}
                            {#each keys as key, index}
                                <KeyLineComponent y_px={(num_octaves - octave-key/1200)*octave_height_px}
                                cents={key} len_px={num_measures*measure_width_px} keyboard={false} 
                                is_new_key={new_keys.includes(key)}/>
                            {/each}
                        {/each}
                    {:else}
                        {#each keyLines as {y_px, cents}, index}
                            <KeyLineComponent y_px={y_px} cents={cents} len_px={num_measures*measure_width_px} keyboard={false}/>
                        {/each}
                    {/if}

                    {#each notes as {octave, cents, time, duration, velocity, selected}, index}
                        <NoteLine 
                            note_x_px={time2x(time)}
                            note_y_px={cents2y(cents, octave)}
                            note_length={time2x(duration)}
                            velocity={velocity}
                            selected={selected}
                            removeNote = {() => removeNote(index)}
                            selectNote = {(shiftKey) => selectNote(index, shiftKey)}
                            startDragging = {(x, y) => startNoteDragging(index, x, y)}
                            startResizing = {(x) => startNoteResizing(index, x)}
                            changeNoteVelocity = {() => changeNoteVelocity(index)}
                        />
                    {/each}

                    {#if show_notes_memory_traces}
                        {#each notesMemoryTraces as {time, duration, octave, cents}, index}
                            <NoteMemoryTraceLine
                                x_px={time2x(time)}
                                length_px={time2x(duration)}
                                y_px={cents2y(cents, octave)}
                            />
                        {/each}
                    {/if}

                    {#if isPlaying}
                        <line
                        x1={seconds2measures(timelineValue)*measure_width_px} 
                        y1={0} 
                        x2={seconds2measures(timelineValue)*measure_width_px} 
                        y2={num_octaves*octave_height_px} 
                        stroke="var(--green)"
                        stroke-width="2"
                        />
                    {/if}
                </svg>
            </div>
        </div>
    </div>

    <div id = "bottom_panel_wrapper">
        <PanelButton
            tooltip_text="Show help"
            handleOnclick={() => {sidebar_is_opened = !sidebar_is_opened}}
            active={sidebar_is_opened}
            svgViewBox="0 0 16 16"
            svg_path_d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16 M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"
        />

        <PanelButton
            tooltip_text="Show cents of notes in scale zone"
            handleOnclick={() => {
                scale_zone_cents_active = !scale_zone_cents_active;
                if (scale_zone_cents_active) {
                    keys_from_notes_active = false;
                    new_keys_active = false;
                }
            }}
            active={scale_zone_cents_active}
            svgViewBox="0 0 20 20"
            svg_path_d="M18-.0004c1.104 0 2 .896 2 2v16c0 1.0004-.896 2-2 2H2c-1.104 0-2-.895-2-2v-16c0-1.104.896-2 2-2h16m-16 3v2.201l3.272-3.201H3c-.552 0-1 .448-1 1Zm0 5.03v2.828l8.929-8.858h-2.828l-6.101 6.03Zm0 5.657v2.828l14.586-14.515h-2.829L2 13.6866Zm16 3.313v-2.343l-3.272 3.343H17c.552 0 1-.447 1-1Zm0-5.171v-2.829l-8.929 9h2.828l6.101-6.171Zm0-5.657v-2.828l-14.586 14.656h2.829L18 6.1716Z"
        />

        <PitchMemoryButton
            bind:perc={pitch_memory_perc}
            bind:show_notes_memory_traces={show_notes_memory_traces}
        />

        <span class="vertical_separator"></span>
        <h style="margin-right: 15px; user-select: none;">Define keys:</h>

        <PanelButton
            tooltip_text="Use notes from scale zone"
            handleOnclick={() => {
                keys_from_notes_active = !keys_from_notes_active;
                if (keys_from_notes_active) {
                    scale_zone_cents_active = false;
                }
            }}
            active={keys_from_notes_active}
            svgViewBox="0 0 30 21"
            svg_path_d="M0 3 7 3 7 0 23 0 23 3 30 3 30 5 23 5 23 8 7 8 7 5 0 5M0 17 7 17 7 14 23 14 23 17 30 17 30 19 23 19 23 22 7 22 7 19 0 19"
        />

        <NewKeysButton
            bind:new_keys_active={new_keys_active}
            bind:scale_zone_cents_active={scale_zone_cents_active}
            bind:dCents={dCents}
            bind:numNewKeys={numNewKeys}
            bind:alpha={alpha}
            bind:use_pitch_memory={new_keys_use_pitch_memory}
        />

        <span class="vertical_separator"></span>

        <div class = "bottom_panel_element">
            <h>Time Signature:</h>
            <select id="beats_per_measure_select" bind:value={beats_per_measure}>
                <option value={2}>2/4</option>
                <option value={3}>3/4</option>
                <option value={4}>4/4</option>
                <option value={5}>5/4</option>
            </select>
        </div>

        <div class = "bottom_panel_element">
            <h>Grid:</h>
            <select id="divisions_of_beat_select" bind:value={divisions_of_beat}>
                <option value={1}>1</option>
                <option value={2}>1/2</option>
                <option value={3}>1/3</option>
                <option value={4}>1/4</option>
                <option value={6}>1/6</option>
                <option value={8}>1/8</option>
                <option value={12}>1/12</option>
                <option value={16}>1/16</option>
            </select>
        </div>

        <PanelButton
            tooltip_text="Show grid"
            handleOnclick={() => { show_grid_active = !show_grid_active; }}
            active={show_grid_active}
            svgViewBox="0 0 30 30"
            svg_path_d="M6 0 6 7 0 7 0 9 6 9 6 21 0 21 0 23 6 23 6 30 8 30 8 23 14 23 14 30 16 30 16 23 22 23 22 30 24 30 24 23 30 23 30 21 24 21 24 9 30 9 30 7 24 7 24 0 22 0 22 7 16 7 16 0 14 0 14 7 8 7 8 0M8 9 14 9 14 21 8 21M16 9 22 9 22 21 16 21"
        />

        <PanelButton
            tooltip_text="Snap notes to grid"
            handleOnclick={() => { snap_notes_to_grid_active = !snap_notes_to_grid_active; }}
            active={snap_notes_to_grid_active}
            svgViewBox="0 0 30 30"
            svg_path_d="M6 0 6 4 0 4 0 12 6 12 6 21 0 21 0 23 6 23 6 30 8 30 8 23 14 23 14 30 16 30 16 26 22 26 22 30 24 30 24 23 30 23 30 21 24 21 24 9 30 9 30 7 24 7 24 0 22 0 22 7 16 7 16 0 14 0 14 4 8 4 8 0M8 12 14 12 14 21 8 21M16 9 22 9 22 18 16 18"
        />

        <div class = "bottom_panel_element">
            <h>BPM:</h>
            <input 
                id = "bpm_input"
                bind:value={bpm}
                type="number" 
                min="1"
                max="999"
            />
        </div>

        <span class="vertical_separator"></span>

        <PanelButton
            tooltip_text="Import Sequence (.mid + .scl files)"
            handleOnclick={() => { document.getElementById('import_files')?.click(); }}
            active={false}
            svgViewBox="0 0 24 24"
            svg_path_d="m19.949,5.536l-3.484-3.486c-1.323-1.322-3.081-2.05-4.95-2.05h-4.515C4.243,0,2,2.243,2,5v6c0,.552.447,1,1,1s1-.448,1-1v-6c0-1.654,1.346-3,3-3h4.515c.163,0,.325.008.485.023v4.977c0,1.654,1.346,3,3,3h4.977c.015.16.023.322.023.485v8.515c0,1.654-1.346,3-3,3H7c-1.654,0-3-1.346-3-3,0-.552-.447-1-1-1s-1,.448-1,1c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-1.871-.729-3.628-2.051-4.95Zm-4.949,2.464c-.552,0-1-.449-1-1V2.659c.38.218.733.487,1.051.805l3.484,3.486c.318.317.587.67.805,1.05h-4.341Zm-4.602,8H1c-.553,0-1-.448-1-1s.447-1,1-1h9.398l-1.293-1.293c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.613,1.614c1.154,1.154,1.154,3.032,0,4.187l-1.613,1.614c-.195.195-.451.293-.707.293s-.512-.098-.707-.293c-.391-.39-.391-1.023,0-1.414l1.293-1.293Z"
        />
        <input id="import_files" type="file" accept=".mid,.scl" multiple onchange={importSequence} style="display: none;"/>

        <PanelButton
            tooltip_text="Export Sequence"
            handleOnclick={exportSequence}
            active={false}
            svgViewBox="0 0 24 24"
            svg_path_d="M18.66,20.9c-.41-.37-1.05-.33-1.41,.09-.57,.65-1.39,1.02-2.25,1.02H5c-1.65,0-3-1.35-3-3V5c0-1.65,1.35-3,3-3h4.51c.16,0,.33,0,.49,.02V7c0,1.65,1.35,3,3,3h5.81c.31,0,.6-.14,.79-.39s.25-.56,.18-.86c-.31-1.22-.94-2.33-1.83-3.22l-3.48-3.48c-1.32-1.32-3.08-2.05-4.95-2.05H5C2.24,0,0,2.24,0,5v14c0,2.76,2.24,5,5,5H15c1.43,0,2.8-.62,3.75-1.69,.37-.41,.33-1.05-.09-1.41ZM12,2.66c.38,.22,.73,.49,1.05,.81l3.48,3.48c.31,.31,.58,.67,.8,1.05h-4.34c-.55,0-1-.45-1-1V2.66Zm11.13,15.43l-1.61,1.61c-.2,.2-.45,.29-.71,.29s-.51-.1-.71-.29c-.39-.39-.39-1.02,0-1.41l1.29-1.29h-7.4c-.55,0-1-.45-1-1s.45-1,1-1h7.4l-1.29-1.29c-.39-.39-.39-1.02,0-1.41s1.02-.39,1.41,0l1.61,1.61c1.15,1.15,1.15,3.03,0,4.19Z"
        />

        <span class="vertical_separator"></span>

        <div class = "bottom_panel_element">
            <h>Volume:</h>
            <input id="volume_input" type="range" min="0" max="1" bind:value={volume} step=".01" 
            oninput={() => vol.volume.value = 20 * Math.log10(volume)}/>
        </div>

        <span class="vertical_separator"></span>

        <div class = "bottom_panel_element">
            <h>Instrument:</h>
            <select id="instrument_select" bind:value={currentInstrument}
            onchange={updateSamplers} onkeydown={(e) => e.preventDefault()}>
                <option value={"piano"}>piano</option>
                <option value={"violin"}>violin</option>
                <option value={"guitar-acoustic"}>acoustic guitar</option>
                <option value={"cowbell"}>cowbell</option>
            </select>
        </div>
    </div>
</div>


<style>
    :global {
		[data-tippy-root] {
			background-color: var(--light);
			color: var(--very-dark);
			border-radius: 0.2rem;
			padding: 0.2rem 0.6rem;
			filter: drop-shadow(1px 1px 3px rgb(0 0 0 / 0.1));
			* {
				transition: none;
			}
		}
	}

    #entered_number_sign {
        z-index: 10;
        min-width: 50px;
        position: absolute;
        top: 20%;
        left: 50%;
        background-color: rgba(0, 0, 0, 0.7);
        color: var(--very-light);
        padding: 20px;
        border-radius: 8px;
        transition: opacity 1s ease-in-out;
        opacity: var(--opacity); /* Fade in/out */
        pointer-events: none; /* Prevent interaction */
    }

    #scale_zones_and_timeline_wrapper {
        display: flex;
        overflow: hidden;
    }

    #blank {
        display: flex;
        width: 120px;
        flex-shrink: 0;
        z-index: 1;
        background-color: var(--background-dark);
    }

    #scale_zone_slider_wrapper {
        height: 16px;
        font-size: 10px;
        margin-left: -10px;
        margin-right: -10px;
    }

    #keyboard_and_panel_wrapper {
        display: flex;
    }

    #keyboard_wrapper {
        width: 120px;
        flex-shrink: 0;
        height: calc(100vh - 120px);
        overflow: hidden;
    }

    #keyboard {
        background-color: var(--background-medium);
        margin-right: 5px;
        margin-left: 5px;
    }

    #panel_raw_wrapper {
        height: calc(100vh - 120px);
        overflow: auto;
        scrollbar-color: var(--bluish-gray) var(--background-dark);
    }

    #panel {
        background-color: var(--background-medium);
    }

    #bottom_panel_wrapper {
        margin-top: 10px;
        margin-left: 5px;
        margin-right: 5px;
        padding: 5px;
        display: flex;
        background-color: var(--background-medium);
        height: 40px;
        box-sizing: border-box;
    }

    .bottom_panel_element {
        margin-right: 15px;
        user-select: none;
    }

    .vertical_separator {
        display: inline-block; /* Allows setting width and height */
        border: 3px solid var(--background-dark); /* Vertical line style */
        height: auto; /* Desired height */
        margin-right: 15px;
    }

    select {
        color: var(--very-dark);
        background-color: var(--light);
    }

    #bpm_input {
        color: var(--very-dark);
        background-color: var(--light);
        height: 24px;
        width: 50px;
        padding-left: 5px;
    }

    #min_freq_input {
        color: var(--very-dark);
        background-color: var(--light);
        padding-left: 5px;
        width: 65px;
        border-radius: 5px;
    }

    #volume_input {
        margin-left: 5px;
        width: 80px;
        accent-color: var(--light);
    }

    #velocity_input_wrapper {
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        z-index: 10;
        position: absolute;
        top: 80%;
        left: 50%;
        padding: 10px;
    }

    #velocity_input {
        accent-color: var(--light);
        width: 100px;
    }
</style>
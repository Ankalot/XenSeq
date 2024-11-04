<script lang="ts">
    import tippy from 'tippy.js';
    import * as Tone from 'tone';
    import * as ToneMidi from '@tonejs/midi';
    import { onMount } from 'svelte';

    import ScaleZoneSlider from "./scale_zone_slider.svelte";
    import NoteLine from "./note.svelte";
    import KeyLineComponent from "./key_line.svelte";
    import Sidebar from './sidebar.svelte';

    // TODO:
    // 1) when you click on the timeline, start playing from a specific time or stop playing
    // 2) add slider for volume (global)
    // 3) add keyboard support in mode with keys from notes
    // 4) add mode that creates new keys based on notes in scale zone (CE * SHE)

    const num_octaves = 6;
    const octave_height_px_no_scale = 300;

    const num_measures_min = 6;
    const measure_width_px_no_scale = 300;

    let panel_scale = $state(1);
    let measure_width_px = $derived(measure_width_px_no_scale * panel_scale);
    let octave_height_px = $derived(octave_height_px_no_scale * panel_scale);

    const min_note_duration = 1/32;
    let default_note_duration = 1/4;

    let beats_per_measure = $state(4);
    let divisions_of_beat = $state(4);
    let bpm = $state(110);

    type Note = {
        octave: number,   // [0; num_octaves-1]  int       in number
        cents: number,    // [0; 1200)           float     in cents
        time: number,     // [0; num_measures]   float     in measures
        duration: number, // (0; ...)            float     in measures
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

    function measures2time(measures: number): number {
        return measures*beats_per_measure/bpm*60;
    }

    function time2measures(time: number): number {
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


    // is used when keys_from_notes_active == true; array of cents
    let keys_from_notes: number[] = $derived(
        notes
        .filter(note => (time2x(note.time + note.duration) > scale_zone_factor*scale_zone_range[0]
                         && time2x(note.time) < scale_zone_factor*scale_zone_range[1]))
        .filter((obj, index, self) =>
            index === self.findIndex((t) => t.cents === obj.cents))
        .map(item => item.cents).sort((a, b) => a - b)
    );


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

            if (keys_from_notes_active && keys_from_notes.length != 0) {
                const cents_y = y2cents(y);
                const cents_key = closestValue(keys_from_notes, cents_y);
                const octave = y2octave(y);
                notes.push({octave: octave, cents: cents_key, time: x2time(x),
                             duration: default_note_duration, selected: false});
            } else {
                notes.push({octave: y2octave(y), cents: y2cents(y), time: x2time(x),
                             duration: default_note_duration, selected: false});
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

                if (!keys_from_notes_active) {
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
                    note.time = x2time(Math.floor(time2x(note.time)/x_step)*x_step);
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
                    note.duration = x2time(Math.max(Math.floor(time2x(note.duration)/x_step), 1)*x_step);
                    default_note_duration = note.duration;
                });
            }
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', mouseUpHandler);
        }

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', mouseUpHandler);
    }


    // ===================
    // ==== KEYBOARD  ====
    // ===================

    let entered_number = $state('');
    let show_entered_number = $state(false);
    let entered_number_timeout: number | undefined;

    function fadeEnteredNumber() {
        show_entered_number = false;
        clearTimeout(entered_number_timeout);
        entered_number = '';
    }

    function showEnteredNumber() {
        show_entered_number = true;

        clearTimeout(entered_number_timeout);
        entered_number_timeout = setTimeout(() => {
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
        }

        if (event.ctrlKey && event.keyCode === 65) {
            event.preventDefault();
            notes.forEach(note => note.selected = true);
        }

        if (event.key == " ") {
            event.preventDefault();
            play();
        }

        // set cents of selected note(-s)
        if (notes.some(note => note.selected)) {
            if (event.key >= '0' && event.key <= '9' || event.key === ".") {
                entered_number += event.key;
                showEnteredNumber();
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
    let keys_from_notes_active = $state(false);
    let keys_new_from_scale_zone_active = $state(false);
    let show_grid_active = $state(true);
    let snap_notes_to_grid_active = $state(true); 


    let scale_zone_min = 0;
    let scale_zone_max = $derived(num_measures*beats_per_measure*divisions_of_beat);
    // svelte-ignore state_referenced_locally
    let scale_zone_range = $state([scale_zone_min, scale_zone_max]);
    let scale_zone_factor = $derived(num_measures*measure_width_px/scale_zone_max);

    type KeyLine = {y_px: number, cents: number};
    // is used for selected notes or "show cents of notes in scale zone" mode
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
                time: measures2time(note.time),
                duration: measures2time(note.duration),
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
                            time: time2measures(note.time),
                            duration: time2measures(note.duration),
                            selected: false
                        }))
                    );
                }
                midiReader.readAsArrayBuffer(midFile);
            };
            reader.readAsText(sclFile);
        }
    }


    let isPlaying = $state(false);
    let timelineValue = $state(0);
    let min_freq = $state(32.7);
    let sampler: Tone.Sampler;

    function notesToSampler() {
        sampler.unsync(); // i hope unsync-sync deletes triggerAttackRelease
        sampler.sync();
        notes.forEach(note => {
            sampler.triggerAttackRelease(
                cents2hz(note.cents, note.octave), 
                measures2time(note.duration),
                measures2time(note.time)
            );
        });
    }

    onMount(() => {
        // this is necessary so that the components from the top panel fit correctly
        handleScroll(); 

        // create sampler
        const urls: any = {};
        for (let i = 1; i <= 7; i++) {
            urls[`C${i}`] = `C${i}.mp3`;
            urls[`D#${i}`] = `Ds${i}.mp3`;
            urls[`F#${i}`] = `Fs${i}.mp3`;
            urls[`A${i}`] = `A${i}.mp3`;
        }
        sampler = new Tone.Sampler({
            urls: urls,
            release: 2,
            baseUrl: "https://tonejs.github.io/audio/salamander/",
        }).toDestination();
        sampler.sync();

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
            
            isPlaying = false;
        }
    }
</script>


<svelte:window onkeydown={handleKeydown} />

<div id="entered_number_sign" style="--opacity: {show_entered_number ? 1 : 0}">
    {entered_number}
</div>

<svelte:head>
	<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet"/>
</svelte:head>
<Sidebar bind:open={sidebar_is_opened}/>

<div id = "sequencer">
    <div id = "scale_zones_and_timeline_wrapper">
        <div id = "blank">
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div style="margin-top: 15px; margin-left: 5px; cursor: pointer;" onclick={play}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24">
                    <path stroke="var(--light)" stroke-width="2" stroke-linejoin="round" d={isPlaying ? 
                    "M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z"
                    :
                    "M16.6582 9.28638C18.098 10.1862 18.8178 10.6361 19.0647 11.2122C19.2803 11.7152 19.2803 12.2847 19.0647 12.7878C18.8178 13.3638 18.098 13.8137 16.6582 14.7136L9.896 18.94C8.29805 19.9387 7.49907 20.4381 6.83973 20.385C6.26501 20.3388 5.73818 20.0469 5.3944 19.584C5 19.053 5 18.1108 5 16.2264V7.77357C5 5.88919 5 4.94701 5.3944 4.41598C5.73818 3.9531 6.26501 3.66111 6.83973 3.6149C7.49907 3.5619 8.29805 4.06126 9.896 5.05998L16.6582 9.28638Z"
                    }></path>
                </svg>
            </div>

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
            <div id = "timeline">
                {#if isPlaying}
                    <svg
                    style="left: {time2measures(timelineValue)*measure_width_px}px; position: absolute; margin-left: -15px;"
                    xmlns="http://www.w3.org/2000/svg" width="30" height="28" fill="var(--green)" viewBox="0 0 30 28">
                        <path d="M0 0 14 28 16 28 30 0 0 0"></path>
                    </svg>
                {/if}

                {#each Array.from({ length: num_measures }) as _, index}
                    <div class="measure" style="width: {measure_width_px}px;"> {index + 1} </div>
                {/each}
            </div>
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
                        text-anchor="middle" transform="rotate(-90, 18, {octave_height_px * (0.5 + index)})">
                            {"OCTAVE " + (num_octaves - index - 1)}
                        </text>
                    {/each}

                    {#if keys_from_notes_active}
                        {#each Array.from({ length: num_octaves }) as _, octave}
                            {#each keys_from_notes as key, index}
                                <KeyLineComponent y_px={(num_octaves - octave-key/1200)*octave_height_px}
                                 cents={key} len_px={20} keyboard={true} text_shift={-40*(index%2)}/>
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

                    {#if keys_from_notes_active}
                        {#each Array.from({ length: num_octaves }) as _, octave}
                            {#each keys_from_notes as key, index}
                                <KeyLineComponent y_px={(num_octaves - octave-key/1200)*octave_height_px}
                                cents={key} len_px={num_measures*measure_width_px} keyboard={false}/>
                            {/each}
                        {/each}
                    {:else}
                        {#each keyLines as {y_px, cents}, index}
                            <KeyLineComponent y_px={y_px} cents={cents} len_px={num_measures*measure_width_px} keyboard={false}/>
                        {/each}
                    {/if}

                    {#each notes as {octave, cents, time, duration, selected}, index}
                        <NoteLine note_x_px={time2x(time)} note_y_px={cents2y(cents, octave)}
                        note_length={time2x(duration)} selected={selected}
                            removeNote = {() => removeNote(index)}
                            selectNote = {(shiftKey) => selectNote(index, shiftKey)}
                            startDragging = {(x, y) => startNoteDragging(index, x, y)}
                            startResizing = {(x) => startNoteResizing(index, x)}/>
                    {/each}

                    {#if isPlaying}
                        <line
                        x1={time2measures(timelineValue)*measure_width_px} 
                        y1={0} 
                        x2={time2measures(timelineValue)*measure_width_px} 
                        y2={num_octaves*octave_height_px} 
                        stroke="var(--green)"
                        stroke-width="2"
                        />
                    {/if}
                </svg>
            </div>
        </div>
    </div>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div id = "bottom_panel_wrapper">
        <div class = "bottom_panel_button"
        use:tooltip={{ content: 'Show help' }}
        onclick={() => {sidebar_is_opened = !sidebar_is_opened}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16"
            class="{sidebar_is_opened ? 'active_button' : ''}">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
            </svg>
        </div>

        <div class = "bottom_panel_button"
        use:tooltip={{ content: 'Show cents of notes in scale zone' }}
        onclick={() => {
            scale_zone_cents_active = !scale_zone_cents_active;
            if (scale_zone_cents_active) {
                keys_from_notes_active = false;
                keys_new_from_scale_zone_active = false;
            }
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 20 20" 
            class="{scale_zone_cents_active ? 'active_button' : ''}">
                <path d="M18-.0004c1.104 0 2 .896 2 2v16c0 1.0004-.896 2-2 2H2c-1.104 0-2-.895-2-2v-16c0-1.104.896-2 2-2h16m-16 3v2.201l3.272-3.201H3c-.552 0-1 .448-1 1Zm0 5.03v2.828l8.929-8.858h-2.828l-6.101 6.03Zm0 5.657v2.828l14.586-14.515h-2.829L2 13.6866Zm16 3.313v-2.343l-3.272 3.343H17c.552 0 1-.447 1-1Zm0-5.171v-2.829l-8.929 9h2.828l6.101-6.171Zm0-5.657v-2.828l-14.586 14.656h2.829L18 6.1716Z"/>
            </svg>
        </div>

        <span class="vertical_separator"></span>
        <h style="margin-right: 15px;"
        use:tooltip={{ content: 'Create notes using keys' }}>Define keys:</h>

        <div class = "bottom_panel_button"
        use:tooltip={{ content: 'Use notes from scale zone' }}
        onclick={() => {
            keys_from_notes_active = !keys_from_notes_active;
            if (keys_from_notes_active) {
                scale_zone_cents_active = false;
            }
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 30 21" 
            class="{keys_from_notes_active ? 'active_button' : ''}">
                <path d="M0 3 7 3 7 0 23 0 23 3 30 3 30 5 23 5 23 8 7 8 7 5 0 5M0 17 7 17 7 14 23 14 23 17 30 17 30 19 23 19 23 22 7 22 7 19 0 19"/>
            </svg>
        </div>

        <!--
        <div class = "bottom_panel_button"
        use:tooltip={{ content: 'Create new keys in scale zone' }}
        onclick={() => {
            keys_new_from_scale_zone_active = !keys_new_from_scale_zone_active;
            if (keys_new_from_scale_zone_active) {
                scale_zone_cents_active = false;
            }
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 30 22" 
            class="{keys_new_from_scale_zone_active ? 'active_button' : ''}">
                <path d="M7 8 7 0 23 0 23 8M7 22 7 14 23 14 23 22M0 12 0 10 30 10 30 12"/>
            </svg>
        </div>
        -->

        <span class="vertical_separator"></span>
        <h style="margin-right: 15px;">Time:</h>

        <div class = "bottom_panel_element">
            <h>Signature:</h>
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

        <div class = "bottom_panel_button"
        use:tooltip={{ content: 'Show grid' }}
        onclick={() => { show_grid_active = !show_grid_active; }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 30 30" 
            class="{show_grid_active ? 'active_button' : ''}">
                <path d="M6 0 6 7 0 7 0 9 6 9 6 21 0 21 0 23 6 23 6 30 8 30 8 23 14 23 14 30 16 30 16 23 22 23 22 30 24 30 24 23 30 23 30 21 24 21 24 9 30 9 30 7 24 7 24 0 22 0 22 7 16 7 16 0 14 0 14 7 8 7 8 0M8 9 14 9 14 21 8 21M16 9 22 9 22 21 16 21"/>
            </svg>
        </div>

        <div class = "bottom_panel_button"
        use:tooltip={{ content: 'Snap notes to grid' }}
        onclick={() => { snap_notes_to_grid_active = !snap_notes_to_grid_active; }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 30 30" 
            class="{snap_notes_to_grid_active ? 'active_button' : ''}">
                <path d="M6 0 6 4 0 4 0 12 6 12 6 21 0 21 0 23 6 23 6 30 8 30 8 23 14 23 14 30 16 30 16 26 22 26 22 30 24 30 24 23 30 23 30 21 24 21 24 9 30 9 30 7 24 7 24 0 22 0 22 7 16 7 16 0 14 0 14 4 8 4 8 0M8 12 14 12 14 21 8 21M16 9 22 9 22 18 16 18"/>
            </svg>
        </div>

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
        <h style="margin-right: 15px;">File:</h>

        <div class = "bottom_panel_button"
        use:tooltip={{ content: 'Import Sequence (.mid + .scl files)' }}
        onclick={() => { document.getElementById('import_files')?.click(); }}>
            <input id="import_files" type="file" accept=".mid,.scl" multiple onchange={importSequence} style="display: none;"/>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 24 24">
                <path d="m19.949,5.536l-3.484-3.486c-1.323-1.322-3.081-2.05-4.95-2.05h-4.515C4.243,0,2,2.243,2,5v6c0,.552.447,1,1,1s1-.448,1-1v-6c0-1.654,1.346-3,3-3h4.515c.163,0,.325.008.485.023v4.977c0,1.654,1.346,3,3,3h4.977c.015.16.023.322.023.485v8.515c0,1.654-1.346,3-3,3H7c-1.654,0-3-1.346-3-3,0-.552-.447-1-1-1s-1,.448-1,1c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-1.871-.729-3.628-2.051-4.95Zm-4.949,2.464c-.552,0-1-.449-1-1V2.659c.38.218.733.487,1.051.805l3.484,3.486c.318.317.587.67.805,1.05h-4.341Zm-4.602,8H1c-.553,0-1-.448-1-1s.447-1,1-1h9.398l-1.293-1.293c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.613,1.614c1.154,1.154,1.154,3.032,0,4.187l-1.613,1.614c-.195.195-.451.293-.707.293s-.512-.098-.707-.293c-.391-.39-.391-1.023,0-1.414l1.293-1.293Z"></path>
            </svg>
        </div>

        <div class = "bottom_panel_button"
        use:tooltip={{ content: 'Export Sequence' }}
        onclick={() => { exportSequence(); }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.66,20.9c-.41-.37-1.05-.33-1.41,.09-.57,.65-1.39,1.02-2.25,1.02H5c-1.65,0-3-1.35-3-3V5c0-1.65,1.35-3,3-3h4.51c.16,0,.33,0,.49,.02V7c0,1.65,1.35,3,3,3h5.81c.31,0,.6-.14,.79-.39s.25-.56,.18-.86c-.31-1.22-.94-2.33-1.83-3.22l-3.48-3.48c-1.32-1.32-3.08-2.05-4.95-2.05H5C2.24,0,0,2.24,0,5v14c0,2.76,2.24,5,5,5H15c1.43,0,2.8-.62,3.75-1.69,.37-.41,.33-1.05-.09-1.41ZM12,2.66c.38,.22,.73,.49,1.05,.81l3.48,3.48c.31,.31,.58,.67,.8,1.05h-4.34c-.55,0-1-.45-1-1V2.66Zm11.13,15.43l-1.61,1.61c-.2,.2-.45,.29-.71,.29s-.51-.1-.71-.29c-.39-.39-.39-1.02,0-1.41l1.29-1.29h-7.4c-.55,0-1-.45-1-1s.45-1,1-1h7.4l-1.29-1.29c-.39-.39-.39-1.02,0-1.41s1.02-.39,1.41,0l1.61,1.61c1.15,1.15,1.15,3.03,0,4.19Z"></path>
            </svg>
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

    #timeline {
        height: 28px;
        display: flex;
        flex-wrap: nowrap;
    }

    .measure {
        flex-shrink: 0;
        text-align: left;
        padding-left: 10px;
        box-sizing: border-box;
        border: 2px solid var(--very-dark);
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

    .bottom_panel_button {
        cursor: pointer;
        margin-right: 15px;
    }

    .bottom_panel_element {
        margin-right: 15px;
    }

    .active_button {
        fill: var(--green);
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
</style>
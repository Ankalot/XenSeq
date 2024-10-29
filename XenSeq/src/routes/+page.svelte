<script lang="ts">
    import ScaleZoneSlider from "./scale_zone_slider.svelte";
    import NoteLine from "./note.svelte";
    import KeyLineComponent from "./key_line.svelte";

    // NEXT THINGS TO DO:
    // 1) create brief information segment
    // 2) toggle button for viewing cents of all notes in scale zone
    //        OR viewing cents only of selected notes

    type Note = {x_start: number; y_start: number; length: number, selected: boolean};
    let notes: Note[] = $state([]);

    let num_octaves = 3;
    let octave_height_px = 300;

    let num_measures_min = 6;
    let measure_width_px = 300;

    let num_measures = $derived(Math.max(num_measures_min, 
        Math.floor(notes.reduce((max, curr) => (curr.x_start > max ? curr.x_start : max), 0) / measure_width_px) + 3)
    );

    let min_note_length = measure_width_px/32;

    type KeyLine = {y_px: number, cents: number};
    let keyLines: KeyLine[] = $derived(
        notes.filter(note => note.selected).map(({x_start, y_start, length, selected}) => ({
            y_px: y_start,
            cents: (num_octaves*octave_height_px - y_start) % octave_height_px / octave_height_px * 1200
        })).filter((obj, index, self) =>
            index === self.findIndex((t) => t.y_px === obj.y_px)
        )
    )


    let scale_zones_and_timeline_movable: HTMLDivElement;
    let keyboard: HTMLDivElement;
    let panel_wrapper: HTMLDivElement;

    function handleScroll() {
        const scrollLeft = panel_wrapper.scrollLeft;
        scale_zones_and_timeline_movable.style.transform = `translateX(${-scrollLeft}px)`;

        const scrollTop = panel_wrapper.scrollTop;
        keyboard.style.transform = `translateY(${-scrollTop}px)`;
    }


    // @ts-ignore
    function handlePanelMouseDown(event) {
        if (event.button == 0) {
            notes.forEach(note => note.selected=false);
            const svg = event.currentTarget;
            const rect = svg.getBoundingClientRect();
            const x = event.clientX - rect.left; // Calculate x position relative to SVG
            const y = event.clientY - rect.top;  // Calculate y position relative to SVG
            notes.push({x_start: x, y_start: y, length: measure_width_px/4, selected: false});
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
        
        // @ts-ignore
        function mouseMoveHandler(moveEvent) {
            const dx = moveEvent.clientX - x;
            const dy = moveEvent.clientY - y;

            selectedNotes.forEach(note => {
                note.x_start += dx;
                if (note.x_start < 0)
                    note.x_start = 0;
                else if (note.x_start + note.length > num_measures*measure_width_px)
                    note.x_start = num_measures*measure_width_px - note.length;
                note.y_start += dy;
                if (note.y_start < 10)
                    note.y_start = 10;
                else if (note.y_start + 10 > num_octaves*octave_height_px)
                    note.y_start = num_octaves*octave_height_px - 10;
            });

            x = moveEvent.clientX;
            y = moveEvent.clientY;
        }

        // @ts-ignore
        function mouseUpHandler() {
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', mouseUpHandler);
        }

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', mouseUpHandler);
    }


    function startNoteResizing(i: number, x: number) {       
        const selectedNotes = notes.filter(note => note.selected);
        
        // @ts-ignore
        function mouseMoveHandler(moveEvent) {
            const dx = moveEvent.clientX - x;

            selectedNotes.forEach(note => {
                note.length += dx;
                if (note.length < min_note_length) {
                    note.length = min_note_length;
                }
            });

            x = moveEvent.clientX;
        }

        // @ts-ignore
        function mouseUpHandler() {
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

    function ClampValue(x: number, a:number, b:number) {
        return Math.min(Math.max(x, a), b);
    }

    // @ts-ignore
    function handleKeydown(event) {
        if (event.code === "Delete") {
            notes = notes.filter(note => !note.selected);
        } else if (event.code == "Escape") {
            notes.forEach(note => note.selected = false);
            fadeEnteredNumber();
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
                            note.y_start = ClampValue(
                                Math.floor((note.y_start-0.0001)/octave_height_px + 1)*octave_height_px - 
                                (cents % 1200)/1200*octave_height_px,
                                0, num_octaves*octave_height_px
                            );
                        }
                    })
                    fadeEnteredNumber();
                }
            }
            if (event.key === "Backspace") {
                entered_number = entered_number.slice(0, -1);
            }
        }
    }
</script>


<svelte:window onkeydown={handleKeydown} />

<div id="entered_number_sign" style="--opacity: {show_entered_number ? 1 : 0}">
    {entered_number}
</div>

<div id = "sequencer">
    <div id = "scale_zones_and_timeline_wrapper">
        <div id = "blank"></div>
        <div id = "scale_zones_and_timeline_movable" bind:this={scale_zones_and_timeline_movable}>
            <div id = "scale_zone_slider_wrapper">
                <ScaleZoneSlider min_val={0} max_val={num_measures*8}/>
            </div>
            <div id = "timeline">
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
                <svg width={100} height={num_octaves*octave_height_px}>
                    {#each Array(num_octaves+1) as _, index}
                        <line 
                            x1="0" 
                            y1={index * octave_height_px} 
                            x2={100} 
                            y2={index * octave_height_px} 
                            stroke=#2c2d30 
                            stroke-width="3"
                        />
                    {/each}

                    {#each Array(num_octaves) as _, index}
                        <text x="18" y="{octave_height_px * (0.5 + index)}" fill=#2c2d30
                        text-anchor="middle" transform="rotate(-90, 18, {octave_height_px * (0.5 + index)})">
                            {"OCTAVE " + (num_octaves - index - 1)}
                        </text>
                    {/each}

                    {#each keyLines as {y_px, cents}, index}
                        <KeyLineComponent y_px={y_px} cents={cents} len_px={20} keyboard={true}/>
                    {/each}
                </svg>
            </div>
        </div>
        
        <div id = "panel_wrapper" bind:this={panel_wrapper} onscroll={handleScroll}>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div id = "panel" style="height: {num_octaves*octave_height_px}px; width: {num_measures*measure_width_px}px"
            oncontextmenu={(e) => {e.preventDefault();}}>
                <svg width={num_measures*measure_width_px} height={num_octaves*octave_height_px} role="presentation"
                onmousedown={handlePanelMouseDown}>

                    {#each Array(num_octaves+1) as _, index}
                        <line 
                            x1="0" 
                            y1={index * octave_height_px} 
                            x2={num_measures * measure_width_px} 
                            y2={index * octave_height_px} 
                            stroke=#2c2d30
                            stroke-width="3"
                        />
                    {/each}

                    {#each Array(num_measures+1) as _, index}
                        <line 
                            x1={index * measure_width_px} 
                            y1={0} 
                            x2={index * measure_width_px} 
                            y2={num_octaves*octave_height_px} 
                            stroke=#2c2d30
                            stroke-width="3"
                        />
                    {/each}

                    {#each keyLines as {y_px, cents}, index}
                        <KeyLineComponent y_px={y_px} cents={cents} len_px={num_measures*measure_width_px} keyboard={false}/>
                    {/each}

                    {#each notes as {x_start, y_start, length, selected}, index}
                        <NoteLine note_x_px={x_start} note_y_px={y_start} note_length={length} selected={selected}
                            removeNote = {() => removeNote(index)}
                            selectNote = {(shiftKey) => selectNote(index, shiftKey)}
                            startDragging = {(x, y) => startNoteDragging(index, x, y)}
                            startResizing = {(x) => startNoteResizing(index, x)}/>
                    {/each}
                </svg>
            </div>
        </div>
    </div>
</div>


<style>
    #entered_number_sign {
        z-index: 10;
        min-width: 50px;
        position: absolute;
        top: 20%;
        left: 50%;
        background-color: rgba(0, 0, 0, 0.7);
        color: #c3c3c3;
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
        width: 100px;
        flex-shrink: 0;
        z-index: 1;
        background-color: #35363a;
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
        border: 2px solid #2c2d30;
    }

    #keyboard_and_panel_wrapper {
        display: flex;
    }

    #keyboard_wrapper {
        width: 100px;
        flex-shrink: 0;
        height: 600px;
        overflow: hidden;
    }

    #keyboard {
        background-color: #45474c;
        margin-right: 5px;
        margin-left: 5px;
    }

    #panel_wrapper {
        height: 600px;
        overflow: auto;
        scrollbar-color: #676e7a #35363a;
    }

    #panel {
        background-color: #45474c;
    }
</style>
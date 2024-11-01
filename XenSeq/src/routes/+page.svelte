<script lang="ts">
    import tippy from 'tippy.js';

    import ScaleZoneSlider from "./scale_zone_slider.svelte";
    import NoteLine from "./note.svelte";
    import KeyLineComponent from "./key_line.svelte";
    import Sidebar from './sidebar.svelte';

    // TODO:
    // Refactor: Note should have cents and octave values and time, not x and y.
    //           Define functions for transformations: y -> cents, cents -> y, x -> time, time -> x


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


    let keys_from_notes: number[] = $derived(
        notes.filter(note => (note.x_start + note.length > scale_zone_factor*scale_zone_range[0]
                                  && note.x_start < scale_zone_factor*scale_zone_range[1])).
        map(({x_start, y_start, length, selected}) => ({
            cents: (num_octaves*octave_height_px - y_start) % octave_height_px / octave_height_px * 1200
        })).filter((obj, index, self) =>
            index === self.findIndex((t) => t.cents === obj.cents)
        ).map(item => item.cents).sort((a, b) => a - b)
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


    const closestValue = (arr: number[], x: number) => {
        return arr.reduce((prev, curr) => {
            return (Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev);
        });
    };

    // @ts-ignore
    function handlePanelMouseDown(event) {
        if (event.button == 0) {
            notes.forEach(note => note.selected=false);
            const svg = event.currentTarget;
            const rect = svg.getBoundingClientRect();
            const x = event.clientX - rect.left; // Calculate x position relative to SVG
            let y = Math.round(event.clientY - rect.top);  // Calculate y position relative to SVG

            if (keys_from_notes_active && keys_from_notes.length != 0) {
                const cents_y = (num_octaves*octave_height_px - y)%octave_height_px*1200/octave_height_px;
                const cents_key = closestValue(keys_from_notes, cents_y);

                const octave = Math.floor((num_octaves*octave_height_px - y)/octave_height_px);
                
                y = Math.round(num_octaves*octave_height_px - octave*octave_height_px - cents_key/1200*octave_height_px);
            }

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


    // @ts-ignore
    function tooltip(node, options) {
        const instance = tippy(node, options);
        return {
            destroy() {
                //@ts-ignore
                instance.destroy();
            }
        };
    }


    let sidebar_is_opened = $state(false);
    let scale_zone_cents_active = $state(false);
    let keys_from_notes_active = $state(false);
    let keys_new_from_scale_zone_active = $state(false);


    let scale_zone_min = 0;
    let scale_zone_max = $derived(num_measures*16);
    let scale_zone_range = $state([scale_zone_min, scale_zone_max]);
    let scale_zone_factor = $derived(num_measures*measure_width_px/scale_zone_max);

    type KeyLine = {y_px: number, cents: number};
    let keyLines: KeyLine[] = $derived(
        (scale_zone_cents_active ? 
            notes.filter(note => (note.x_start + note.length > scale_zone_factor*scale_zone_range[0]
                 && note.x_start < scale_zone_factor*scale_zone_range[1])).
            map(({x_start, y_start, length, selected}) => ({
                y_px: y_start,
                cents: (num_octaves*octave_height_px - y_start) % octave_height_px / octave_height_px * 1200
            })).filter((obj, index, self) =>
                index === self.findIndex((t) => t.y_px === obj.y_px)
            )
        :
            notes.filter(note => note.selected).map(({x_start, y_start, length, selected}) => ({
                y_px: y_start,
                cents: (num_octaves*octave_height_px - y_start) % octave_height_px / octave_height_px * 1200
            })).filter((obj, index, self) =>
                index === self.findIndex((t) => t.y_px === obj.y_px)
            )
        )
    )
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
        <div id = "blank"></div>
        <div id = "scale_zones_and_timeline_movable" bind:this={scale_zones_and_timeline_movable}>
            <div id = "scale_zone_slider_wrapper">
                <ScaleZoneSlider min_val={scale_zone_min} max_val={scale_zone_max} 
                bind:values={scale_zone_range}/>
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
                <svg width={120} height={num_octaves*octave_height_px}>
                    {#each Array(num_octaves+1) as _, index}
                        <line 
                            x1="0" 
                            y1={index * octave_height_px} 
                            x2={120} 
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

    <div id = "bottom_panel_wrapper">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class = "bottom_panel_button"
        use:tooltip={{ content: 'Show help' }}
        onclick={() => {sidebar_is_opened = !sidebar_is_opened}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16"
            class="{sidebar_is_opened ? 'active_button' : ''}">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
            </svg>
        </div>

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class = "bottom_panel_button"
        use:tooltip={{ content: 'Show cents of notes in scale zone' }}
        onclick={() => {
            scale_zone_cents_active = !scale_zone_cents_active
            if (scale_zone_cents_active) {
                keys_from_notes_active = false
                keys_new_from_scale_zone_active = false
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

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class = "bottom_panel_button"
        use:tooltip={{ content: 'Use notes from scale zone' }}
        onclick={() => {
            keys_from_notes_active = !keys_from_notes_active
            if (keys_from_notes_active) {
                scale_zone_cents_active = false
            }
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 30 21" 
            class="{keys_from_notes_active ? 'active_button' : ''}">
                <path d="M0 3 7 3 7 0 23 0 23 3 30 3 30 5 23 5 23 8 7 8 7 5 0 5M0 17 7 17 7 14 23 14 23 17 30 17 30 19 23 19 23 22 7 22 7 19 0 19"/>
            </svg>
        </div>

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!--
        <div class = "bottom_panel_button"
        use:tooltip={{ content: 'Create new keys in scale zone' }}
        onclick={() => {
            keys_new_from_scale_zone_active = !keys_new_from_scale_zone_active
            if (keys_new_from_scale_zone_active) {
                scale_zone_cents_active = false
            }
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 30 22" 
            class="{keys_new_from_scale_zone_active ? 'active_button' : ''}">
                <path d="M7 8 7 0 23 0 23 8M7 22 7 14 23 14 23 22M0 12 0 10 30 10 30 12"/>
            </svg>
        </div>
        -->
    </div>
</div>


<style>
    :global {
		[data-tippy-root] {
			--bg: #707070;
			background-color: var(--bg);
			color: #dcdcdc;
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
        width: 120px;
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
        width: 120px;
        flex-shrink: 0;
        height: 600px;
        overflow: hidden;
    }

    #keyboard {
        background-color: #45474c;
        margin-right: 5px;
        margin-left: 5px;
    }

    #panel_raw_wrapper {
        height: 600px;
        overflow: auto;
        scrollbar-color: #676e7a #35363a;
    }

    #panel {
        background-color: #45474c;
    }

    #bottom_panel_wrapper {
        margin-top: 10px;
        margin-left: 5px;
        margin-right: 5px;
        padding: 5px;
        display: flex;
        background-color: #45474c;
        height: 40px;
        box-sizing: border-box;
    }

    .bottom_panel_button {
        cursor: pointer;
        margin-right: 15px;
    }

    .active_button {
        fill: #22b14d;
    }

    .vertical_separator {
        display: inline-block; /* Allows setting width and height */
        border: 3px solid #35363a; /* Vertical line style */
        height: auto; /* Desired height */
        margin-right: 15px;
    }
</style>
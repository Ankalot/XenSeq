<script lang="ts">
    export let note_x_px = 100;
    export let note_y_px = 100;
    export let note_length = 100;
    export let velocity = 1;
    export let selected = false;


    function handleOnMouseDown(event: MouseEvent, resize: boolean) {
        event.stopPropagation();

        if (event.button === 0) {
            selectNote(event.shiftKey);
            if (resize) {
                startResizing(event.clientX);
            } else {
                startDragging(event.clientX, event.clientY);
            }
        } else if (event.button === 2) {
            event.preventDefault();
            removeNote();
        } else if (event.button === 1) {
            event.preventDefault();
            changeNoteVelocity();
        }
    }

    function handleOnMouseEnter(event: MouseEvent) {
        if (event.buttons === 2) {
            removeNote();
        }
    }


    export let removeNote: () => void;
    export let selectNote: (shiftKey: boolean) => void;
    export let startDragging: (initX: number, initY: number) => void;
    export let startResizing: (initX: number) => void;
    export let changeNoteVelocity: () => void;
</script>


<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<svg onmousedown={e => handleOnMouseDown(e, false)}
onmouseenter={handleOnMouseEnter}>
    {#if selected}
        <line
        x1={note_x_px - 2} 
        y1={note_y_px} 
        x2={note_x_px + note_length + 2} 
        y2={note_y_px} 
        stroke="var(--very-light)"
        stroke-width="14"
        cursor="pointer"
        />
    {/if}
    <line
    x1={note_x_px} 
    y1={note_y_px} 
    x2={note_x_px + note_length} 
    y2={note_y_px} 
    stroke="color-mix(in srgb, var(--green) {velocity * 100}%, var(--very-light) {(1 - velocity) * 100}%"
    stroke-width="10"
    cursor="pointer"
    />

    <line
    onmousedown={e => handleOnMouseDown(e, true)}
    x1={note_x_px + note_length - 5}
    y1={note_y_px + 3}
    x2={note_x_px + note_length - 5}
    y2={note_y_px - 3}
    stroke="var(--background-dark)"
    stroke-width="3"
    cursor="col-resize"
    />
</svg>
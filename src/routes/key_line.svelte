<script lang="ts">
    export let y_px = 0;
    export let len_px = 0;
    export let cents = 0;
    export let keyboard = true; // line on keyboard or on panel
    export let text_shift = 0; // for keyboard
    export let is_played = false; // for keyboard
    export let is_new_key = false;

    export let keyOnMousedown: () => void = () => {};
    export let keyOnMouseup: () => void = () => {};
</script>


<svg>
    {#if keyboard}
        <line
        x1={120-len_px} 
        y1={y_px}
        x2={120} 
        y2={y_px} 
        stroke={is_new_key ? "var(--bluish-dark)" : "var(--background-dark)"}
        stroke-width="1.5"
        />
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <text x={120-len_px-20+text_shift} y={y_px+5} 
        fill={is_played ? 
        "var(--green)" : 
        (is_new_key ? "var(--bluish-light)" : "var(--light)")}
        text-anchor="middle"
        cursor="pointer"
        style="user-select: none;"
        onmousedown={keyOnMousedown}
        onmouseup={keyOnMouseup}>
            {Math.round(cents)}
        </text>
    {:else}
        <line
        x1={0}
        y1={y_px}
        x2={len_px}
        y2={y_px}
        stroke={is_new_key ? "var(--bluish-dark)" : "var(--background-dark)"}
        stroke-width="1.5"
        />
    {/if}
</svg>
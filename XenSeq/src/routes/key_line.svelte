<script lang="ts">
    export let y_px = 0;
    export let len_px = 0;
    export let cents = 0;
    export let keyboard = true; // line on keyboard or on panel
    export let text_shift = 0; // for keyboard
</script>


<svg>
    {#if keyboard}
        <line
        x1={120-len_px} 
        y1={y_px}
        x2={120} 
        y2={y_px} 
        stroke=#35363a
        stroke-width="1.5"
        />
        <text x={120-len_px-20+text_shift} y={y_px+5} fill=#c3c3c3 text-anchor="middle">
            {Math.round(cents)}
        </text>
    {:else}
        <line
        x1={0}
        y1={y_px}
        x2={len_px}
        y2={y_px}
        stroke=#35363a
        stroke-width="1.5"
        />
    {/if}
</svg>
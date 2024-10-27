<script lang="ts">
    export let y_px = 100;
    export let len_px = 100;
    export let cents = 100;
    export let keyboard = true; // line on keyboard or on panel
</script>


<svg>
    {#if keyboard}
        <line
        x1={100-len_px} 
        y1={y_px}
        x2={100} 
        y2={y_px} 
        stroke=#35363a
        stroke-width="1.5"
        cursor="pointer"
        />
        <text x={100-len_px-20} y={y_px+5} fill=#c3c3c3 text-anchor="middle">
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
        cursor="pointer"
        />
    {/if}
</svg>
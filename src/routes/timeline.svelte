<script lang="ts">
    export let isPlaying: boolean;
    export let playhead_x: number;
    export let num_measures: number;
    export let measure_width_px: number;
    export let handleMeasureClick: (e: MouseEvent, index: number) => void;
</script>


<div id = "timeline">
    {#if isPlaying}
        <svg
        style="left: {playhead_x}px; position: absolute; margin-left: -15px;"
        xmlns="http://www.w3.org/2000/svg" width="30" height="28" fill="var(--green)" viewBox="0 0 30 28">
            <path d="M0 0 14 28 16 28 30 0 0 0"></path>
        </svg>
    {/if}

    {#each Array.from({ length: num_measures }) as _, index}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="measure" style="width: {measure_width_px}px;"
        onclick={e => handleMeasureClick(e, index)}>
            {index + 1}
        </div>
    {/each}
</div>


<style>
    #timeline {
        height: 28px;
        display: flex;
        flex-wrap: nowrap;
        user-select: none;
    }

    .measure {
        flex-shrink: 0;
        text-align: left;
        padding-left: 10px;
        box-sizing: border-box;
        border: 2px solid var(--very-dark);
        cursor: pointer;
    }
</style>

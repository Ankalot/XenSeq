<script>
    import RangeSlider from 'svelte-range-slider-pips';

    export let min_val = 0;
    export let max_val = 100;

    let values = [min_val, max_val];
</script>


<RangeSlider
    bind:values 
    min={min_val} 
    max={max_val}
    range={true}
/>


<style>
    :root {
        --range-slider:            #35363a;
        --range-handle-inactive:   #c3c3c3;
        --range-handle:            #c3c3c3;
        --range-handle-focus:      #c3c3c3;
        --range-handle-border:     #c3c3c3;
        --range-range-inactive:    #c3c3c3;
        --range-range:             #c3c3c3;
    }
</style>
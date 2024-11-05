<script>
    import RangeSlider from 'svelte-range-slider-pips';

    export let min_val = 0;
    export let max_val = 100;

    export let values = [min_val, max_val];
</script>


<RangeSlider
    bind:values 
    min={min_val} 
    max={max_val}
    range={true}
/>


<style>
    :root {
        --range-slider:            var(--background-dark);
        --range-handle-inactive:   var(--light);
        --range-handle:            var(--light);
        --range-handle-focus:      var(--light);
        --range-handle-border:     var(--light);
        --range-range-inactive:    var(--light);
        --range-range:             var(--light);
    }
</style>
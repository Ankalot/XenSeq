<script lang="ts">
    export let x_px;
    export let y_px;
    export let length_px;
</script>


<line
x1={x_px}
y1={y_px}
x2={x_px+length_px}
y2={y_px}
stroke="var(--bluish-light)"
style="pointer-events: none;"
stroke-width="3"
/>
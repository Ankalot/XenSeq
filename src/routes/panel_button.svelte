<script lang="ts">
    import tippy from 'tippy.js';

    
    export let tooltip_text = '';
    export let svgViewBox = '0 0 30 30';
    export let svg_path_d = '';
    export let handleOnclick: () => void;
    export let active = false;


    function tooltip(node: HTMLElement, options: {content: string}) {
        const instance = tippy(node, options);
        return {
            destroy() {
                instance.destroy();
            }
        };
    }
</script>


<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class = "bottom_panel_button"
use:tooltip={{ content: tooltip_text }}
onclick={handleOnclick}>
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox={svgViewBox}
    class="{active ? 'active_button' : ''}">
        <path d={svg_path_d}/>
    </svg>
</div>


<style>
    .bottom_panel_button {
        cursor: pointer;
        margin-right: 15px;
    }

    .active_button {
        fill: var(--green);
    }
</style>
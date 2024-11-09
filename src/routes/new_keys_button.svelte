<script lang="ts">
    let { 
        dCents = $bindable(),
        numNewKeys = $bindable(),
        alpha = $bindable(),
        new_keys_active = $bindable(),
        scale_zone_cents_active = $bindable()
    } = $props();


    let new_keys_button_is_hovered = $state(false);
</script>


<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class = "bottom_panel_element"
onmouseenter={() => new_keys_button_is_hovered = true} 
onmouseleave={() => new_keys_button_is_hovered = false}>
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 30 22" 
    class="{new_keys_active ? 'active_button' : ''}" style="cursor: pointer;"
    onclick={() => {
        new_keys_active = !new_keys_active;
        if (new_keys_active) {
            scale_zone_cents_active = false;
        }
    }}>
        <path d="M7 8 7 0 23 0 23 8M7 22 7 14 23 14 23 22M0 12 0 10 30 10 30 12"/>
    </svg>
    {#if new_keys_button_is_hovered}
        <div id="new_keys_settings_dropdown">
            <div>
                <h style="color: var(--very-dark);">Min distance between keys in cents:</h>
                <input 
                    id = "keys_setting_input"
                    bind:value={dCents}
                    type="number" 
                    min="0"
                    max="1200"
                />
            </div>
            <div>
                <h style="color: var(--very-dark);">Number of new keys:</h>
                <input 
                    id = "keys_setting_input"
                    bind:value={numNewKeys}
                    type="number" 
                    min="1"
                    max="20"
                />
            </div>
            <div>
                <h style="color: var(--very-dark);">Harmonicity</h>
                <input id="alpha_input" type="range" min="0" max="1" bind:value={alpha} step=".01"/>
                <h style="color: var(--very-dark);">Diversity</h>
            </div>
        </div>
    {/if}
</div>


<style>
    #new_keys_settings_dropdown {
        position: absolute;
        top: calc(100vh - 153px);
        left: 120px;
        background-color: var(--light);
        border: 1px solid #ccc;
        padding: 5px;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
    }

    #keys_setting_input {
        color: var(--very-dark);
        border-radius: 5px;
        background-color: var(--very-light);
        height: 24px;
        width: 50px;
        padding-left: 5px;
    }

    #alpha_input {
        margin-left: 5px;
        width: 150px;
        accent-color: var(--background-dark);
    }

    .bottom_panel_element {
        margin-right: 15px;
        user-select: none;
    }

    .active_button {
        fill: var(--green);
    }
</style>
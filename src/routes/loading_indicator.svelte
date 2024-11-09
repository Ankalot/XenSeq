<script lang="ts">
    export let active = false;
</script>


<div class="loading_indicator {active ? 'visible' : ''}"></div>


<style>
    .loading_indicator {
        position: absolute;
        top: 90px;
        left: 150px;
        width: 40px;
        height: 40px;
        border: 8px solid var(--light);
        border-top: 8px solid var(--background-medium);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
        visibility: hidden;
    }

    .loading_indicator.visible {
        visibility: visible;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>
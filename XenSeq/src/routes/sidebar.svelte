<script>
	export let open = false
</script>


<aside class="absolute w-full h-full bg-gray-200 shadow-lg" class:open>
	<h1 style="text-align: center; margin-bottom: 10px">INTERACTIONS WITH NOTES</h1>
    <p> 1. Click LMB on the panel to create a note. </p>
    <p> 2. Click LMB on a note to select it, click SHIFT+LMB to select several notes. Click ESCAPE to remove selection. </p>
    <p> 3. Click RMB on a note to delete it. Click DELETE to delete selected note(-s). </p>
    <p> 4. You can drag or resize selected note(-s) using LMB. </p>
    <p> 5. When note(-s) is(are) selected, you can set the number of cents (use "0-9", ".", BACKSPACE, then hit ENTER) </p>
    <p> 6. Use Ctrl+A to select all notes. </p>
    <h1 style="text-align: center; margin-bottom: 10px; margin-top: 10px">OTHER</h1>
    <p> 1. Use Ctrl+Scroll to zoom in/out. </p>
    <p> 2. Use Spacebar to play/stop. </p>
</aside>


<style>
	aside {
        text-align: left;
		right: 0%;
		transition: opacity 0.2s ease-in-out, visibility 0.2s 0.2s;
        width: 500px;
        z-index: 100;
        background-color: var(--background-medium);
        padding: 20px;
        opacity: 0;
        visibility: hidden;
	}
	
	.open {
        opacity: 1;
        visibility: visible;
        transition: opacity 0.2s ease-in-out;
	}
</style>
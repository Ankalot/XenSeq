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
    <p> 7. Press ArrowUp and ArrowDown to shift note(-s) up or down by a cent. </p>
    <p> 7. Press SHIFT+ArrowUp and SHIFT+ArrowDown to shift note(-s) up or down by an octave. </p>
    <p> 8. Use Ctrl+C and Ctrl+V to copy selected notes and paste them. </p>
    <p style="color: var(--green)">
        9. Click Middle Mouse Wheel on a note (it will become selected) to change velocity of selected note(-s). </p>
        
    <h1 style="text-align: center; margin-bottom: 10px; margin-top: 10px">OTHER</h1>
    <p style="color: var(--green)">
        1. Scale zone is a range slider above the timeline. </p>
    <p> 2. Use Ctrl+Scroll to zoom in/out. </p>
    <p> 3. Use Spacebar to play/stop. </p>
    <p> 4. Press "Z", "X", "C", ..., "A", "S", "D", ..., "Q", "W", "E", ... buttons while in "Define keys" mode to play notes. </p>
    <p> 5. Click on cents of the notes on the left panel to play them. </p>
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
        overflow-y: scroll;
	}
	
	.open {
        opacity: 1;
        visibility: visible;
        transition: opacity 0.2s ease-in-out;
	}
</style>
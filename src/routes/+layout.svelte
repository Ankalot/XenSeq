<script>
  import '../app.css';
  import { beforeNavigate } from '$app/navigation';

  beforeNavigate(({ to, from, cancel }) => {
    const leavePage = window.confirm('You have unsaved changes. Are you sure you want to leave?');
    if (!leavePage) {
        cancel();
    }
  });
</script>

<style>
  @import url('https://fonts.cdnfonts.com/css/berlin-sans-fb');
</style>
  
<slot />
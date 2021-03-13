<script>
    export let ip;

    $: parts = (ip || "").split(".");
    $: part1 = parseInt(parts[0]) || 0;
    $: part2 = parseInt(parts[1]) || 0;
    $: part3 = parseInt(parts[2]) || 0;
    $: part4 = parseInt(parts[3]) || 0;
    
    function set_parts() {
        ip = part1 + "." + part2 + "." + part3 + "." + part4;
    }
</script>

<input bind:value={part1} on:input={set_parts} size=3/>
<input bind:value={part2} on:input={set_parts} size=3/>
<input bind:value={part3} on:input={set_parts} size=3/>
<input bind:value={part4} on:input={set_parts} size=3/>

<style>
    input {
        margin: 0;
    }
</style>
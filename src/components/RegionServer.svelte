<script>
    import { createEventDispatcher } from "svelte"

    export let selected;
    export let servers;
    export let i;

    $: server = servers[i];

    $: server.name = server.name.replace(/[^\u0000-\u00ff]/g, "");
    $: server.ip = server.ip.replace(/[^0-9A-Za-z.]/g, "");
    $: server.port = Math.min(Math.max(server.port, 0), 65535);

    const dispatch = createEventDispatcher();
</script>

<div class="server-item">
    <h4>Server #{i + 1} <button class="not-good" on:click={() => dispatch("delete")}>-</button></h4>
    <input bind:value={server.name} on:input placeholder="Server name"/>&nbsp;Server name<br>
    <input bind:value={server.ip} on:input placeholder="Server IP"/>&nbsp;IP<br>
    <input bind:value={server.port} on:input type="number"/>&nbsp;Port<br>
    <input checked={selected === i} on:input on:change={() => selected = i} type="checkbox"/>&nbsp;Selected
</div>

<style>
    .server-item {
        border-radius: 8px;
        border: 1px solid #cccecc;
        padding: 14px;
        margin: 8px;
        min-width: 320px;
        flex: 0 1 0;
    }

    h4 {
        margin-top: 0;
        margin-bottom: 4px;
    }
</style>
<script>
    import { Buffer } from "buffer/"
    import parsePacket from "../lib/parsePacket.js"

    import { opcodes } from "../lib/constants/enums.js"

    import { createEventDispatcher } from "svelte"
import { PacketTypes } from "../lib/Workspace.js";

    export let packet;
    export let i;
    export let selected;

    const dispatch = createEventDispatcher();

    function select() {
        dispatch("select");
    }

    function del() {
        dispatch("delete");
    }

    let error = "";
    let parsed = null;

    function parse() {
        parsed = null;
        error = "";

        if (packet.data.length) {
            try {
                parsed = parsePacket(Buffer.from(packet.data), packet.serverbound ? "server" : "client");
                error = "";
            } catch (e) {
                error = e;
            }
        }
    }

    $: packet, parse();
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<div class="workspace-packet-container">
    <span class="num">{i + 1}.</span>
    <a class:selected class:erroring={error} class="workspace-packet" on:click={select}>
        <span>{packet.name || "Unnamed packet"}</span><br>
        <span class="num-bytes">{packet.data.length} byte{packet.data.length === 1 ? "" : "s"}
        {#if error}
            <span class="error">Error!</span>
        {:else if parsed}
            - {opcodes[parsed.opcode] || "Unknown"}
        {/if}
        <br>
        <span>{PacketTypes[packet.type]}</span><br>
        <span class="bound">{packet.serverbound ? "client -> server" : "server -> client"}</span>
    </a>
</div>

<style>
    .workspace-packet-container {
        display: flex;
        align-items: center;
    }

    .num-bytes {
        color: #1974c4;
    }

    .bound {
        color: #fbcd2d;
    }

    .workspace-packet {
        flex: 1 1 0;
        background-color: #1c1d1a;
        padding: 6px;
        border-radius: 8px;
        margin: 6px;
        cursor: pointer;
    }

    .workspace-packet {
        text-decoration: none;
    }

    .selected {
        border: 2px solid #1974c4;
        padding: 4px;
    }

    .erroring {
        border: 2px solid #f1483b;
        padding: 4px;
    }
</style>
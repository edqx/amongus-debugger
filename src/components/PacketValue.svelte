<script>
    import { ToHex } from "../lib/util/ToHex.js"

    export let parent_keyname;
    export let object_keyname;
    export let packet_value;
    export let depth = 0;
    export let index = -1;

    $: keypath = (parent_keyname ? parent_keyname + (~index ? "[" + index + "]" : "") + "." : "") + object_keyname;

    let copied = null;

    function copyValue() {
        var inp = document.createElement("input");
        document.body.appendChild(inp);
        inp.value = packet_value.value;
        inp.select();

        document.execCommand("copy", false);

        inp.remove();

        clearTimeout(copied);
        copied = setTimeout(function () {
            clearTimeout(copied);
            copied = null;
        }, 1000);
    }

    $: hexstr = [...packet_value.slice].map(byte => ToHex(byte, null, packet_value.endianness === "big")).join(" ");

    $: warnings = packet_value.warnings.length ? packet_value.warnings.length + " warning" + (packet_value.warnings.length === 1 ? "" : "s") + ":\n" + packet_value.warnings.map((warning, i) => (i + 1) + ". " + warning).join("\n") : null;
</script>

{#if Array.isArray(packet_value.value)}
    <div class="packet-value" title={packet_value.description}>
        {#if packet_value.warnings.length}
            <span class="warning" title={warnings}>⚠</span>
        {/if}
        <span class="valname">{packet_value.name}</span>:
        <span class="{packet_value.type}">{packet_value.value.length}</span>
    </div>
    <div class="packet-group">
        {#each packet_value.value as value_item, index}
            <div>{index}:</div>
            <div class="packet-group">
                {#each Object.entries(value_item) as [keyname, packet_value]}
                    {#if typeof packet_value === "object"}
                        <svelte:self parent_keyname={keypath} object_keyname={keyname} {packet_value} depth={depth + 1} {index}/>
                    {/if}
                {/each}
            </div>
        {/each}
    </div>
{:else if typeof packet_value.value === "object"}
    <div class="packet-value" title={packet_value.description}>
        {#if packet_value.warnings.length}
            <span class="warning" title={warnings}>⚠</span>
        {/if}
        <span class="valname">{packet_value.name}</span>
    </div>
    <div class="packet-group">
        {#each Object.entries(packet_value.value) as [keyname, packet_value]}
            {#if typeof packet_value === "object"}
                <svelte:self parent_keyname={object_keyname} object_keyname={keyname} {packet_value} depth={depth + 1}/>
            {/if}
        {/each}
    </div>
{:else}
    <div class="packet-value" on:click={copyValue} title={packet_value.description}>
        {#if packet_value.warnings.length}
            <span class="warning" title={warnings}>⚠</span>
        {/if}
        <span class="valname">{packet_value.name}</span>:
        <span class="{packet_value.type}">
            {#if packet_value.type === "bitfield"}
                {packet_value.value.toString(2)}
            {:else}
                {packet_value.value}
            {/if}
        </span>
        (<span class="valtype">{packet_value.type}</span>)
        {#if typeof packet_value.display === "function"}
            <span class="comment">// {packet_value.display(packet_value.value)}</span>
        {:else if typeof packet_value.display === "object"}
            <span class="comment">// {packet_value.display[packet_value.value] || "Unknown."}</span>
        {/if}
        {#if copied}
            Copied!
        {/if}
    </div>
{/if}

<style>
    .packet-group {
        margin-left: 24px;
    }

    .packet-value {
        border-left: 1px solid #2c3134;
        padding: 6px;
        margin: 2px;
        cursor: pointer;
    }

    .packet-value:hover {
        background-color: #3b747c;
    }

    .valname {
        color: #bbb7b9;
    }

    .valtype {
        color: #ac8ac1;
    }

    .string {
        color: #9eac3c;
    }

    .string:before {
        content: "\"";
    }
    
    .string:after {
        content: "\"";
    }

    .packed, .float, .uint32, .int32, .uint16, .int16, .uint8, .int8, .byte {
        color: #e0af53;
    }

    .warning {
        color: #ffca28;
    }

    .comment {
        color: #3b424b;
    }
</style>
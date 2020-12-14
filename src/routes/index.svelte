<script>
    import { onMount, onDestroy } from "svelte"

    import toBuffer from "../lib/toBuffer.js"
    import parsePacket from "../lib/parsePacket.js"
    import { Packet, getWorkspace } from "../lib/Workspace.js"

    import { dbSharePacket, dbGetPacket } from "../lib/firebase.js"

    import WorkspacePacket from "../components/Packet.svelte"
    import PacketValue from "../components/PacketValue.svelte" 

    const workspace = getWorkspace();
    let selectedPacket = parseInt(localStorage.getItem("selected")) || 0;

    let packet = null;
    let packetname = "";
    let packetinput = "";
    let serverbound = false;

    function onSelect() {
        packet = workspace.packets[selectedPacket];

        packetname = packet.name;
        packetinput = packet.format();
        serverbound = packet.serverbound;

        localStorage.setItem("selected", selectedPacket);
    }

    function onKey(ev) {
        if (document.activeElement.tagName === "BODY") {
            if (ev.key === "ArrowDown") {
                selectedPacket++;
                if (selectedPacket >= workspace.packets.length) {
                    selectedPacket = workspace.packets.length - 1;
                }
            } else if (ev.key === "ArrowUp") {
                selectedPacket--;
                if (selectedPacket < 0) {
                    selectedPacket = 0;
                }
            }
        }
    }

    onMount(function () {
        document.addEventListener("keydown", onKey);
    });

    onDestroy(function () {
        document.removeEventListener("keydown", onKey);
    });

    function updatePacket() {
        packet.name = packetname;
        packet.data = (packetinput.match(/[^\s]{1,2}/g) || []).map(num => parseInt(num, 16));
        packet.serverbound = serverbound;

        workspace.save();
        workspace.packets = workspace.packets;
    }

    function newPacket() {
        workspace.packets.push(new Packet(workspace, {
            data: [],
            serverbound: false
        }));
        
        workspace.packets = workspace.packets;

        workspace.save();
        selectedPacket = workspace.packets.length - 1;
    }

    function deletePacket(i) {
        workspace.packets.splice(i, 1);
        workspace.packets = workspace.packets;

        if (workspace.packets.length === 0) {
            workspace.packets.push(new Packet(workspace, {
                data: [],
                serverbound: false
            }));
        }

        if (selectedPacket >= workspace.packets.length) {
            selectedPacket--;
        }

        workspace.save();
        
        onSelect();
    }

    $: selectedPacket, onSelect();

    let parsed = "";
    let error = "";

    function doRender() {
        if (packetinput.length) {
            const bytes = packetinput.replace(/[^a-fA-F0-9]/g, "").match(/[^\s]{1,2}/g).join(" ");

            try {
                parsed = parsePacket(toBuffer(bytes), serverbound ? "server" : "client");
                error = "";
            } catch (e) {
                error = e;
                parsed = "";

                console.log(e);
            }

            packetinput = bytes;
        } else {
            error = "";
            parsed = "";
        }
    }

    function selectPacket(i) {
        selectedPacket = i;
    }

    async function shareURL(packet) {
        try {
            const bytes = packet.format().replace(/ /g, "");
            const id = await dbSharePacket(packet.name, bytes, serverbound);
            const share_inp = document.getElementsByClassName("share-hidden")[0];

            if (share_inp) {
                share_inp.value = location.origin + "/" + id;

                share_inp.select();
                share_inp.setSelectionRange(0, 99999);

                document.execCommand("copy");
            }
        } catch (e) {
            
        }
    }

    $: packetinput, serverbound, doRender();
</script>

<span class="title">Among Us Debugger</span>
<span>Understand Among Us conversation packets, find errors and squish bugs.</span>
<span>If you encounter any issues, please file an issue through the repo on github.</span>
<span>Made by <a href="https://github.com/edqx/amongus-debugger">weakeyes</a>.</span>
<br><br>
<div class="center-wrapper">
    <div class="main-editor">
        <input class="packet-name" bind:value={packetname} on:change={updatePacket} spellcheck="false" placeholder="Packet name"/>
        <textarea class="packet-input" bind:value={packetinput} on:change={updatePacket} spellcheck="false" placeholder="Packet data"></textarea>
        <div style="margin-top: 4px;">
            <input bind:checked={serverbound} on:change={updatePacket} id="serverbound" type="checkbox"/>Server bound?
            <button style="float:right;" class="not-good" on:click={() => deletePacket(selectedPacket)}>Delete</button>
            <button style="float:right;margin-right: 4px;" class="good" on:click={shareURL(packet)}>Share</button>
            <input class="share-hidden"/>
        </div>
        <div class="parsed-packet">
            {#if parsed || error}
                {#if error}
                    <span class="error">{error}</span>
                {:else}
                    {#each Object.entries(parsed) as [keyname, packet_value]}
                        {#if typeof packet_value === "object"}
                            <PacketValue parent_keyname="packet" object_keyname={keyname} {packet_value}/>
                        {/if}
                    {/each}
                {/if}
            {/if}
        </div>
    </div>
    <div class="workspace-list">
        {#each workspace.packets as packet, i}
            <WorkspacePacket selected={selectedPacket === i} {packet} packeti={i} on:select={() => selectPacket(i)} on:delete={() => deletePacket(i)}/>
        {/each}
        <!-- svelte-ignore a11y-missing-attribute -->
        <a class="new-packet" on:click={newPacket}>
            +
        </a>
    </div>
</div>

<style>
    .new-packet {
        border: 1px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        padding: 6px;
        margin: 6px;
        cursor: pointer;
    }

    .new-packet:hover {
        background-color: #333333;
        text-decoration: none;
    }

    .center-wrapper {
        display: flex;
    }

    .main-editor {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        margin-right: 10%;
        flex: 3 1 0;
    }

    .workspace-list {
        display: flex;
        flex-direction: column;
        flex: 1 1 0;
    }

    .packet-input {
        border-radius: 8px;
        background-color: #cccecc;
        color: #2e2e2e;
        outline: none;
        border: none;
        resize: vertical;
        height: 175px;
        font-family: "Andale Mono", monospace;
        font-size: 12pt;
        padding: 16px;
    }

    .parsed-packet {
        margin-top: 2%;
        text-align: left;
    }

    .share-hidden {
        position: absolute;
        left: -9999px;
    }
</style>
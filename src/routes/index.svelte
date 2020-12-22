<script>
    import { onMount, onDestroy } from "svelte"

    import toBuffer from "../lib/toBuffer.js"
    import parsePacket from "../lib/parsePacket.js"
    import parseAnnouncement from "../lib/parseAnnouncement.js"
    import parseRegionInfo from "../lib/parseRegionInfo.js"
    import { Packet, getWorkspace, PacketTypes } from "../lib/Workspace.js"

    import { dbSharePacket } from "../lib/firebase.js"

    import WorkspacePacket from "../components/Packet.svelte"
    import PacketField from "../components/Field.svelte"

    const workspace = getWorkspace();
    let selectedPacket = parseInt(localStorage.getItem("selected")) || 0;

    let packet = null;
    let packetname = "";
    let packettype = 0;
    let packetinput = "";
    let serverbound = false;

    function onSelect() {
        packet = workspace.packets[selectedPacket];

        packetname = packet.name;
        packetinput = packet.format();
        serverbound = packet.serverbound;
        packettype = packet.type;

        localStorage.setItem("selected", selectedPacket);
        versions.splice(0);
        recordVersion();
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
    
    const versions = [];
    let onversion = 0;

    function timeTravel(e) {
        if (e.code === "KeyZ" && e.ctrlKey) {
            e.preventDefault();

            if (versions.length && onversion > 0) {
                onversion--;
                packetinput = versions[onversion];
            }
        } else if (e.code === "KeyY" && e.ctrlKey) {
            e.preventDefault();

            if (onversion < versions.length - 1) {
                onversion++;
                packetinput = versions[onversion];
            }
        }
    }

    function recordVersion() {
        versions.splice(onversion + 1);
        versions.push(packetinput);
        onversion = versions.length - 1;
    }

    function selectPacket(i) {
        selectedPacket = i;
        versions.splice(0);
        recordVersion();
    }

    function updatePacket() {
        packet.name = packetname;
        packet.data = (packetinput.match(/[^\s]{1,2}/g) || []).map(num => parseInt(num, 16));
        packet.serverbound = serverbound;
        packet.type = packettype;

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
    
    let packet_data_input;

    function doRender() { 
        if (packetinput.length) {
            let curpos;
            if (packet_data_input) {
                curpos = packet_data_input.selectionStart;
            }
            
            const before = (packetinput.substring(0, curpos).replace(/[^a-fA-F0-9]/g, "").match(/[^\s]{1,2}/g) || []).join(" ");
            const bytes = (packetinput.replace(/[^a-fA-F0-9]/g, "").match(/[^\s]{1,2}/g) || []).join(" ");

            try {
                switch (packettype) {
                    case 0:
                        parsed = parsePacket(toBuffer(bytes), serverbound ? "server" : "client");
                        break;
                    case 1:
                        parsed = parseAnnouncement(toBuffer(bytes), serverbound ? "server" : "client");
                        break;
                }
                error = "";
            } catch (e) {
                error = e;
                parsed = "";
            }

            packetinput = bytes;
            if (packet_data_input) {
                packet_data_input.value = bytes;
                createSelection(packet_data_input, before.length, before.length);
            }
        } else {
            error = "";
            parsed = "";
        }
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

    // https://stackoverflow.com/questions/646611/programmatically-selecting-partial-text-in-an-input-field
    function createSelection(field, start, end) {
        if (field.createTextRange) {
            var selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart("character", start);
            selRange.moveEnd("character", end);
            selRange.select();
            field.focus();
        } else if (field.setSelectionRange) {
            field.focus();
            field.setSelectionRange(start, end);
        } else if (typeof field.selectionStart != "undefined") {
            field.selectionStart = start;
            field.selectionEnd = end;
            field.focus();
        }
    }

    function selectHex({ detail: ev }) {
        if (packet_data_input) {
            createSelection(packet_data_input, ev.start * 3, ev.end * 3 - 1);
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
        <div class="packet-name">
            <input class="packet-name" bind:value={packetname} on:change={updatePacket} spellcheck="false" placeholder="Packet name"/>
            <select class="packet-type" bind:value={packettype} on:blur={updatePacket} on:change={updatePacket}>
                {#each PacketTypes as type, i}
                    <option value={i}>{type}</option>
                {/each}
            </select>
        </div>
        <textarea class="packet-input" bind:this={packet_data_input} bind:value={packetinput} on:change={updatePacket} on:input={recordVersion} on:keydown={timeTravel} spellcheck="false" placeholder="Packet data"></textarea>
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
                            <PacketField on:hexsel={selectHex} parent_keyname="packet" object_keyname={keyname} {packet_value}/>
                        {/if}
                    {/each}
                {/if}
            {/if}
        </div>
    </div>
    <div class="workspace-list">
        {#each workspace.packets as packet, i}
            <WorkspacePacket selected={selectedPacket === i} {packet} i={i} on:select={() => selectPacket(i)} on:delete={() => deletePacket(i)}/>
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
        position: sticky;
        top: 0;
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

    div.packet-name {
        display: flex;
        align-items: center;
    }

    input.packet-name {
        flex: 1 1 0;
    }

    .packet-type {
        margin-left: 4px;
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
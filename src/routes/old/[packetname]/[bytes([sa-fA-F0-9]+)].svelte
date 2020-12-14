<script context="module">
    export async function preload(page) {
        const { packetname, bytes } = page.params;

        return { packetname, bytes };
    }
</script>

<script>
    import { goto } from "@sapper/app"
    import { Packet, getWorkspace } from "../../../lib/Workspace.js"

    export let bytes;
    export let packetname;
    
    const workspace = getWorkspace();

    workspace.packets.push(new Packet(workspace, {
        name: packetname,
        data: (bytes.slice(1).match(/[^\s]{1,2}/g) || []).map(num => parseInt(num, 16)),
        serverbound: bytes[0] === "s"
    }));

    workspace.save();
    
    localStorage.setItem("selected", workspace.packets.length - 1);

    goto("/");
</script>
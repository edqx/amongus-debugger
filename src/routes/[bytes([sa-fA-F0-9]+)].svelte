<script context="module">
    export async function preload(page) {
        const { bytes } = page.params;

        return { bytes };
    }
</script>

<script>
    import { goto } from "@sapper/app"
    import { Packet, getWorkspace } from "../lib/Workspace.js"

    export let bytes;
    
    const workspace = getWorkspace();

    workspace.packets.push(new Packet(workspace, {
        name: "",
        data: (bytes.slice(1).match(/[^\s]{1,2}/g) || []).map(num => parseInt(num, 16)),
        serverbound: bytes[0] === "s"
    }));

    workspace.save();
    
    localStorage.setItem("selected", workspace.packets.length - 1);

    goto("/");
</script>
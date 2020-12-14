<script context="module">
    export async function preload(page) {
        const { docid } = page.params;

        return { docid };
    }
</script>

<script>
    import { goto } from "@sapper/app"
    import { Packet, getWorkspace } from "../lib/Workspace.js"
    import { dbGetPacket } from "../lib/firebase.js"

    export let docid;

    (async () => {
        try {
            const workspace = getWorkspace();
            const packet = await dbGetPacket(docid);

            if (typeof packet.data !== "string") {
                console.log("Not string.");
                return goto("/");
            }
            
            if (typeof packet.name !== "string") {
                console.log("Not string.");
                return goto("/");
            }
            
            if (typeof packet.serverbound !== "boolean") {
                console.log("Not boolean.");
                return goto("/");
            }

            workspace.packets.push(new Packet(workspace, {
                name: packet.name,
                data: (packet.data.match(/[^\s]{1,2}/g) || []).map(num => parseInt(num, 16)),
                serverbound: packet.serverbound
            }));

            workspace.save();
            
            localStorage.setItem("selected", workspace.packets.length - 1);

            goto("/");
        } catch (e) {
            console.log(e);
            return goto("/");
        }
    })();
</script>
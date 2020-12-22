export function createWorkspace() {
    return new Workspace({
        packets: [
            {
                data: [8, 0, 1, 0, 70, 210, 2, 3, 8, 119, 101, 97, 107, 101, 121, 101, 115],
                serverbound: true,
                name: "Hello"
            },
            {
                data: [0, 121, 0, 14, 1, 6, 17, 0, 0, 8, 77, 97, 115, 116, 101, 114, 45, 53, 198, 58, 99, 71, 7, 86, 233, 49, 17, 0, 0, 8, 77, 97, 115, 116, 101, 114, 45, 54, 45, 79, 5, 6, 7, 86, 220, 52, 16, 0, 0, 8, 77, 97, 115, 116, 101, 114, 45, 52, 45, 79, 40, 75, 7, 86, 44, 17, 0, 0, 8, 77, 97, 115, 116, 101, 114, 45, 51, 45, 79, 40, 75, 7, 86, 218, 93, 17, 0, 0, 8, 77, 97, 115, 116, 101, 114, 45, 50, 104, 237, 135, 186, 7, 86, 141, 57, 17, 0, 0, 8, 77, 97, 115, 116, 101, 114, 45, 49, 104, 237, 135, 186, 7, 86, 146, 2],
                serverbound: false,
                name: "Master server list"
            }
        ],
        options: {}
    });
}

export function getWorkspace() {
    const item = localStorage.getItem("workspace");

    if (item) {
        const workspace = new Workspace(JSON.parse(item));
        
        return workspace;
    } else {
        const workspace = createWorkspace();
        workspace.save();

        return getWorkspace();
    }
}

export class Packet {
    constructor(workspace, packet) {
        this.workspace = workspace;
        this.name = packet.name || "";
        this.data = packet.data || [];
        this.serverbound = packet.serverbound || false;
        this.type = packet.type || 0;
    }

    toJSON() {
        return {
            name: this.name,
            data: this.data,
            serverbound: this.serverbound,
            type: this.type
        }
    }

    format() {
        return this.data.map(num => {
            const hexstr = num.toString(16);

            return hexstr.length === 1 ? "0" + hexstr : hexstr;
        }).join(" ");
    }

    delete() {
        this.workspace.deletePacket(this);
    }
}

export class Workspace {
    constructor(workspace) {
        this.packets = workspace.packets.map(packet => new Packet(this, packet));

        this.options = {};
    }

    clear() {
        this.packets.splice(0);
    }

    save() {
        localStorage.setItem("workspace", JSON.stringify(this));
    }

    deletePacket(packet) {
        this.packets.splice(this.packets.indexOf(packet), 1);
    }
}

export const PacketTypes = [
    "Game server",
    "Announcement server"
]
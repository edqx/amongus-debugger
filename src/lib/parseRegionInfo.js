import PacketReader from "./util/PacketReader.js"

export default function parseRegionInfo(buffer, bound) {
    const reader = new PacketReader(buffer);

    const packet = {};

    packet.selected = reader.int32LE("Selected", "The current packet that is selected.");
    packet.name = reader.string("Region name", "The name of the region.");
    packet.pingip = reader.string("Ping IP", "The IP address to ping for network latency.");

    const num_servers = reader.int32LE("Number of servers", "The number of servers in the region.").value;
    packet.servers = [];
    for (let i = 0; i < num_servers; i++) {
        const server = {};
        server.name = reader.string("Server name", "The name of the server.");
        server.ip = reader.bytes(4, "IP address", "The IP address of the server.");
        server.ip.value = server.ip.value.join(".");
        server.port = reader.uint16LE("Port", "The port of the server.");

        packet.servers.push(server);
    }

    return packet;
}
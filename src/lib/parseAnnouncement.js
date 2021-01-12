import PacketReader from "./util/PacketReader.js"

import * as e from "./constants/enums.js"

const announcement_opcodes = {
    0: "Unreliable",
    1: "Reliable",
    8: "Hello",
    9: "Disconnect",
    10: "Acknowledge",
    12: "Ping"
};

const announcement_payloads = {
    0: "Cache",
    1: "Data",
    2: "Free weekend",
}

const free_items = {
    0: "Nothing",
    1: "Mira HQ",
    2: "Polus"
};

export default function parseAnnouncement(buffer, bound) {
    const packet_reader = new PacketReader(buffer);

    const packet = {};
    
    packet.opcode = packet_reader.uint8("Opcode", "The opcode for the announcement message.", announcement_opcodes);

    switch (packet.opcode.value) {
        case 0:
        case 1:
            packet.nonce = packet_reader.uint16BE("Nonce", "The acknowledgement identifier for the packet.");

            packet.payloads = {
                name: "Payloads",
                description: "The payloads in the packet.",
                value: [],
                endianness: null,
                startpos: packet_reader.offset,
                size: packet_reader.buffer.byteLength - 2,
                slice: packet_reader.slice(packet_reader.offset).buffer,
                warnings: []
            }

            while (packet_reader.left) {
                const payload = {};
                const payload_length = packet_reader.uint16LE("Payload length", "The length of the payload.");
                payload.tag = packet_reader.uint8("Payload tag", "The payload tag.", announcement_payloads);
                const payload_reader = packet_reader.slice(packet_reader.offset, payload_length.value);

                payload.bound = packet.bound;

                switch (payload.tag.value) {
                    case 0:
                        break;
                    case 1:
                        payload.announcement_id = payload_reader.packed("Announcement ID", "The ID of the announcement.");
                        payload.message = payload_reader.string("Message", "The message for the announcement.");
                        break;
                    case 2:
                        payload.free_items = payload_reader.uint8("Free state", "The state of the free items in the game (i.e. which items are free)", free_items);
                        break;
                }

                packet_reader.goto(payload_reader.end);
                packet.payloads.value.push(payload);
            }
            break;
        case 8:
            packet.nonce = packet_reader.uint16BE("Nonce", "The acknowledgement identifier for the packet.");
            packet.option = packet_reader.uint8("Send option", "The send option for the announcement message.");
            if (packet.option.value !== 0) {
                packet.option.warnings.push("Send option is hardcoded at 0.");
            }
            packet.version = packet_reader.packed("Protocol version", "The version of the announcement message.");
            packet.ip = packet_reader.packed("Announcement ID", "The current announcement ID to determine cache or new announcement data.");
            packet.language = packet_reader.packed("Language", "The language of the client.", e.language_ids);
            break;
        case 9:
            break;
        case 10:
            packet.nonce = packet_reader.uint16BE("Nonce", "The acknowledgement identifier to acknowledge.");
            packet.received = packet_reader.bitfield("Received", "A bitfield of the last 8 packets and whether or not they were acknowledged, telling the receiver that you are still waiting for these packets.");
            break;
        case 12:
            packet.nonce = packet_reader.uint16BE("Nonce", "The acknowledgement identifier for the packet.");
            break;
    }

    return packet;
}
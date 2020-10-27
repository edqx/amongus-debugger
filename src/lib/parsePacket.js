import BufferReader from "./util/BufferReader.js"

import { LerpValue } from "./util/Lerp.js"

export default function parsePacket(buffer, bound) {
    const reader = new BufferReader(buffer);

    const packet = {};
    packet.warnings = [];

    
    function parseGameOptions() {
        let options = {};

        const lenpos = reader.offset;
        reader.expect(0x01, "game options length");
        options.length = reader.packed();
        const start = reader.offset;
        reader.expect(0x01, "version");
        options.version = reader.byte();
        reader.expect(0x01, "max players");
        options.maxPlayers = reader.uint8();
        reader.expect(0x04, "language");
        options.language = reader.uint32LE();
        reader.expect(0x01, "map ID");
        options.mapID = reader.byte();
        reader.expect(0x04, "player speed");
        options.playerSpeed = reader.floatLE();
        reader.expect(0x04, "crew vision");
        options.crewVision = reader.floatLE();
        reader.expect(0x04, "imposter vision");
        options.imposterVision = reader.floatLE();
        reader.expect(0x04, "kill cooldown");
        options.killCooldown = reader.floatLE();
        reader.expect(0x01, "common tasks");
        options.commonTasks = reader.uint8();
        reader.expect(0x01, "long tasks");
        options.longTasks = reader.uint8();
        reader.expect(0x01, "short tasks");
        options.shortTasks = reader.uint8();
        reader.expect(0x01, "emergencies");
        options.emergencies = reader.int32LE();
        reader.expect(0x01, "imposter count");
        options.imposterCount = reader.uint8();
        reader.expect(0x01, "kill distance");
        options.killDistance = reader.byte();
        reader.expect(0x04, "discussion time");
        options.discussionTime = reader.int32LE();
        reader.expect(0x04, "voting time");
        options.votingTime = reader.int32LE();
        reader.expect(0x01, "is default");
        options.isDefault = reader.bool();

        if (options.version >= 1 && reader.offset < reader.size) {
            reader.expect(0x01, "emergency cooldown");
            options.emergencyCooldown = reader.uint8();
        }

        if (options.version >= 2 && reader.offset < reader.size - 1) {
            reader.expect(0x01, "confirm ejects");
            options.confirmEjects = reader.bool();
            reader.expect(0x01, "visual tasks");
            options.visualTasks = reader.bool();
        }

        /*if (options.version >= 3 && reader.offset < reader.size - 1) {
            reader.expect(0x01, "anonymous voting");
            options.anonymousVoting = reader.bool();
            reader.expect(0x01, "task bar updates");
            options.taskBarUpdates = reader.uint8();
        }*/

        if (reader.offset - start !== options.length) {
            packet.warnings.push("Invalid length of game options at byte " + lenpos + ", expected " + (reader.offset - start) + ", got " + options.length + ".");
        }

        return options;
    }

    reader.expect(0x01, "opcode");
    packet.opcode = reader.uint8();

    packet.bound = bound;

    switch (packet.opcode) {
        case 0x00: // Unreliable
        case 0x01: // Reliable
            packet.reliable = packet.opcode === 0x01;
        
            if (packet.reliable) {
                reader.expect(0x02, "nonce");
                packet.nonce = reader.uint16BE();
            }

            packet.payloads = [];

            while (reader.offset < reader.size) {
                const payload = {};

                reader.expect(0x02, "payload length");
                payload.length = reader.uint16LE();
                reader.expect(0x01, "payload tag");
                payload.tag = reader.uint8();

                const payloadend = reader.offset + payload.length;

                switch (payload.tag) {
                    case 0x00: // Host game
                        if (packet.bound === "client") {
                            reader.expect(0x04, "game code");
                            payload.code = reader.int32LE();
                        } else if (packet.bound === "server") {
                            payload.options = parseGameOptions();
                        }
                        break;
                    case 0x01: // Join game
                        if (packet.bound === "client") {
                            payload.error = reader.size !== 18;
    
                            if (payload.error) {
                                reader.expect(0x01, "reason");
                                payload.reason = reader.uint8();
    
                                if (payload.reason === 0x08 && reader.left) {
                                    payload.message = reader.string();
                                }
                            } else {
                                reader.expect(0x04, "game code");
                                payload.code = reader.int32LE();
                                reader.expect(0x04, "client ID");
                                payload.clientid = reader.uint32LE();
                                reader.expect(0x04, "host ID");
                                payload.hostid = reader.uint32LE();
                            }
                        } else if (packet.bound === "server") {
                            reader.expect(0x04, "game code");
                            payload.code = reader.int32LE();
                            reader.expect(0x01, "map ownership");
                            payload.mapOwnership = reader.byte();
                        }
                        break;
                    case 0x02: // Start game
                        reader.expect(0x04, "code");
                        payload.code = reader.int32LE();
                        break;
                    case 0x03: // Remove game
                        break;
                    case 0x04: // Remove player
                        reader.expect(0x04, "code");
                        payload.code = reader.int32LE();
                        reader.expect(0x04, "client ID");
                        payload.clientid = reader.uint32LE();
                        reader.expect(0x04, "host ID");
                        payload.hostid = reader.uint32LE();
    
                        if (reader.left) {
                            reader.expect(0x01, "reason");
                            payload.reason = reader.uint8();
            
                            if (payload.reason === 0x08) {
                                reader.expect(0x01, "message")
                                payload.message = reader.string();
                            }
                        }
                        break;
                    case 0x05: // Game data
                    case 0x06: // Game data to
                        reader.expect(0x04, "code");
                        payload.code = reader.int32LE();
    
                        if (payload.tag === 0x06) {
                            reader.expect(0x01, "recipient");
                            payload.recipient = reader.packed();
                        }

                        payload.parts = [];
    
                        while (reader.offset < payloadend) {
                            const part = {};
                            reader.expect(0x02, "length");
                            part.length = reader.uint16LE();
                            reader.expect(0x01, "message type");
                            part.type = reader.uint8();
                            const partend = reader.offset + part.length;
    
                            switch (part.type) {
                                case 0x01: // Data
                                    reader.expect(0x01, "net ID");
                                    part.netid = reader.packed();
                                    part.datalen = partend - reader.offset;
                                    reader.expect(part.datalen, "deserialise data");
                                    part.data = reader.buffer.slice(reader.offset, partend);
                                    reader.jump(part.datalen);
                                    break;
                                case 0x02: // RPC
                                    reader.expect(0x01, "handler ID");
                                    part.handlerid = reader.packed();
                                    reader.expect(0x01, "rpc ID");
                                    part.rpcid = reader.uint8();
    
                                    switch (part.rpcid) {
                                        case 0x00: // Play animation
                                            reader.expect(0x01, "animation ID");
                                            part.animation = reader.byte();
                                            break;
                                        case 0x01: // Complete task
                                            reader.expect(0x01, "task ID");
                                            part.taskid = reader.byte();
                                            break;
                                        case 0x02: // Sync settings
                                            part.options = parseGameOptions(reader);
                                            break;
                                        case 0x03: // Set infected
                                            reader.expect(0x01, "imposter count");
                                            part.count = reader.packed();
                                            reader.expect(part.count, "imposters");
                                            part.infected = reader.bytes(part.count);
                                            break;
                                        case 0x04: // Exiled
                                            break;
                                        case 0x05: // Check name
                                            reader.expect(0x01, "name");
                                            part.name = reader.string();
                                            break;
                                        case 0x06: // Set name
                                            reader.expect(0x01, "name");
                                            part.name = reader.string();
                                            break;
                                        case 0x07: // Check name
                                            reader.expect(0x01, "colour ID");
                                            part.colour = reader.uint8();
                                            break;
                                        case 0x08: // Set name
                                            reader.expect(0x01, "colour ID");
                                            part.colour = reader.uint8();
                                            break;
                                        case 0x09: // Set hat
                                            reader.expect(0x01, "hat ID");
                                            part.hat = reader.uint8();
                                            break;
                                        case 0x0a: // Set skin
                                            reader.expect(0x01, "skin ID");
                                            part.skin = reader.uint8();
                                            break;
                                        case 0x0b: // Report dead body
                                            reader.expect(0x01, "dead body ID");
                                            part.targetid = reader.uint8();
                                            break;
                                        case 0x0c: // Murder player
                                            reader.expect(0x01, "target net ID");
                                            part.targetnetid = reader.packed();
                                            break;
                                        case 0x0d: // Send chat
                                            reader.expect(0x01, "text");
                                            part.text = reader.string();
                                            break;
                                        case 0x0e: // Start meeting
                                            reader.expect(0x01, "target ID");
                                            part.targetid = reader.uint8();
                                            break;
                                        case 0x0f: // Set scanner
                                            reader.expect(0x01, "scanning?");
                                            part.scanning = reader.bool();
                                            reader.expect(0x01, "count");
                                            part.count = reader.uint8();
                                            break;
                                        case 0x10: // Send chat note
                                            reader.expect(0x01, "player ID");
                                            part.playerid = reader.uint8();
                                            reader.expect(0x01, "note type");
                                            part.notetype = reader.uint8();
                                            break;
                                        case 0x11: // Set pet
                                            reader.expect(0x01, "pet ID");
                                            part.pet = reader.uint8();
                                            break;
                                        case 0x12: // Set start counter
                                            reader.expect(0x01, "sequence");
                                            part.sequence = reader.packed();
                                            reader.expect(0x01, "time");
                                            part.time = reader.int8();
                                            break;
                                        case 0x13: // Enter vent
                                            reader.expect(0x01, "sequence");
                                            part.sequence = reader.packed();
                                            reader.expect(0x01, "vent ID");
                                            part.ventid = reader.packed();
                                            break;
                                        case 0x14: // Exit vent
                                            reader.expect(0x01, "vent ID");
                                            part.ventid = reader.packed();
                                            break;
                                        case 0x15: // Snap to
                                            reader.expect(0x02, "x position");
                                            part.x = LerpValue(reader.uint16LE() / 65535, -40, 40);
                                            reader.expect(0x02, "y position");
                                            part.y = LerpValue(reader.uint16LE() / 65535, -40, 40);
                                            break;
                                        case 0x16: // Close
                                            break;
                                        case 0x17: // Voting complete
                                            reader.expect(0x01, "number of states");
                                            part.num_states = reader.packed();
                                            reader.expect(part.num_states, "states");
                                            part.states = reader.bytes(part.num_states);
                                            reader.expect(0x01, "exiled ID");
                                            part.exiled = reader.uint8();
                                            reader.expect(0x01, "tie?");
                                            part.tie = reader.bool();
                                            break;
                                        case 0x18: // Cast vote
                                            reader.expect(0x01, "voter ID");
                                            part.voterid = reader.uint8();
                                            reader.expect(0x01, "suspect ID");
                                            part.suspectid = reader.uint8();
                                            break;
                                        case 0x19: // Clear vote
                                            break;
                                        case 0x1a: // Add vote
                                            reader.expect(0x01, "player ID");
                                            part.playerid = reader.uint8();
                                            break;
                                        case 0x1b: // Close doors of type
                                            reader.expect(0x01, "system type");
                                            part.systemtype = reader.uint8();
                                            break;
                                        case 0x1c: // Repair system
                                            reader.expect(0x01, "system type");
                                            part.systemtype = reader.uint8();
                                            reader.expect(0x01, "handler net ID");
                                            part.handlerid = reader.packed();
                                            reader.expect(0x01, "amount");
                                            part.amount = reader.uint8();
                                            break;
                                        case 0x1d: // Set tasks
                                            reader.expect(0x01, "player ID");
                                            part.playerid = reader.uint8();
                                            reader.expect(0x01, "number of tasks");
                                            part.num_tasks = reader.packed();
                                            reader.expect(0x01, "tasks");
                                            part.tasks = reader.bytes(part.num_tasks);
                                            break;
                                        case 0x1e: // Update game data
                                            part.players = [];
    
                                            while (reader.offset < partend) {
                                                const player = {};
                                                reader.expect(0x02, "player data length");
                                                player.length = reader.uint16LE();
    
                                                reader.expect(0x01, "player ID");
                                                player.playerid = reader.uint8();
                                                reader.expect(0x01, "name");
                                                player.name = reader.string();
                                                reader.expect(0x01, "colour ID");
                                                player.colour = reader.uint8();
                                                reader.expect(0x01, "hat ID");
                                                player.hat = reader.packed();
                                                reader.expect(0x01, "pet ID");
                                                player.pet = reader.packed();
                                                reader.expect(0x01, "skin ID");
                                                player.skin = reader.packed();
                                                reader.expect(0x01, "flags");
                                                player.flags = reader.byte();
                                                reader.expect(0x01, "number of tasks");
                                                player.num_tasks = reader.uint8();
    
                                                player.tasks = [];
                                                for (let i = 0; i < player.num_tasks; i++) {
                                                    const task = {};
                                                    reader.expect(0x01, "task ID");
                                                    task.taskid = reader.packed();
                                                    reader.expect(0x01, "completed");
                                                    task.completed = reader.bool();
                                                }

                                                part.players.push(player);
                                            }
                                            break;
                                    }
                                    break;
                                case 0x04: // Spawn
                                    reader.expect(0x01, "spawn ID");
                                    part.spawnid = reader.packed();
                                    reader.expect(0x01, "owner ID");
                                    part.ownerid = reader.packed();
                                    reader.expect(0x01, "spawn flags");
                                    part.flags = reader.byte();
                                    reader.expect(0x01, "number of components");
                                    part.num_components = reader.packed();
                                    part.components = [];
    
                                    for (let i = 0; i < part.num_components; i++) {
                                        const component = {};
                                        reader.expect(0x01, "net ID");
                                        component.netid = reader.packed();
                                        reader.expect(0x02, "data length");
                                        component.datalen = reader.uint16LE();
                                        reader.expect(0x01, "type");
                                        component.type = reader.uint8();
    
                                        reader.expect(component.datalen, "component data");
                                        component.data = reader.buffer.slice(reader.offset, reader.offset + component.datalen);
    
                                        reader.jump(component.datalen);
    
                                        part.components.push(component);
                                    }
                                    break;
                                case 0x05: // Despawn
                                    reader.expect(0x01, "net ID");
                                    part.netid = reader.packed();
                                    break;
                                case 0x06: // Scene change
                                    //reader.expect(0x01, "client ID");
                                    //part.clientid = reader.packed();
                                    reader.expect(0x01, "location");
                                    part.location = reader.string();
                                    break;
                                case 0x07: // Ready
                                    reader.expect(0x01, "client ID");
                                    part.clientid = reader.packed();
                                    break;
                                case 0x08: // Change settings
                                    break;
                            }

                            reader.goto(partend);
                            payload.parts.push(part);
                        }
                        break;
                    case 0x07: // Joined game
                        reader.expect(0x04, "code");
                        payload.code = reader.int32LE();
                        reader.expect(0x04, "client ID");
                        payload.clientid = reader.uint32LE();
                        reader.expect(0x04, "host ID");
                        payload.hostid = reader.uint32LE();
                        reader.expect(0x01, "number of clients");
                        payload.num_clients = reader.packed();
    
                        payload.clients = [];
                        for (let i = 0; i < payload.num_clients; i++) {
                            reader.expect(0x01, "client ID");
                            payload.clients.push(reader.packed());
                        }
                        break;
                    case 0x08: // End game
                        reader.expect(0x04, "code");
                        payload.code = reader.int32LE();
                        reader.expect(0x01, "reason");
                        payload.reason = reader.uint8();
                        reader.expect(0x01, "show ad?");
                        payload.show_ad = reader.bool();
                        break;
                    case 0x0a: // Alter game
                        reader.expect(0x04, "code");
                        payload.code = reader.int32LE();
                        reader.expect(0x01, "alter tag");
                        payload.alter_tag = reader.uint8();
                        reader.expect(0x01, "public?");
                        payload.is_public = reader.bool();
                        break; 
                    case 0x0b: // Kick player
                        if (packet.bound === "client") {
                            reader.expect(0x04, "code");
                            payload.code = reader.int32LE();
                            reader.expect(0x01, "client ID");
                            payload.clientid = reader.packed();
                            reader.expect(0x01, "banned?");
                            payload.banned = reader.bool();
                        } else {
                            reader.expect(0x01, "client ID");
                            payload.clientid = reader.packed();
                            reader.expect(0x01, "banned?");
                            payload.banned = reader.bool();
                        }
                        break;
                    case 0x0d: // Redirect
                        reader.expect(0x04, "ip");
                        payload.ip = reader.bytes(0x04).join(".");
                        reader.expect(0x02, "port");
                        payload.port = reader.uint16LE();
                        break;
                    case 0x0e: // Master server list
                        reader.expect(0x01, "master server flag");
                        reader.byte();
                        reader.expect(0x01, "number of servers");
                        payload.num_servers = reader.uint8();
                        payload.servers = [];
                        for (let i = 0; i < payload.num_servers; i++) {
                            let server = {};
                            const start = reader.offset;
                            reader.expect(0x02, "server length");
                            server.length = reader.uint16LE();
                            reader.expect(0x01, "server flag");
                            server.flag = reader.byte();
                            reader.expect(0x01, "server name");
                            server.name = reader.string();
                            reader.expect(0x04, "server ip");
                            server.ip = reader.bytes(0x04).join(".");
                            reader.expect(0x02, "server port");
                            server.port = reader.uint16LE();
                            reader.expect(0x01, "number of players");
                            server.num_players = reader.packed();
    
                            if (reader.offset - start - 3 !== server.length) {
                                payload.warnings.push("Invalid length of master server at byte " + start + ", expected " + (reader.offset - start - 3) + ", got " + server.length + ".");
                            }
    
                            payload.servers.push(server);
                        }
                        break;
                    case 0x10: // Get game list v2
                        if (packet.bound === "client") {
                            reader.expect(0x02, "game list length");
                            payload.length = reader.uint16LE();
                            reader.expect(0x01, "game list flag");
                            reader.byte();
                            const start = reader.offset;
                            
                            payload.games = [];
                            while (reader.offset < start + payload.length) {
                                const game = {};
                                reader.expect(0x02, "game length");
                                game.length = reader.uint16LE();
                                reader.byte();
                                reader.expect(0x04, "game ip");
                                game.ip = reader.bytes(4).join(",");
                                reader.expect(0x02, "game port");
                                game.port = reader.uint16LE();
                                reader.expect(0x04, "game code");
                                game.code = reader.int32LE();
                                reader.expect(0x01, "game name");
                                game.name = reader.string();
                                reader.expect(0x01, "number of players");
                                game.num_players = reader.uint8();
                                reader.expect(0x01, "game age");
                                game.age = reader.packed();
                                reader.expect(0x01, "map ID");
                                game.map = reader.uint8();
                                reader.expect(0x01, "imposter count");
                                game.imposters = reader.uint8();
                                reader.expect(0x01, "max players");
                                game.max_players = reader.uint8();
                                
                                payload.games.push(game);
                            }
                        } else {
                            reader.expect(0x01, "game list flag");
                            reader.byte();
                            payload.options = parseGameOptions(reader);
                        }
                        break;
                    default:
                        packet.warnings.push("Invalid or unsupported tag.");
                }

                reader.goto(payloadend);
                packet.payloads.push(payload);
            }
            break;
        case 0x08: // Hello
            packet.bound = "server";
            packet.reliable = true;
            reader.expect(0x02, "nonce");
            packet.nonce = reader.uint16BE();
            reader.expect(0x01, "hazel version");
            packet.hazelver = reader.uint8();
            reader.expect(0x04, "client version");
            packet.clientver = reader.int32LE();
            reader.expect(0x01, "username");
            packet.username = reader.string();
            break;
        case 0x09: // Disconnect
            if (reader.left) {
                reader.expect(0x01, "reason");
                packet.reason = reader.uint8();

                if (packet.reason === 0x08) {
                    reader.expect(0x01, "message")
                    packet.message = reader.string();
                }
            }
            break;
        case 0x0a: // Acknowledege
            reader.expect(0x02, "nonce");
            packet.nonce = reader.uint16BE();
            const ffpos = reader.offset;
            let FF;
            if (reader.left < 1) {
                packet.warnings.push("Expected 0xFF after byte " + ffpos + ".");
            } else if ((FF = reader.uint8()) !== 0xFF) {
                packet.warnings.push("Expected 0xFF after byte " + ffpos + ", got 0x" + FF.toString(16).toUpperCase() + ".");
            }
            break;
        case 0x0c: // Ping
            packet.bound = "client";
            packet.reliable = true;
            reader.expect(0x02, "nonce");
            packet.nonce = reader.uint16BE();
            break;
        default:
            packet.warnings.push("Invalid or unsupported opcode.");
            break;
    }

    return packet;
}
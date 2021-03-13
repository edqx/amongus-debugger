import PacketReader from "./util/PacketReader.js"

import { FormatVersion } from "./util/Versions.js"
import { Int2Code } from "./util/GameCodes.js"
import { LerpValue } from "./util/Lerp.js"
import { ToHex } from "./util/ToHex.js"

import * as e from "./constants/enums.js"

function readGameOptions(reader, search) {
    const length = reader.packed("Length", "The length of the game options.");
    const start = reader.offset;

    const options = {
        name: "Game options",
        description: "The game settings for creation, syncing or searching.",
        value: {},
        endianness: null,
        startpos: reader.offset,
        size: length.value,
        slice: reader.slice(reader.offset, length.value).buffer,
        warnings: []
    }

    options.value.length = length;
    options.value.version = reader.byte("Version", "The version of the game options. (2, 3, 4)");
    options.value.max_players = reader.uint8("Max players", "The maximum players allowed in the game.");
    options.value.language = reader.uint32LE("Language", "The language of the chat in the game.");

    if (search) {
        options.value.mapID = reader.uint8("Map ID", "The map of the game.", e.map_ids);
    } else {
        options.value.maps = reader.bitfield("Map bitfield", "The maps to search for.", function (bitfield) {
            const maps = [];
            
            if (bitfield & 0x01) {
                maps.push("The Skeld");
            }

            if (bitfield & 0x02) {
                maps.push("Mira HQ");
            }

            if (bitfield & 0x04) {
                maps.push("Polus");
            }

            return maps.join(", ");
        });
    }

    options.value.playerSpeed = reader.floatLE("Player speed", "The speed multiplier for crewmates and imposters.");
    options.value.crewmateVision = reader.floatLE("Crewmate vision", "The vision multiplier for crewmates.");
    options.value.imposterVision = reader.floatLE("Imposter vision", "The vision multiplier for imposters.");
    options.value.killCooldown = reader.floatLE("Kill cooldown", "The cooldown required to wait between each kill for imposters.");
    options.value.commonTasks = reader.uint8("Common tasks", "The number of common tasks.");
    options.value.longTasks = reader.uint8("Long tasks", "The number of long tasks.");
    options.value.shortTasks = reader.uint8("Short tasks", "The number of short tasks.");
    options.value.emergencies = reader.int32LE("Emergencies", "The number of emergencies allowed for every player.");
    options.value.imposterCount = reader.uint8("Imposters", "The number of the imposters in the game.");
    options.value.killDistance = reader.byte("Kill distance", "The maximum distance for each kill.", e.distances);
    options.value.discussionTime = reader.int32LE("Discussion time", "The time allocated for discussion before voting, in seconds.");
    options.value.votingTime = reader.int32LE("Voting time", "The time allocated for voting, in seconds.");
    options.value.isDefault = reader.bool("Is default?", "Whether or not the game options are the preset recommended settings.");

    if (options.value.version.value >= 2) {
        options.emergencyCooldown = reader.uint8("Emergency cooldown", "The time required to wait between each emergency cooldown.");
    }


    if (options.value.version.value >= 3 && !search) {
        options.confirmEjects = reader.bool("Confirm ejects", "Whether or not ejects are confirmed, saying whether or not the voted out person was the imposter.");
        options.visualTasks = reader.bool("Visual tasks", "Whether or not tasks have a visual identifier if applicable, e.g. Medbay");
    }

    if (options.value.version.value >= 4 && !search) {
        options.anonymousVoting = reader.bool("Anonymous voting", "Whether or not votes during meetings are anonymous.");
        options.taskBarUpdates = reader.bool("When the task bar should update, after a task, after meetings or never.", e.task_bar_updates);
    }

    if (length.value !== reader.offset - start) {
        options.value.length.warnings.push("Expected " + (reader.offset - start) + ", got " + length.value + ".");
    }

    return options;
}

function readVoteState(reader, i) {
    const state = {};

    const byte = reader.byte();

    state.player_id = {
        name: "Player ID",
        description: "The player ID of the player.",
        value: i,
        type: "uint8",
        endianness: null,
        startpos: reader.offset,
        size: 1,
        slice: reader.slice(reader.offset, 1).buffer,
        warnings: []
    }

    state.voted_for = {
        name: "Voted for",
        description: "The player ID of who the player voted for.",
        value: (byte & 0xF) - 1,
        type: "uint8",
        endianness: null,
        startpos: reader.offset,
        size: 1,
        slice: reader.slice(reader.offset, 1).buffer,
        display: val => val === -1 ? "No one." : "",
        warnings: []
    }

    state.reported = {
        name: "Did report?",
        description: "Whether or not the player started the meeting.",
        value: (byte & 0x0b0010000) !== 0,
        type: "bool",
        endianness: null,
        startpos: reader.offset,
        size: 1,
        slice: reader.slice(reader.offset, 1).buffer,
        warnings: []
    }

    state.voted = {
        name: "Has voted?",
        description: "Whether or not the player has voted.",
        value: (byte & 0x0b0100000) !== 0,
        type: "bool",
        endianness: null,
        startpos: reader.offset,
        size: 1,
        slice: reader.slice(reader.offset, 1).buffer,
        warnings: []
    }

    state.dead = {
        name: "Is dead?",
        description: "Whether or not the player is dead.",
        value: (byte & 0x0b1000000) !== 0,
        type: "bool",
        endianness: null,
        startpos: reader.offset,
        size: 1,
        slice: reader.slice(reader.offset, 1).buffer,
        warnings: []
    }

    return state;
}

function readPlayerDataFlags(reader) {
    const flags = {
        name: "Flags",
        description: "Player flags.",
        value: {},
        type: "byte",
        endianness: null,
        startpos: reader.offset,
        size: 1,
        slice: reader.slice(reader.offset, 1).buffer,
        warnings: []
    };

    const byte = reader.byte();

    flags.value.reported = {
        name: "Disconnected?",
        description: "Whether or not the player has disconnected.",
        value: (byte & 0b1) !== 0,
        type: "bool",
        endianness: null,
        startpos: reader.offset,
        size: 1,
        slice: reader.slice(reader.offset, 1).buffer,
        warnings: []
    }

    flags.value.imposter = {
        name: "Imposter?",
        description: "Whether or not the player is an imposter.",
        value: (byte & 0b10) !== 0,
        type: "bool",
        endianness: null,
        startpos: reader.offset,
        size: 1,
        slice: reader.slice(reader.offset, 1).buffer,
        warnings: []
    }

    flags.value.dead = {
        name: "Dead?",
        description: "Whether or not the player is dead.",
        value: (byte & 0b100) !== 0,
        type: "bool",
        endianness: null,
        startpos: reader.offset,
        size: 1,
        slice: reader.slice(reader.offset, 1).buffer,
        warnings: []
    }

    return flags;
}

function readPlayerData(reader) {
    const player = {};
    player.playerId = reader.uint8("Player ID", "The player's player ID.");
    player.name = reader.string("Name", "The player's name.");
    player.colour = reader.uint8("Colour", "The player's colour,");
    player.hat = reader.packed("Hat", "The player's hat.");
    player.pet = reader.packed("Pet", "The player's pet.");
    player.skin = reader.packed("Skin", "The player's skin.");
    player.flags = readPlayerDataFlags(reader);
    
    const num_tasks = reader.packed("Number of tasks", "The number of tasks for the player.");
    player.tasks = {
        name: "Tasks",
        description: "The tasks for the player.",
        value: [],
        endianness: null,
        startpos: reader.offset,
        size: 0,
        slice: reader.slice(reader.offset, 0).buffer,
        warnings: []
    }

    for (let i = 0; i < num_tasks.value; i++) {
        const task = {};
        task.task_id = reader.packed("Task ID", "The task index of the player's tasks.");
        task.completed = reader.bool("Completed", "Whether or not the task has been completed.");
        player.tasks.value.push(task);
    }

    return player;
}

function readShipStatusComponent(reader, component, spawn) {
    
}

function readMeetingHudComponent(reader, component, spawn) {
    component.states = {
        name: "Components",
        description: "The components for the object being spawned.",
        value: [],
        endianness: null,
        startpos: reader.offset,
        size: reader.end - reader.offset,
        slice: reader.slice(reader.offset).buffer,
        warnings: []
    }

    if (spawn) {
        for (let i = 0; reader.left; i++) {
            component.states.value.push(readVoteState(reader, i));
        }
    } else {
        const updateMask = reader.packed().value;

        for (let i = 0; reader.left; i++) {
            if (((1 << i) & updateMask) !== 0) {
                component.states.value.push(readVoteState(reader, i));
            }
        }
    }
}

function readFollowerCameraComponent(reader, component, spawn) {

}

function readGameDataComponent(reader, component, spawn) {
    component.players = {
        name: "Players",
        description: "The players in the game data.",
        value: [],
        endianness: null,
        startpos: reader.offset,
        size: reader.end - reader.offset,
        slice: reader.slice(reader.offset).buffer,
        warnings: []
    }

    const num_players = reader.uint8("Number of players", "The number of players in the game data.");

    for (let i = 0; i < num_players.value; i++) {
        component.players.value.push(readPlayerData(reader));
    }
}

function readVoteBanSystemComponent(reader, component, spawn) {
    component.voted = {
        name: "Voted",
        description: "All players that have been voted.",
        value: [],
        endianness: null,
        startpos: reader.offset,
        size: reader.end - reader.offset,
        slice: reader.slice(reader.offset).buffer,
        warnings: []
    }

    const num_voted = reader.uint8("Number of players", "The number of players that have been voted.");
    
    for (let i = 0; i < num_voted; i++) {
        const vote = {};
        vote.clientid = reader.uint32LE("Voted", "The client ID of the voted player.");

        vote.votes = {
            name: "Votes",
            description: "All players that have voted this player.",
            value: [],
            endianness: null,
            startpos: reader.offset,
            size: 3,
            slice: reader.slice(reader.offset, 3).buffer,
            warnings: []
        }

        vote.votes.value.push(reader.packed());

        component.voted.push(vote);
    }
}

function readPlayerControlComponent(reader, component, spawn) {
    if (spawn) {
        component.isNew = reader.bool("Is new?", "Whether or not the player being spawned is the first time that it is seen.");
    }
    
    component.playerId = reader.uint8("Player ID", "The player ID of the player.");
}

function readPlayerPhysicsComponent(reader, component, spawn) {

}

function readCustomNetworkTransform(reader, component, spawn) {
    component.sequence = reader.uint16LE("Sequence number", "The sequence number of this movement.");
    
    component.xpos = reader.uint16LE("X position", "The X position of the player.");
    component.xpos.value = LerpValue(component.xpos.value / 65535, -40, 40);
    component.ypos = reader.uint16LE("Y position", "The X position of the player.");
    component.ypos.value = LerpValue(component.ypos.value / 65535, -40, 40);
    
    component.xvel = reader.uint16LE("X velocity", "The X velocity of the player.");
    component.xvel.value = LerpValue(component.xvel.value / 65535, -40, 40);
    component.yvel = reader.uint16LE("Y velocity", "The Y velocity of the player.");
    component.yvel.value = LerpValue(component.yvel.value / 65535, -40, 40);
}

export default function parsePacket(buffer, bound) {
    const packet_reader = new PacketReader(buffer);

    const packet = {};
    packet.bound = bound;
    packet.op = packet_reader.uint8("Opcode", "The opcode for the packet.", e.opcodes);

    switch (packet.op.value) {
        case 0x01:
            packet.reliable = true;
            packet.nonce = packet_reader.uint16BE("Nonce", "The acknowledgement identifier for the packet.");
        case 0x00:
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

            packet.payloads.name = "Payloads";

            while (packet_reader.left) {
                const payload = {};
                const payload_length = packet_reader.uint16LE("Payload length", "The length of the payload.");
                payload.tag = packet_reader.uint8("Payload tag", "The payload tag.", e.tags);
                const payload_reader = packet_reader.slice(packet_reader.offset, payload_length.value);

                payload.bound = packet.bound;

                switch (payload.tag.value) {
                    case 0x00:
                        if (payload.bound === "client") {
                            payload.code = payload_reader.int32LE("Game code", "The code for the newly created game.");
                        } else {
                            payload.options = readGameOptions(payload_reader);
                        }
                        break;
                    case 0x01:
                        if (payload.bound === "client") {
                            const int32le = payload_reader.buffer.readInt32LE(payload_reader.offset);
                            if (e.disconnect_reasons[int32le]) {
                                payload.reason = payload_reader.int32LE("Reason", "The reason for why the client could not join the game.", e.disconnect_reasons);

                                if (payload.reason.value === 8 && payload_reader.left > 0) {
                                    payload.message = payload_reader.string("Message", "The custom message for why the client failed to join.");
                                }
                            } else {
                                payload.code = payload_reader.int32LE("Game code", "The code of the game that the player joined.", Int2Code);
                                payload.clientid = payload_reader.uint32LE("Client ID", "The client ID of the player that joined.");
                                payload.hostid = payload_reader.uint32LE("Host ID", "The client ID of the host of the game.");
                            }
                        } else {
                            payload.code = payload_reader.int32LE("Game code", "The code of the game to join.");
                            payload.mapOwnership = payload_reader.bitfield("Map ownership", "A bitfield of all maps owned by the client, 0x07 for all maps.", function (bitfield) {
                                const maps = [];
                                
                                if (bitfield & 0x01) {
                                    maps.push("The Skeld");
                                }

                                if (bitfield & 0x02) {
                                    maps.push("Mira HQ");
                                }

                                if (bitfield & 0x04) {
                                    maps.push("Polus");
                                }

                                return maps.join(", ");
                            });
                        }
                        break;
                    case 0x02:
                        payload.code = payload_reader.int32LE("Payload code", "The code for the game started.", Int2Code);
                        break;
                    case 0x03:
                        break;
                    case 0x04:
                        payload.code = payload_reader.int32LE("Game code", "The code for the game that the player was removed from.", Int2Code);
                        payload.clientid = payload_reader.uint32LE("Client ID", "The ID of the client that was removed.");
                        payload.hostid = payload_reader.uint32LE("Host ID", "The client ID of the existing or new host of the game.");
                        if (payload_reader.left) {
                            payload.reason = payload_reader.uint8("Remove reason", "The reason for why the player was removed.", e.disconnect_reasons);
                            
                            if (payload.reason === 0x08) {
                                payload.message = payload_reader.string("Remove reason", "The reason for why the player was removed.", e.disconnect_reasons);
                            }
                        }
                        break;
                    case 0x05:
                    case 0x06:
                        payload.code = payload_reader.int32LE("Game code", "The code of the game that the game data is for.", Int2Code);

                        if (payload.tag.value === 0x06) {
                            payload.recipientid = payload_reader.packed("Recipient ID", "The client ID of the recipient of the packet.");
                        }

                        payload.messages = {
                            name: "Messages",
                            description: "The messages in the game data.",
                            value: [],
                            endianness: null,
                            startpos: payload_reader.offset,
                            size: payload_reader.left,
                            slice: payload_reader.slice(payload_reader.offset).buffer,
                            warnings: []
                        }

                        while (payload_reader.left) {
                            const message = {};
                            const message_length = payload_reader.uint16LE("Length", "The length of the message.");
                            message.messageType = payload_reader.uint8("Message type", "The type of the game data message.", e.message_types);
                            const message_reader = payload_reader.slice(payload_reader.offset, message_length.value);

                            switch (message.messageType.value) {
                                case 0x01:
                                    message.netid = message_reader.packed("Net ID", "The component net ID to send the data to for deserialization.");
                                    const data_length = message_reader.left;
                                    message.data = message_reader.bytes(data_length, "Data", "The data for the component.");
                                    message.data.value = message.data.value.map(val => {
                                        return ToHex(val, null);
                                    }).join(" ");
                                    break;
                                case 0x02:
                                    message.handlerid = message_reader.packed("Handler ID", "The net ID of the component responsible for sending the game data.");
                                    message.rpcid = message_reader.uint8("RPC ID", "The remote procedure call ID.", e.rpc_ids);

                                    switch (message.rpcid.value) {
                                        case 0x00:
                                            message.anim_type = message_reader.uint8("Animation Type", "The type of animation to play.");
                                            break;
                                        case 0x01:
                                            message.taskid = message_reader.uint8("Task ID", "The ID of the task that was completed.");
                                            break;
                                        case 0x02:
                                            message.options = readGameOptions(message_reader);
                                            break;
                                        case 0x03:
                                            const num_infected = message_reader.packed("Number of imposters", "The number of imposters that are being set.");
                                            message.infected = {
                                                name: "Imposters",
                                                description: "The imposters that were set.",
                                                value: [],
                                                endianness: null,
                                                startpos: message_reader.offset,
                                                size: num_infected.value,
                                                slice: message_reader.slice(message_reader.offset, num_infected).buffer,
                                                warnings: []
                                            }

                                            for (let i = 0; i < num_infected.value; i++) {
                                                const playerid = message_reader.uint8("Player ID", "A player ID of a selected imposter.");
                    
                                                message.infected.value.push({ playerid });
                                            }
                                            break;
                                        case 0x04:
                                            break;
                                        case 0x05:
                                            message.name = message_reader.string("Name", "The name to check.");
                                            break;
                                        case 0x06:
                                            message.name = message_reader.string("Name", "The name to set.");
                                            break;
                                        case 0x07:
                                            message.colour = message_reader.uint8("Colour", "The colour to check.", e.colour_ids);
                                            break;
                                        case 0x08:
                                            message.colour = message_reader.uint8("Colour", "The colour to set.", e.colour_ids);
                                            break;
                                        case 0x09:
                                            message.hat = message_reader.uint8("Hat", "The hat to set.", e.hat_ids);
                                            break;
                                        case 0x0a:
                                            message.skin = message_reader.uint8("Skin", "The skin to set.", e.skin_ids);
                                            break;
                                        case 0x0b:
                                            message.targetid = message_reader.uint8("Target ID", "The player ID of the player reported.", val => val === 0xFF ? "Emergency meeting" : "");
                                            break;
                                        case 0x0c:
                                            message.netid = message_reader.uint8("Net ID", "The victim's player control net ID.");
                                            break;
                                        case 0x0d:
                                            message.text = message_reader.string("Text", "The chat text.");
                                            break;
                                        case 0x0e:
                                            message.targetid = message_reader.uint8("Target ID", "The player ID of the player reported.", val => val === 0xFF ? "Emergency meeting" : "");
                                            break;
                                        case 0x0f:
                                            message.scanning = message_reader.bool("Scanning", "Whether or not the scanner is active.");
                                            message.num_scanning = message_reader.uint8("Scanner count");
                                            break;
                                        case 0x10:
                                            message.player_id = message_reader.uint8("Player ID", "The player that sent the chat note.");
                                            message.chat_note_type = message_reader.uint8("Chat note type", "The type of chat note, currently there's only 0 for vote.", e.note_types);
                                            break;
                                        case 0x11:
                                            message.pet = message_reader.uint8("Pet", "The pet to set.", e.pet_ids);
                                            break;
                                        case 0x12:
                                            message.sequence = message_reader.packed("Sequence number", "The sequence number used for keeping the order of packets that can rely on which packets were sent first.");
                                            break;
                                        case 0x13:
                                            message.ventid = message_reader.packed("Vent ID", "The ID of the vent that was entered.");
                                            break;
                                        case 0x14:
                                            message.ventid = message_reader.packed("Vent ID", "The ID of the vent that was exited.");
                                            break;
                                        case 0x15:
                                            message.x = message_reader.int16LE("X position", "The X position to snap to, divided by 65535 and linearly lerped between -40 and 40.");
                                            message.x.value = LerpValue(message.x.value / 65535, -40, 40);
                                            message.y = message_reader.int16LE("Y position", "The Y position to snap to, divided by 65535 and linearly lerped between -40 and 40.");
                                            message.y.value = LerpValue(message.y.value / 65535, -40, 40);
                                            break;
                                        case 0x16:
                                            break;
                                        case 0x17:
                                            const num_states = message_reader.uint8("The number of vote states.");
                                            message.states = {
                                                name: "States",
                                                description: "The player vote states.",
                                                value: [],
                                                endianness: null,
                                                startpos: message_reader.offset,
                                                size: num_states.value,
                                                slice: message_reader.slice(message_reader.offset, num_states.value).buffer,
                                                warnings: []
                                            }

                                            for (let i = 0; i < message.num_states.value; i++) {
                                                message.states.value.push(readVoteState(message_reader, i));
                                            }

                                            message.exiled = message_reader.byte("Exiled", "The player ID of who was ejected. 0xFF for skip.", val => val === 0xFF ? "Skipped." : "");
                                            message.tie = message_reader.bool("Tie", "Whether or not a tie was reached.");
                                            break;
                                        case 0x18:
                                            message.player_id = message_reader.uint8("Player ID", "The player ID of who voted.");
                                            message.suspect_id = message_reader.uint8("Suspect ID", "The player ID of the voted player.");
                                            break;
                                        case 0x19:
                                            break;
                                        case 0x1a:
                                            message.player_id = message_reader.uint8("Player ID", "The player ID of who voted.");
                                            break;
                                        case 0x1b:
                                            message.system = message_reader.uint8("System type", null, e.system_types);
                                            break;
                                        case 0x1c:
                                            message.system = message_reader.uint8("System type", "The system type being repaired.", e.system_types);
                                            message.netid = message_reader.packed("Net ID", "The net ID of the player control of who repaired the system.");
                                            message.amount = message_reader.uint8("Amount", "The amount of damage to repair.");
                                            break;
                                        case 0x1d:
                                            message.player_id = message_reader.uint8("Player ID", "The player ID of who's tasks are getting set.");
                                            message.num_tasks = message_reader.uint8("Number of tasks", "The number of tasks being set.");
                                            message.tasks = message_reader.bytes(message.num_tasks.value, "Task IDs", "The IDs of the tasks being set.");
                                            message.tasks.value = message.tasks.value.join(", ");
                                            break;
                                        case 0x1e:
                                            message.players = {
                                                name: "Players",
                                                description: "The game data for each player being updated.",
                                                value: [],
                                                endianness: null,
                                                startpos: message_reader.offset,
                                                size: 1,
                                                slice: message_reader.slice(message_reader.offset, 1).buffer,
                                                warnings: []
                                            }

                                            while (message_reader.left) {
                                                message_reader.uint16LE();
                                                message.players.value.push(readPlayerData(message_reader));
                                            }
                                            break;
                                    }
                                    break;
                                case 0x04:
                                    message.spawnid = message_reader.packed("Spawn ID", "The ID of the object being spawned.", e.spawn_ids);
                                    message.parentid = message_reader.packed("Parent ID", "The parent ID of the object.", val => val === -2 ? "Global" : null);
                                    message.flags = message_reader.bitfield("Flags", "The spawn flags for the object.", function (val) {
                                        const flags = [];

                                        if (val & 0x01) {
                                            flags.push("Is player control.");
                                        }

                                        return flags.length ? flags.join(", ") : "None";
                                    });

                                    const num_components = message_reader.packed("Number of components", "The number of components in the object.");

                                    message.components = {
                                        name: "Components",
                                        description: "The components for the object being spawned.",
                                        value: [],
                                        endianness: null,
                                        startpos: message_reader.offset,
                                        size: message_reader.end - message_reader.offset,
                                        slice: message_reader.slice(message_reader.offset).buffer,
                                        warnings: []
                                    }

                                    for (let i = 0; i < num_components.value; i++) {
                                        const component = {};
                                        component.netid = message_reader.packed("Net ID", "The net ID of the component.", _ => e.components[message.spawnid.value][i]);
                                        component.data_length = message_reader.uint16LE("Data size", "The length of component data.");
                                        message_reader.uint8("Type", "This is ignored, it's safe to be a hardcoded 0.");

                                        switch (message.spawnid.value) {
                                            case 0x00:
                                                switch (i) {
                                                    case 0x00:
                                                        readShipStatusComponent(message_reader, component, true);
                                                        break;
                                                }
                                                break;
                                            case 0x01:
                                                switch (i) {
                                                    case 0x00:
                                                        readMeetingHudComponent(message_reader, component, true);
                                                        break;
                                                }
                                                break;
                                            case 0x02:
                                                switch (i) {
                                                    case 0x00:
                                                        readFollowerCameraComponent(message_reader, component, true);
                                                        break;
                                                }
                                                break;
                                            case 0x03:
                                                switch (i) {
                                                    case 0x00:
                                                        readGameDataComponent(message_reader, component, true);
                                                        break;
                                                    case 0x01:
                                                        readVoteBanSystemComponent(message_reader, component, true);
                                                        break;
                                                }
                                                break;
                                            case 0x04:
                                                switch (i) {
                                                    case 0x00:
                                                        readPlayerControlComponent(message_reader, component, true);
                                                        break;
                                                    case 0x01:
                                                        readPlayerPhysicsComponent(message_reader, component, true);
                                                        break;
                                                    case 0x02:
                                                        readCustomNetworkTransform(message_reader, component, true);
                                                        break;
                                                }
                                                break;
                                            case 0x05:
                                                switch (i) {
                                                    case 0x00:
                                                        readShipStatusComponent(message_reader, component, true);
                                                        break;
                                                }
                                                break;
                                            case 0x06:
                                                switch (i) {
                                                    case 0x00:
                                                        readShipStatusComponent(message_reader, component, true);
                                                        break;
                                                }
                                                break;
                                            case 0x07:
                                                switch (i) {
                                                    case 0x00:
                                                        readShipStatusComponent(message_reader, component, true);
                                                        break;
                                                }
                                                break;
                                            default:
                                                component.data = message_reader.bytes(component.data_length.value, "Data", "The data for the component.");
                                                component.data.value = component.data.value.map(val => {
                                                    return ToHex(val, null);
                                                }).join(" ");
                                                break;
                                        }

                                        message.components.value.push(component);
                                    }
                                    break;
                                case 0x05:
                                    message.netid = message_reader.packed("Net ID", "The net ID of the component to despawn.");
                                    break;
                                case 0x06:
                                    message.clientid = message_reader.packed("Client ID", "The client ID of the player requesting a scene change.");
                                    message.location = message_reader.string("Location", "The location of the scene change.");
                                    break;
                                case 0x07:
                                    message.clientid = message_reader.packed("Client ID", "The client ID of the ready'd player.");
                                    break;
                                case 0x08:
                                    break;
                            }

                            payload_reader.goto(message_reader.end - payload_reader.base);
                            payload.messages.value.push(message);
                        }
                        break;
                    case 0x07:
                        payload.code = payload_reader.int32LE("Game code", "The code of the game that the player joined.", Int2Code);
                        payload.clientid = payload_reader.uint32LE("Client ID", "The client ID of the player that joined.");
                        payload.hostid = payload_reader.uint32LE("Host ID", "The client ID of the host of the game.");

                        const num_clients = payload_reader.packed("Number of clients", "The number of clients in the game, excluding the client ID that joined.");
                        
                        payload.clients = {
                            name: "Clients",
                            description: "The clients connected to the game, excluding the client ID that joined.",
                            value: [],
                            endianness: null,
                            startpos: payload_reader.offset,
                            size: payload_reader.left,
                            slice: payload_reader.slice(payload_reader.offset).buffer,
                            warnings: []
                        }

                        for (let i = 0; i < num_clients.value; i++) {
                            const clientid = payload_reader.packed("Client ID", "An ID of a client connected to the game.");

                            payload.clients.value.push({ clientid });
                        }
                        break;
                    case 0x08:
                        payload.code = payload_reader.int32LE("Game code", "The code for the game that ended.", Int2Code);
                        payload.end_reason = payload_reader.packed("End reason", "The reason for why the game ended.", e.endgame_reasons);
                        payload.show_ad = payload_reader.bool("Show ad?", "Whether or not an ad should be shown (for mobile).");
                        break;
                    case 0x0a:
                        payload.code = payload_reader.int32LE("Game code", "The code for the game being altered.", Int2Code);
                        payload.tag = payload_reader.uint8("Alter game tag", "The tag for the alter game, i.e what is being changed.", e.alter_tags);
                        switch (e.alter_tags) {
                            case 0x01:
                                payload.is_public = payload_reader.bool("Is public?", "Whether or not the game is being made public or not.");
                                break;
                        }
                        break;
                    case 0x0b:
                        if (bound === "server") {
                            payload.clientid = payload_reader.packed("Client ID", "The player ID to kick.");
                            payload.is_ban = payload_reader.bool("Is Ban?", "Whether or not the player is banned.");
                        } else {
                            payload.code = payload_reader.int32LE("Game code", "The code for the game where the player is being kicked.", Int2Code);
                            payload.clientid = payload_reader.packed("Client ID", "The player ID to kick.");
                            payload.is_ban = payload_reader.bool("Is Ban?", "Whether or not the player is banned.");
                        }
                        break;
                    case 0x0d:
                        payload.ipaddr = payload_reader.bytes(4, "IP address", "The IP address of the new game datacenter to connect to.");
                        payload.ipaddr.value = payload.ipaddr.value.join(".");
                        payload.port = payload_reader.uint16LE("Port", "The port of the new game datacenter to connect to.");
                        break;
                    case 0x0e:
                        payload_reader.jump(0x01);
                        const num_servers = payload_reader.uint8();

                        payload.servers = {
                            name: "Servers",
                            description: "A list of game datacenters for the connected region.",
                            value: [],
                            endianness: null,
                            startpos: payload_reader.offset,
                            size: payload_reader.buffer.byteLength - 2,
                            slice: payload_reader.buffer,
                            warnings: []
                        }

                        for (let i = 0; i < num_servers.value; i++) {
                            const server = {};

                            server.length = payload_reader.uint16LE("Server length", "The length of the master server.");
                            payload_reader.jump(0x01);

                            const server_reader = payload_reader.slice(payload_reader.offset, server.length.value);

                            server.name = server_reader.string("Server name", "The name of the master server.");
                            server.ipaddr = server_reader.bytes(4, "IP address", "The IP address of the master server.");
                            server.ipaddr.value = server.ipaddr.value.join(".");
                            server.port = server_reader.uint16LE("Port", "The port of the master server.");
                            server.num_players = server_reader.packed("Player count", "The number of clients currently connected to the master server.");

                            payload.servers.value.push(server);
                            payload_reader.goto(server_reader.end - payload_reader.base);
                        }
                        break;
                    case 0x10:
                        if (packet.bound === "server") {
                            payload_reader.packed("Hardcoded 0", "A hardcoded 0 previously used to determine whether private games would appear in the game listing.");
                            payload.options = readGameOptions(payload_reader, true);
                        } else if (packet.bound === "client") {
                            const message_length = payload_reader.uint16LE("Message length", "The length of the game list payload.");
                            const message_tag = payload_reader.uint8("Message tag", "The tag for the game list payload.", ["game list", "game count"]);
                            const message_reader = payload_reader.slice(payload_reader.offset, message_length.value);

                            switch (message_tag.value) {
                                case 0x00:
                                    payload.games = {
                                        name: "Games",
                                        description: "The games in the game list.",
                                        value: [],
                                        endianness: null,
                                        startpos: message_reader.offset,
                                        size: message_reader.buffer.byteLength - 2,
                                        slice: message_reader.slice(message_reader.offset, message_length.value).buffer,
                                        warnings: []
                                    }

                                    while (message_reader.left) {
                                        const game = {};

                                        game.length = message_reader.uint16LE("Game length", "The length of the game listing.");
                                        message_reader.jump(0x01);

                                        const game_reader = message_reader.slice(message_reader.offset, game.length.value);

                                        game.ipaddr = game_reader.bytes(4, "IP address", "The IP address of the game datacenter.");
                                        game.ipaddr.value = game.ipaddr.value.join(".");
                                        game.port = game_reader.uint16LE("Port", "The port of the game datacenter.");
                                        game.code = game_reader.int32LE("Game code", "The 6 digit game code for the game.", Int2Code);
                                        game.name = game_reader.string("Name", "The name of the game, i.e. The host's name.");
                                        game.num_players = game_reader.packed("Number of players", "The number of players in the game currently.");
                                        game.age = game_reader.packed("Age", "The age of the game in seconds since its creation.");
                                        game.mapID = game_reader.uint8("Map ID", "The map ID for the game.", e.map_ids);
                                        game.num_imposters = game_reader.uint8("Number of imposters", "The number of imposters in the game.");
                                        game.max_players = game_reader.uint8("Max players", "The maximum number of players allowed to join the game.");

                                        payload.games.value.push(game);
                                        message_reader.goto(game_reader.end - message_reader.base);
                                    }
                                    break;
                                case 0x01:
                                    payload.count = {
                                        name: "Count",
                                        description: "The total number of games for each map.",
                                        value: {},
                                        endianness: null,
                                        startpos: message_reader.offset,
                                        size: message_reader.buffer.byteLength - 2,
                                        slice: message_reader.slice(message_reader.offset, message_length.value).buffer,
                                        warnings: []
                                    }

                                    payload.count.value.the_skeld = message_reader.uint32LE("The Skeld", "The total number of games on The Skeld.");
                                    payload.count.value.mira_hq = message_reader.uint32LE("Mira HQ", "The total number of games on Mira HQ.");
                                    payload.count.value.polus = message_reader.uint32LE("Polus", "The total number of games on Polus.");
                                    break;
                            }
                        }
                        break;
                }

                packet_reader.jump(payload_reader.end);

                packet.payloads.value.push(payload);
            }
            break;
        case 0x08:
            packet.nonce = packet_reader.uint16BE("Nonce", "The acknowledgement identifier for the packet.");
            packet.hazel_ver = packet_reader.byte("Hazel Version", "The version of the Hazel, should be 0x00");
            packet.client_ver = packet_reader.uint32LE("Client Version", "The version of the client.", FormatVersion);
            packet.name = packet_reader.string("Name", "The username identifier of the client.");
            break;
        case 0x09:
            packet_reader.jump(0x04);

            if (packet_reader.left) {
                packet.reason = packet_reader.uint8("Reason", "The reason for disconnecting, usually empty for serverbound packets.", e.disconnect_reasons);

                if (packet.reason.value === 0x08) {
                    packet.message = packet_reader.string("Message", "The message attached to the disconnect reason.");
                }
            }
            break;
        case 0x0a:
            packet.nonce = packet_reader.uint16BE("Nonce", "The acknowledgement identifier to acknowledge.");
            packet.received = packet_reader.bitfield("Received", "A bitfield of the last 8 packets and whether or not they were acknowledged, telling the receiver that you are still waiting for these packets.");
            break;
        case 0x0c:
            packet.nonce = packet_reader.uint16BE("Nonce", "The acknowledgement identifier for the packet.");
            break;
    }

    return packet;
}
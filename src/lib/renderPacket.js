import opcodes from "./constants/opcodes.js"
import tags from "./constants/tags.js"
import disconnect_reasons from "./constants/reasons.js"
import messages from "./constants/messages.js"
import distances from "./constants/distances.js"
import taskbarupdates from "./constants/taskbarupdates.js"
import alter_tags from "./constants/alter_tags.js"
import maps from "./constants/maps.js"
import endgame_reasons from "./constants/endgame_reasons.js"
import messagetypes from "./constants/messagetypes.js"
import spawnids from "./constants/spawnids.js"
import components from "./constants/components.js"
import rpcids from "./constants/rpcids.js"
import colours from "./constants/colours.js"
import hats from "./constants/hats.js"
import pets from "./constants/pets.js"
import skins from "./constants/skins.js"
import notetypes from "./constants/notetypes.js"
import systemtypes from "./constants/systemtypes.js"
import gamelist_tags from "./constants/gamelist_tags.js"
import languages from "./constants/languages.js"

import { Int2Code } from "./util/GameCodes.js"
import { DecodeVersion } from "./util/Versions.js"

let indent = 0;

function style(txt, style, newl = true) {
    return (newl ? "<br>" : "") + "<span style=\"margin-left: " +
        (20 * (newl ? indent : 0.5)) + "px\" class=\"" + style + "\">" + txt + "</span>";
}

function error(txt) {
    return style(txt, "error");
}

function warning(txt) {
    return style(txt, "warning");
}

function important(txt) {
    return style(txt, "important");
}

function detail(txt) {
    return style(txt, "detail");
}

function comment(txt) {
    return style("// " + txt, "comment", false);
}

function string(txt) {
    return style("\"" + txt + "\"", "string", false);
}

function nl() {
    return "<br>";
}

function tab() {
    indent++;
}

function untab() {
    indent--;
}

function fmtnum(val) {
    return (val + "").replace(/\b(\d+)((\.\d+)*)\b/g, function (a, b, c) {
        return (b.charAt(0) > 0 && !(c || ".").lastIndexOf(".") ? b.replace(/(\d)(?=(\d{3})+$)/g, "$1,") : b) + c;
    });
}

function hex(val, length, be) {
    const hexstr = val.toString(16);
    length = length || (hexstr.length % 2 ? hexstr.length + 1 : hexstr.length);
    const padded = "0".repeat(length - hexstr.length) + hexstr;

    if (be) {
        const spaces = padded.match(/[^\s]{1,2}/g).join(" ");

        return spaces;
    } else {
        const spaces = padded.match(/[^\s]{1,2}/g).reverse().join(" ");

        return spaces;
    }
}

function bin(val, length) {
    const binstr = val.toString(2);

    length = length || (binstr.length % 8 ? binstr.length + (8 - (binstr.length % 8)) : binstr);

    const padded = "0".repeat(length - binstr.length) + binstr;

    return padded;
}

function renderGameOptions(options) {
    let rendered = "";

    rendered += detail("Length: " + options.length);
    rendered += detail("Version: v" + options.version);
    rendered += detail("Max players: " + options.maxPlayers);
    rendered += detail("Language: " + options.language + " (" + (languages[options.language] || "Unknown.") + ")");
    rendered += detail("Map ID: " + options.mapID);
    rendered += detail("Player speed: " + options.playerSpeed);
    rendered += detail("Crewmate vision: " + options.crewVision);
    rendered += detail("Imposter vision: " + options.imposterVision);
    rendered += detail("Kill cooldown: " + options.killCooldown);
    rendered += detail("Common tasks: " + options.commonTasks);
    rendered += detail("Long tasks: " + options.longTasks);
    rendered += detail("Short tasks: " + options.shortTasks);
    rendered += detail("Emergencies: " + options.emergencies);
    rendered += detail("Imposter count: " + options.imposterCount);
    rendered += detail("Kill distance: " + distances[options.killDistance]|| "Unknown");
    rendered += detail("Discussion time: " + options.discussionTime);
    rendered += detail("Voting time: " + options.votingTime);
    rendered += detail("Is default?: " + options.isDefault);
    
    if (options.version >= 1) {
        rendered += detail("Emergency cooldown: " + options.emergencyCooldown);
    }

    if (options.version >= 2) {
        rendered += detail("Confirm ejects: " + options.confirmEjects);
        rendered += detail("Visual tasks: " + options.visualTasks);
    }

    /*if (options.versions >= 3) {
        rendered += detail("Anonymous voting: " + options.anonymousVoting);
        rendered += detail("Task bar updates: " + taskbarupdates[options.taskBarUpdates] || "Unknown");
    }*/

    return rendered;
}

export default function renderPacket(packet) {
    indent = 0;

    let rendered = "";

    if (packet.warnings.length) {
        rendered += warning(packet.warnings.length + " warning" + (packet.warnings.length === 1 ? "" : "s") + ":");
        tab();
        for (let i = 0; i < packet.warnings.length; i++) {
            rendered += warning(packet.warnings[i]);
        }
        untab();
        rendered += nl();
    }

    rendered += important(hex(packet.opcode) + " - " + (opcodes[packet.opcode] || "Unknown"));
    
    if (packet.reliable) {
        rendered += detail("Nonce: " + packet.nonce);
        rendered += comment("Must be sent back to " + (packet.bound === "server" ? "client" : "server") + ".");
    }

    switch (packet.opcode) {
        case 0x00: // Unreliable
        case 0x01: // Reliable
            rendered += detail("Payloads: (" + packet.payloads.length + ")");

            tab();

            for (let i = 0; i < packet.payloads.length; i++) {
                const payload = packet.payloads[i];
                
                rendered += detail((i + 1) + ".");
                tab();
                rendered += detail("Length: " + payload.length);
                rendered += important(hex(payload.tag) + " - " + (tags[payload.tag] || "Unknown."));
                
                switch (payload.tag) {
                    case 0x00:
                        if (packet.bound === "client") {
                            rendered += detail("Code: " + Int2Code(payload.code));
                        } else {
                            rendered += renderGameOptions(payload.options);
                        }
                        break;
                    case 0x01: // Join game
                        if (packet.bound === "client") {
                            if (payload.error) {
                                rendered += detail("(An error occurred while joining.)");
                                rendered += detail("Reason: " + disconnect_reasons[payload.reason]);
                                rendered += detail("Message:" + string(messages[payload.reason] || payload.message || "None."));
                            } else {
                                rendered += detail("Code: " + Int2Code(payload.code));
                                rendered += detail("Client ID: " + payload.clientid);
                                rendered += detail("Host ID: " + payload.hostid);
                            }
                        } else if (packet.bound === "server") {
                            rendered += detail("Code: " + Int2Code(payload.code));
                            rendered += detail("Map Ownership: " + bin(payload.mapOwnership));
                            tab();
                            if (payload.mapOwnership & 0b1) {
                                rendered += detail("The Skeld");
                            }
                            if (payload.mapOwnership & 0b10) {
                                rendered += detail("Mira HQ");
                            }
                            if (payload.mapOwnership & 0b100) {
                                rendered += detail("Polus");
                            }
                            untab();
                        }
                        break;
                    case 0x02:
                        rendered += detail("Code: " + Int2Code(payload.code));
                        break;
                    case 0x03:
                        break;
                    case 0x04:
                        rendered += detail("Code: " + Int2Code(payload.code));
                        rendered += detail("Client ID: " + payload.clientid);
                        rendered += detail("Host ID: " + payload.hostid);
                        rendered += detail("Reason: " + (typeof payload.reason !== "undefined" ? payload.reason : "None.") + (typeof payload.reason !== "undefined" ? " (" + (disconnect_reasons[payload.reason] || "Unknown.") : ""));
                        rendered += detail("Message: " + (typeof payload.reason !== "undefined" ? (payload.reason === 0x08 ? payload.message : messages[payload.reason]) : "None."));
                        break;
                    case 0x05:
                    case 0x06:
                        if (packet.bound === "client" || payload.code) {
                            rendered += detail("Code: " + Int2Code(payload.code));
                        }

                        if (payload.tag === 0x06) {
                            rendered += detail("Recipient: " + payload.recipient);
                        }

                        rendered += detail("Messages: (" + payload.parts.length + ")");

                        for (let i = 0; i < payload.parts.length; i++) {
                            const part = payload.parts[i];
                            tab();
                            rendered += detail((i + 1) + ".");
                            tab();

                            rendered += detail("Length: " + part.length);
                            rendered += important("Message type: " + part.type + " (" + (messagetypes[part.type] || "Unknown.") + ")");
                            
                            switch (part.type) {
                                case 0x01:
                                    rendered += detail("Net ID: " + part.netid);
                                    rendered += detail("Data length: " + part.datalen);
                                    const cut = [...part.data].slice(0, 10);
                                    rendered += detail("Data: " + cut.map(_ => hex(_)).join(" ") + (part.data.byteLength > 10 ? "..." : ""));
                                    break;
                                case 0x02:
                                    rendered += detail("Handler net ID: " + part.handlerid);
                                    rendered += important("RPC ID: " + part.rpcid + " (" + (rpcids[part.rpcid] || "Unknown.") + ")");
                                    tab();
                                    switch (part.rpcid) {
                                        case 0x00:
                                            rendered += detail("Animation ID: " + part.animation);
                                            break;
                                        case 0x01:
                                            rendered += detail("Task ID: " + part.taskid);
                                            break;
                                        case 0x02:
                                            rendered += renderGameOptions(part.options);
                                            break;
                                        case 0x03:
                                            rendered += detail("Imposter count: " + part.count);
                                            rendered += detail("Imposter IDs: " + part.infected.join(", "));
                                            break;
                                        case 0x04:
                                            break;
                                        case 0x05:
                                            rendered += detail("Name: " + string(part.name));
                                            break;
                                        case 0x06:
                                            rendered += detail("Name: " + string(part.name));
                                            break;
                                        case 0x07:
                                            rendered += detail("Colour: " + part.colour + " (" + (colours[part.colour] || "Unknown.") + ")");
                                            break;
                                        case 0x08:
                                            rendered += detail("Colour: " + part.colour + " (" + (colours[part.colour] || "Unknown.") + ")");
                                            break;
                                        case 0x09:
                                            rendered += detail("Hat ID: " + part.hat + " (" + (hats[part.hat] || "Unknown.") + ")");
                                            break;
                                        case 0x0a:
                                            rendered += detail("Skin ID: " + part.skin + " (" + (skins[part.skin] || "Unknown.") + ")");
                                            break;
                                        case 0x0b:
                                            rendered += detail("Target player ID: " + part.targetid);
                                            break;
                                        case 0x0c:
                                            rendered += detail("Target net ID: " + part.targetnetid);
                                            break;
                                        case 0x0d:
                                            rendered += detail("Text: " + string(part.text));
                                            break;
                                        case 0x0e:
                                            rendered += detail("Target ID: " + part.targetid);
                                            break;
                                        case 0x0f:
                                            rendered += detail("Scanning?: " + part.scanning);
                                            rendered += detail("Count: " + part.count);
                                            break;
                                        case 0x10:
                                            rendered += detail("Player ID: " + part.playerid);
                                            rendered += detail("Note type: " + part.notetype + " (" + (notetypes[part.notetype] || "Unknown.") + ")");
                                            break;
                                        case 0x11:
                                            rendered += detail("Pet ID: " + part.pet + " (" + (pets[part.pet] || "Unknown.") + ")");
                                            break;
                                        case 0x12:
                                            rendered += detail("Sequence: " + part.sequence);
                                            rendered += detail("Time: " + part.time + (part.time === -1 ? " (Not started.)" : ""));
                                            break;
                                        case 0x13:
                                            rendered += detail("Sequence: " + part.sequence);
                                            rendered += detail("Vent ID: " + part.ventid);
                                            break;
                                        case 0x14:
                                            rendered += detail("Vent ID: " + part.ventid);
                                            break;
                                        case 0x15:
                                            rendered += detail("X: " + part.x);
                                            rendered += detail("Y: " + part.y);
                                            break;
                                        case 0x16:
                                            break;
                                        case 0x17:
                                            rendered += detail("States: (" + part.num_states + ")");
                                            for (let i = 0; i < part.num_states.length; i++) {
                                                const state = part.num_states[i];

                                                tab();
                                                rendered += detail((i + 1) + ". " + state);
                                                untab();
                                            }
                                            rendered += detail("Exiled ID: " + (part.exiled || "N/A"));
                                            rendered += detail("Tie? " + part.tie);
                                            break;
                                        case 0x18:
                                            rendered += detail("Voter ID: " + part.voterid);
                                            rendered += detail("Suspect ID: " + part.suspectid);
                                            break;
                                        case 0x19:
                                            break;
                                        case 0x1a:
                                            rendered += detail("Player ID: " + part.playerid);
                                            break;
                                        case 0x1b:
                                            rendered += detail("System type: " + part.systemtype + " (" + (systemtypes[part.systemtype] || "Unknown.") + ")");
                                            break;
                                        case 0x1c:
                                            rendered += detail("System type: " + part.systemtype + " (" + (systemtypes[part.systemtype] || "Unknown.") + ")");
                                            rendered += detail("Handler net ID: " + part.handlerid);
                                            rendered += detail("Amount: " + part.amount);
                                            break;
                                        case 0x1d:
                                            rendered += detail("Player ID: " + part.playerid);
                                            rendered += detail("Tasks: (" + part.num_tasks + ")");
                                            for (let i = 0; i < part.num_tasks; i++) {
                                                const task = part.tasks[i];

                                                tab();
                                                rendered += detail((i + 1) + ". " + task);
                                                untab();
                                            }
                                        case 0x1e:
                                            rendered += detail("Players: (" + part.players.length + ")");
                                            for (let i = 0; i < part.players.length; i++) {
                                                const player = part.players[i];

                                                tab();
                                                rendered += detail((i + 1) + ". ");
                                                tab();
                                                rendered += detail("Length: " + player.length);
                                                rendered += detail("Player ID: " + player.playerid);
                                                rendered += detail("Name: " + string(player.name));
                                                rendered += detail("Colour: " + player.colour + " (" + (colours[player.colour] || "Unknown.") + ")");
                                                rendered += detail("Hat: " + player.hat + " (" + (hats[player.hat] || "Unknown.") + ")");
                                                rendered += detail("Pet: " + player.pet + " (" + (pets[player.pet] || "Unknown.") + ")");
                                                rendered += detail("Skin: " + player.skin + " (" + (skins[player.skin] || "Unknown.") + ")");
                                                rendered += detail("Disconnected?: " + ((player.flags & 0) !== 0));
                                                rendered += detail("Imposter?: " + ((player.flags & 1) !== 0));
                                                rendered += detail("Dead?: " + ((player.flags & 2) !== 0));
                                                rendered += detail("Tasks: (" + player.num_tasks + ")");
                                                
                                                for (let i = 0; i < part.num_tasks; i++) {
                                                    const task = part.tasks[i];

                                                    tab();
                                                    rendered += detail((i + 1) + ". ");
                                                    tab();
                                                    rendered += detail("Completed?: " + task.completed);
                                                    untab();
                                                    untab();
                                                }
                                                untab();
                                                untab();
                                            }
                                            break;
                                    }
                                    untab();
                                    break;
                                case 0x04:
                                    rendered += detail("Spawn ID: " + part.spawnid + " (" + (spawnids[part.spawnid] || "Unknown.") + ")");
                                    rendered += detail("Owner ID: " + part.ownerid + (part.ownerid === -2 ? " (Global)" : ""));
                                    rendered += detail("Spawn flags: " + part.flags);
                                    rendered += detail("Components: (" + part.components.length + ")");
                                    for (let i = 0; i < part.components.length; i++) {
                                        const component = part.components[i];
                                        tab();
                                        rendered += detail((i + 1) + ". (" + (components[part.spawnid] ? (components[part.spawnid][i] || "Unknown.") : "Unknown.") + ")");
                                        tab();

                                        rendered += detail("Net ID: " + component.netid);
                                        rendered += detail("Data length: " + component.datalen);
                                        const cut = [...component.data].slice(0, 10);

                                        rendered += detail("Component data: " + cut.map(_ => hex(_)).join(" ") + (component.data.byteLength > 10 ? "..." : ""));
                                        untab();
                                        untab();
                                    }
                                    break;
                                case 0x05:
                                    rendered += detail("Net ID: " + part.netid);
                                    break;
                                case 0x06:
                                    rendered += detail("Client ID: " + part.clientid);
                                    rendered += detail("Location: " + part.location);
                                    break;
                                case 0x07:
                                    rendered += detail("Client ID: " + part.clientid);
                                    break;
                                case 0x08:
                                    break;
                            }

                            untab();
                            untab();
                        }
                        break;
                    case 0x07:
                        rendered += detail("Code: " + Int2Code(payload.code));
                        rendered += detail("Client ID: " + payload.clientid);
                        rendered += detail("Host ID: " + payload.hostid);
                        rendered += detail("Other clients: (" + payload.num_clients + ")");
                        tab();
                        for (let i = 0; i < payload.clients.length; i++) {
                            const clientid = payload.clients[i];
                            
                            rendered += detail((i + 1) + ":");
                            tab();
                            rendered += detail("Client ID: " + clientid);
                            untab();
                        }
                        untab();
                        break;
                    case 0x08:
                        rendered += detail("Code: " + Int2Code(payload.code));
                        rendered += detail("Reason: " + payload.reason + " (" + (endgame_reasons[payload.reason] || "Unknown.") + ")");
                        rendered += detail("Show Ad?: " + payload.show_ad);
                        break;
                    case 0x0a:
                        rendered += detail("Code: " + Int2Code(payload.code));
                        rendered += detail("Alter game tag: " + payload.alter_tag + " (" + alter_tags[payload.alter_tag] + ")");
                        rendered += detail("Is public?: " + payload.is_public);
                        break;
                    case 0x0b:
                        if (packet.bound === "client") {
                            rendered += detail("Code: " + Int2Code(payload.code));
                            rendered += detail("Client ID: " + payload.clientid);
                            rendered += detail("Banned?: " + payload.banned);
                        } else {
                            rendered += detail("Client ID: " + payload.clientid);
                            rendered += detail("Banned?: " + payload.banned);
                        }
                        break;
                    case 0x0d:
                        rendered += detail("IP: " + payload.ip);
                        rendered += detail("Port: " + payload.port);
                        break;
                    case 0x0e:
                        rendered += detail("Servers: (" + payload.num_servers + ")");
                        tab();
                        for (let i = 0; i < payload.servers.length; i++) {
                            const server = payload.servers[i];
                            
                            rendered += detail((i + 1) + ":");
                            tab();
                            rendered += detail("Length: " + server.length);
                            rendered += detail("Name:" + string(server.name));
                            rendered += detail("IP: " + server.ip);
                            rendered += detail("port: " + server.port);
                            rendered += detail("players: " + server.num_players);
                            untab();
                        }
                        untab();
                        break;
                    case 0x10:
                        if (packet.bound === "client") {
                            rendered += detail("Length: " + payload.length);
                            rendered += important("Tag: " + payload.tag + " (" + (gamelist_tags[payload.tag] || "Unknown.") + ")");
                            
                            switch (payload.list_tag) {
                                case 0x00:
                                    rendered += detail("Games: (" + payload.games.length + ")");
                                    tab();
                                    for (let i = 0; i < payload.games.length; i++) {
                                        const game = payload.games[i];

                                        rendered += detail((i + 1) + ":");
                                        tab();
                                        rendered += detail("Length: " + game.length);
                                        rendered += detail("IP: " + game.ip);
                                        rendered += detail("Port: " + game.port);
                                        rendered += detail("Code: " + Int2Code(game.code));
                                        rendered += detail("Name: " + string(game.name));
                                        rendered += detail("Players: " + game.num_players);
                                        rendered += detail("Game age: " + game.age + "s");
                                        rendered += detail("Map: " + game.map + " (" + maps[game.map] + ")");
                                        rendered += detail("Imposters: " + game.imposters);
                                        rendered += detail("Max players: " + game.max_players);
                                        untab();
                                    }
                                    untab();
                                    break;
                                case 0x01:
                                    rendered += detail("The Skeld games: ", payload.count[0]);
                                    rendered += detail("Mira HQ games: ", payload.count[1]);
                                    rendered += detail("Polus games: ", payload.count[2]);
                                    break;
                            }
                        } else {
                            rendered += renderGameOptions(payload.options);
                        }
                        break;
                }

                untab();
            }

            untab();
            break;
        case 0x08:
            rendered += detail("Hazel version: " + packet.hazelver);
            const cver = DecodeVersion(packet.clientver);
            rendered += detail("Client version: " + cver.year + "." + cver.month + "." + cver.day + "." + cver.build);
            rendered += detail("Username:" + string(packet.username));
            break;
        case 0x09:
            if (packet.reason) {
                rendered += detail("Reason: " + packet.reason + " (" + (disconnect_reasons[packet.reason] || "Unknown.") + ")");
                rendered += detail("Message: " + string(packet.message || messages[packet.reason] || "Unknown."));
            }
            break;
        case 0x0a:
            rendered += detail("Nonce: " + packet.nonce);
            break;
        case 0x0c:
            break;
    }

    return rendered;
}
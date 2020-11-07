export const alter_tags = {
    0x01: "Change privacy"
}

export const colour_ids = {
    0x00: "Red",
    0x01: "Blue",
    0x02: "Dark green",
    0x03: "Pink",
    0x04: "Orange",
    0x05: "Yellow",
    0x06: "Black",
    0x07: "White",
    0x08: "Purple",
    0x09: "Brown",
    0x0a: "Cyan",
    0x0b: "Lime"
}

export const color_ids = colour_ids;

export const components = {
    0x00: ["Ship status"],
    0x01: ["Meeting hud"],
    0x02: ["Follower camera"],
    0x03: ["Game data", "Vote ban system"],
    0x04: ["Player control", "Player physics", "Custom network transform"],
    0x05: ["Ship status"],
    0x06: ["Ship status"],
    0x07: ["Ship status"]
}

export const distances = {
    0x00: "Short",
    0x01: "Medium",
    0x02: "Long"
}

export const endgame_reasons = {
    0x01: "Voted out imposter.",
    0x02: "Completed all tasks.",
    0x02: "Voted out humans.",
    0x03: "Killed all humans.",
    0x04: "Sabotage out of time.",
    0x05: "Imposter left.",
    0x06: "Human left."
}

export const gamelist_tags = {
    0x00: "List",
    0x01: "Count"
}

export const hat_ids = {
    0x00: "None",
    0x01: "Astronaut",
    0x02: "BaseballCap",
    0x03: "BrainSlug",
    0x04: "BushHat",
    0x05: "CaptainsHat",
    0x06: "DoubleTopHat",
    0x07: "Flowerpot",
    0x08: "Goggles",
    0x09: "HardHat",
    0x0a: "Military",
    0x0b: "PaperHat",
    0x0c: "PartyHat",
    0x0d: "Police",
    0x0e: "Stethescope",
    0x0f: "TopHat",
    0x10: "TowelWizard",
    0x11: "Ushanka",
    0x12: "Viking",
    0x13: "WallCap",
    0x14: "Snowman",
    0x15: "Reindeer",
    0x16: "Lights",
    0x17: "Santa",
    0x18: "Tree",
    0x19: "Present",
    0x1a: "Candycanes",
    0x1b: "ElfHat",
    0x1c: "NewYears2018",
    0x1d: "WhiteHat",
    0x1e: "Crown",
    0x1f: "Eyebrows",
    0x20: "HaloHat",
    0x21: "HeroCap",
    0x22: "PipCap",
    0x23: "PlungerHat",
    0x24: "ScubaHat",
    0x25: "StickminHat",
    0x26: "StrawHat",
    0x27: "TenGallonHat",
    0x28: "ThirdEyeHat",
    0x29: "ToiletPaperHat",
    0x2a: "Toppat",
    0x2b: "Fedora",
    0x2c: "Goggles_2",
    0x2d: "Headphones",
    0x2e: "MaskHat",
    0x2f: "PaperMask",
    0x30: "Security",
    0x31: "StrapHat",
    0x32: "Banana",
    0x33: "Beanie",
    0x34: "Bear",
    0x35: "Cheese",
    0x36: "Cherry",
    0x37: "Egg",
    0x38: "Fedora_2",
    0x39: "Flamingo",
    0x3a: "FlowerPin",
    0x3b: "Helmet",
    0x3c: "Plant",
    0x3d: "BatEyes",
    0x3e: "BatWings",
    0x3f: "Horns",
    0x40: "Mohawk",
    0x41: "Pumpkin",
    0x42: "ScaryBag",
    0x43: "Witch",
    0x44: "Wolf",
    0x45: "Pirate",
    0x46: "Plague",
    0x47: "Machete",
    0x48: "Fred",
    0x49: "MinerCap",
    0x4a: "WinterHat",
    0x4b: "Archae",
    0x4c: "Antenna",
    0x4d: "Balloon",
    0x4e: "BirdNest",
    0x4f: "BlackBelt",
    0x50: "Caution",
    0x51: "Chef",
    0x52: "CopHat",
    0x53: "DoRag",
    0x54: "DumSticker",
    0x55: "Fez",
    0x56: "GeneralHat",
    0x57: "GreyThing",
    0x58: "HunterCap",
    0x59: "JungleHat",
    0x5a: "MiniCrewmate",
    0x5b: "NinjaMask",
    0x5c: "RamHorns",
    0x5d: "Snowman_2"
}

export const language_ids = {
    0x00: "Any",
    0x01: "Other",
    0x02: "Spanish",
    0x04: "Korean",
    0x08: "Russian",
    0x10: "Portguese",
    0x20: "Arabic",
    0x40: "Filipino",
    0x80: "Polish",
    0x100: "English"
}

export const map_ids = {
    0x00: "The Skeld",
    0x01: "Mira HQ",
    0x02: "Polus"
}

export const disconnect_messages = {
    0x00: "Forcibly disconnected from server. The remote sent a disconnect request.",
    0x01: "The game you tried to join is full. Check with the host to see if you can join next round.",
    0x02: "The game you tried to join already started. Check with the host to see if you can join next round.",
    0x03: "Could not find the game you're looking for.",
    0x05: "You are running an older version of the game. Please update to play with others.",
    0x06: "You were banned from the room. You cannot rejoin that room.",
    0x07: "You were kicked from the room. You can rejoin if the room hasn't started.",
    0x09: "Server refused username",
    0x0a: "You were banned for hacking. Please stop.",
    0x0c: "You disconnected from the host. If this happens often, check your WiFi strength.",
    0x0d: "Could not find the game you're looking for.",
    0x0e: "The server stopped this game. Possibly due to inactivity.",
    0x0f: "The Among Us servers are overloaded. Sorry! Please try again later!"
}

export const message_types = {
    0x01: "Data",
    0x02: "RPC",
    0x04: "Spawn",
    0x05: "Despawn",
    0x06: "Scene change",
    0x07: "Player ready",
    0x08: "Change settings"
}

export const note_types = {
    0x00: "Vote"
}

export const opcodes = {
    0x00: "Unreliable (Payload)",
    0x01: "Reliable (Payload)",
    0x08: "Hello",
    0x09: "Disconnect",
    0x0a: "Acknowledge",
    0x0c: "Ping"
}

export const pet_ids = {
    0x00: "None",
    0x01: "Alien",
    0x02: "Crewmate",
    0x03: "Doggy",
    0x04: "Stickmin",
    0x05: "Hamster",
    0x06: "Robot",
    0x07: "UFO",
    0x08: "Ellie",
    0x09: "Squig",
    0x0a: "Bedcrab"
}

export const disconnect_reasons = {
    0x00: "None",
    0x01: "Game full",
    0x02: "Game started",
    0x03: "Game not found",
    0x05: "Incorrect version",
    0x06: "Banned",
    0x07: "Kicked",
    0x08: "Custom",
    0x09: "Invalid name",
    0x0a: "Hacking",
    0x10: "Destroy",
    0x11: "Error",
    0x12: "Incorrect game",
    0x13: "Server request",
    0x14: "Server full",
    0xd0: "Focus lost background",
    0xd1: "Intentional leaving",
    0xd2: "Focus lost",
    0xd3: "New connection"
}

export const rpc_ids = {
    0x00: "Play animation",
    0x01: "Complete task",
    0x02: "Sync settings",
    0x03: "Set imposters",
    0x04: "Exiled",
    0x05: "Check name",
    0x06: "Set name",
    0x07: "Check colour",
    0x08: "Set colour",
    0x09: "Set hat",
    0x0a: "Set skin",
    0x0b: "Report dead body",
    0x0c: "Murder player",
    0x0d: "Send chat",
    0x0e: "Start meeting",
    0x0f: "Set scanner",
    0x10: "Send chat note",
    0x11: "Set pet",
    0x12: "Set start counter",
    0x13: "Enter vent",
    0x14: "Exit vent",
    0x15: "Snap to",
    0x16: "Close",
    0x17: "Voting complete",
    0x18: "Cast vote",
    0x19: "Clearote",
    0x1a: "Add vote",
    0x1b: "Close doors of type",
    0x1c: "Repair system",
    0x1d: "Set tasks",
    0x1e: "Update game data"
}

export const skin_ids = {
    0x00: "None",
    0x01: "Astro",
    0x02: "Capt",
    0x03: "Mech",
    0x04: "Military",
    0x05: "Police",
    0x06: "Science",
    0x07: "SuitB",
    0x08: "SuitW",
    0x09: "Wall",
    0x0a: "Hazmat",
    0x0b: "Security",
    0x0c: "Tarmac",
    0x0d: "Miner",
    0x0e: "Winter",
    0x0f: "Archae"
}

export const spawn_ids = {
    0x00: "Ship status",
    0x01: "Meeting hub",
    0x02: "Lobby Behaviour",
    0x03: "Game data",
    0x04: "Player",
    0x05: "Headquarters",
    0x06: "Planet map",
    0x07: "April ship status"
}

export const system_types = {
    0x00: "Hallway",
    0x01: "Storage",
    0x02: "Cafeteria",
    0x03: "Reactor",
    0x04: "Upper engine",
    0x05: "Navigation",
    0x06: "Admin",
    0x07: "Electrical",
    0x08: "Life supply",
    0x09: "Shields",
    0x0a: "Medbay",
    0x0b: "Security",
    0x0c: "Weapons",
    0x0d: "Lower engine",
    0x0e: "Communications",
    0x0f: "Ship tasks",
    0x10: "Doors",
    0x11: "Sabotage",
    0x12: "Decontamination (Left)",
    0x13: "Launchpad",
    0x14: "Locker room",
    0x15: "Laboratory",
    0x16: "Balcony",
    0x17: "Office",
    0x18: "Greenhouse",
    0x19: "Dropship",
    0x1a: "Decontamination (Right)",
    0x1b: "Outside",
    0x1c: "Specimens",
    0x1d: "Boiler room"
}

export const tags = {
    0x00: "Host game",
    0x01: "Join game",
    0x02: "Start game",
    0x03: "Remove game",
    0x04: "Remove player",
    0x05: "Game data",
    0x06: "Game data recipient",
    0x07: "Joined game",
    0x08: "End game",
    0x09: "Get game list",
    0x0a: "Alter game",
    0x0b: "Kick player",
    0x0c: "Wait for host",
    0x0d: "Redirect",
    0x0e: "Master server list",
    0x10: "Get game list"
}

export const task_bar_updates = {
    0x00: "Always",
    0x01: "In meetings",
    0x02: "Never"
}

export const task_ids = {
    0x00: "Submit scan",
    0x01: "Prime shields",
    0x02: "Fuel engines",
    0x03: "Chart course",
    0x04: "Start reactor",
    0x05: "Swipe card",
    0x06: "Clear asteroids",
    0x07: "Upload data",
    0x08: "Inspect sample",
    0x09: "Empty chute",
    0x0a: "Empty garbage",
    0x0b: "Align engine output",
    0x0c: "Fix wiring",
    0x0d: "Calibrate distributor",
    0x0e: "Divert power",
    0x0f: "Unlock manifolds",
    0x10: "Reset reactor",
    0x11: "Fix lights",
    0x12: "Filter",
    0x13: "Fix comms",
    0x14: "Restore oxygen",
    0x15: "Stablise steering",
    0x16: "Assemble artifact",
    0x17: "Sort samples",
    0x18: "Measure weather",
    0x19: "Enter ID code",
    0x1a: "Buy beverage",
    0x1b: "Process data",
    0x1c: "Run diagnostics",
    0x1d: "Water plants",
    0x1e: "Monitor oxygen",
    0x1f: "Store artifact",
    0x20: "Fill canisters",
    0x21: "Activate weather nodes",
    0x22: "Insert keys",
    0x23: "Reset seismic",
    0x24: "Scan boarding pass",
    0x25: "Open waterways",
    0x26: "Replace water jug",
    0x27: "Repair drill",
    0x28: "Align telescope",
    0x29: "Record temperature",
    0x2a: "Reboot WiFi"
}
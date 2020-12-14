/**
 * @typedef PacketValue
 * @property {String} name
 * @property {"big"|"little"} endianness
 * @property {String} type
 * @property {Number} size
 * @property {String} description
 * @property {Buffer} slice
 * @property {Number} startpos
 * @property {Function|any} display
 * @property {Boolean} collapsed
 * @property {any} value
 */

function readUtf8String(bytes) {
    return decodeURIComponent(Buffer.from(bytes.reduce((out, b) => (out + ("0" + (b & 0xff).toString(16)).slice(-2)), ""), "hex").toString("utf8"));
}

export default class PacketReader {
    /**
     * @param {Buffer} buffer 
     */
    constructor(buffer, base) {
        /**
         * @type {Buffer}
         */
        this.buffer = buffer;
        this.base = base || 0;
        this.offset = 0;
        this.end = this.base + buffer.byteLength;
    }

    goto(offset) {
        this.offset = offset;
    }

    jump(bytes) {
        this.offset += bytes;

        return this.offset;
    }

    get left() {
        return Math.max(this.buffer.byteLength - this.offset, 0);
    }

    has(bytes) {
        return this.left >= bytes;
    }

    expect(bytes, name) {
        const num_bytes = typeof bytes.value === "undefined" ? bytes : bytes.value;

        if (!this.has(num_bytes)) {
            throw new Error("Expected " + name + " (" + num_bytes + " byte" + (num_bytes === 1 ? "" : "s") + ") at position " + (this.base + this.offset) + ", instead got EOB (End of Buffer)");
        }
    }

    /**
     * @param {Number} [start]
     * @param {Number} [length]
     * @returns {PacketReader}
     */
    slice(start, length) {
        if (typeof start === "undefined" || typeof length === "undefined") {
            return new PacketReader(this.buffer.slice(this.offset), this.base + this.offset);
        }
    

        return new PacketReader(this.buffer.slice(this.offset, this.offset + length), this.base + this.offset);
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    uint32BE(name, description, display) {
        this.expect(0x04, name);
        const value = this.buffer.readUInt32BE(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "uint32",
            endianness: "big",
            startpos: this.offset,
            size: 4,
            collapsed: false,
            slice: this.slice(this.offset, 4).buffer,
            warnings: []
        }

        this.offset += 0x04;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    uint32LE(name, description, display) {
        this.expect(0x04, name);
        const value = this.buffer.readUInt32LE(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "uint32",
            endianness: "little",
            startpos: this.offset,
            size: 4,
            collapsed: false,
            slice: this.slice(this.offset, 4).buffer,
            warnings: []
        }

        this.offset += 0x04;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    int32BE(name, description, display) {
        this.expect(0x04, name);
        const value = this.buffer.readUInt32BE(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "int32",
            endianness: "big",
            startpos: this.offset,
            size: 4,
            collapsed: false,
            slice: this.slice(this.offset, 4).buffer,
            warnings: []
        }

        this.offset += 0x04;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    int32LE(name, description, display) {
        this.expect(0x04, name);
        const value = this.buffer.readUInt32LE(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "int32",
            endianness: "little",
            startpos: this.offset,
            size: 4,
            collapsed: false,
            slice: this.slice(this.offset, 4).buffer,
            warnings: []
        }

        this.offset += 0x04;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    uint16BE(name, description, display) {
        this.expect(0x02, name);
        const value = this.buffer.readUInt16BE(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "uint16",
            endianness: "big",
            startpos: this.offset,
            size: 2,
            collapsed: false,
            slice: this.slice(this.offset, 2).buffer,
            warnings: []
        }

        this.offset += 0x02;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    uint16LE(name, description, display) {
        this.expect(0x02, name);
        const value = this.buffer.readUInt16LE(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "uint16",
            endianness: "little",
            startpos: this.offset,
            size: 2,
            collapsed: false,
            slice: this.slice(this.offset, 2).buffer,
            warnings: []
        }

        this.offset += 0x02;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    int16BE(name, description, display) {
        this.expect(0x02, name);
        const value = this.buffer.readUInt16BE(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "int16",
            endianness: "big",
            startpos: this.offset,
            size: 2,
            collapsed: false,
            slice: this.slice(this.offset, 2).buffer,
            warnings: []
        }

        this.offset += 0x02;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    int16LE(name, description, display) {
        this.expect(0x02, name);
        const value = this.buffer.readUInt16LE(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "int16",
            endianness: "little",
            startpos: this.offset,
            size: 2,
            collapsed: false,
            slice: this.slice(this.offset, 2).buffer,
            warnings: []
        }

        this.offset += 0x02;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    uint8(name, description, display) {
        this.expect(0x01, name);
        const value = this.buffer.readUInt8(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "uint8",
            endianness: null,
            startpos: this.offset,
            size: 1,
            collapsed: false,
            slice: this.slice(this.offset, 1).buffer,
            warnings: []
        }

        this.offset += 0x01;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    int8(name, description, display) {
        this.expect(0x01, name);
        const value = this.buffer.readUInt8(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "int8",
            endianness: null,
            startpos: this.offset,
            size: 1,
            collapsed: false,
            slice: this.slice(this.offset, 1).buffer,
            warnings: []
        }

        this.offset += 0x01;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    byte(name, description, display) {
        this.expect(0x01, name);
        const value = this.buffer.readUInt8(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "byte",
            endianness: null,
            startpos: this.offset,
            size: 1,
            collapsed: false,
            slice: this.slice(this.offset, 1).buffer,
            warnings: []
        }

        this.offset += 0x01;

        return packetpos;
    }

    /**
     * @param {Number} number
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    bytes(number, name, description, display) {
        this.expect(number, name);
        const value = [...this.slice(this.offset, number).buffer];

        const packetpos = {
            name,
            description,
            display,
            value,
            type: number + " byte" + (number === 1 ? "" : "s"),
            endianness: null,
            startpos: this.offset,
            size: value.length,
            collapsed: false,
            slice: Buffer.from(value),
            warnings: []
        }

        this.offset += number;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    bitfield(name, description, display) {
        this.expect(0x01, name);
        const value = this.buffer.readUInt8(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "bitfield",
            endianness: null,
            startpos: this.offset,
            size: 1,
            collapsed: false,
            slice: this.slice(this.offset, 1).buffer,
            warnings: []
        }

        this.offset += 0x01;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    bool(name, description, display) {
        this.expect(0x01, name);
        const value = this.buffer.readUInt8(this.offset) === 0x01;

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "bool",
            endianness: null,
            startpos: this.offset,
            size: 1,
            collapsed: false,
            slice: this.slice(this.offset, 1).buffer,
            warnings: []
        }

        this.offset += 0x01;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    floatBE(name, description, display) {
        this.expect(0x04, name);
        const value = this.buffer.readFloatBE(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "float",
            endianness: "big",
            startpos: this.offset,
            size: 4,
            collapsed: false,
            slice: this.slice(this.offset, 4).buffer,
            warnings: []
        }

        this.offset += 0x04;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    floatLE(name, description, display) {
        this.expect(0x04, name);
        const value = this.buffer.readFloatLE(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "float",
            endianness: "little",
            startpos: this.offset,
            size: 4,
            collapsed: false,
            slice: this.slice(this.offset, 4).buffer,
            warnings: []
        }

        this.offset += 0x04;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    doubleBE(name, description, display) {
        this.expect(0x08, name);
        const value = this.buffer.readDoubleBE(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "double",
            endianness: "big",
            startpos: this.offset,
            size: 8,
            collapsed: false,
            slice: this.slice(this.offset, 8).buffer,
            warnings: []
        }

        this.offset += 0x08;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    doubleLE(name, description, display) {
        this.expect(0x08, name);
        const value = this.buffer.readDoubleLE(this.offset);

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "double",
            endianness: "little",
            startpos: this.offset,
            size: 8,
            collapsed: false,
            slice: this.slice(this.offset, 8).buffer,
            warnings: []
        }

        this.offset += 0x08;

        return packetpos;
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    packed(name, description, display) {
        this.expect(0x01, name);
        let value = 0;
        let size = 0;

        for (;; size++) {
            const byte = this.byte(name, description);

            const read = (byte.value >> 7) & 1;
            const val = read ? byte.value ^ 0x80 : byte.value;

            value |= val << size * 7;

            if (!read) {
                break;
            }
        }

        return {
            name,
            description,
            display,
            value,
            type: "packed",
            endianness: null,
            startpos: this.offset,
            size: size,
            collapsed: false,
            slice: this.slice(this.offset - size - 1, size + 1).buffer,
            warnings: []
        }
    }

    /**
     * @param {String} name
     * @param {String} description
     * @returns {PacketValue}
     */
    string(name, description, display) {
        this.expect(0x01, "length of " + name);
        const start = this.offset;
        const size = this.packed(name + " length", null).value;
        this.expect(size, name);
        let value = "";

        value = readUtf8String([...this.buffer.slice(this.offset, this.offset + size)]);
        this.offset += size;

        const packetpos = {
            name,
            description,
            display,
            value,
            type: "string",
            endianness: null,
            startpos: this.offset,
            size: size,
            collapsed: false,
            slice: this.buffer.slice(start, this.offset - start),
            warnings: []
        }

        return packetpos;
    }
}
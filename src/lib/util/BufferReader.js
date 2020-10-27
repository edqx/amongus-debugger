/**
 * Represents a buffer reader.
 */
export default class BufferReader {
    /**
     * @param {Buffer} buffer The buffer to read.
     */
    constructor(buffer) {
        if (typeof buffer === "string") {
            /**
             * @type {Buffer}
             */
            this.buffer = Buffer.from(buffer.split(" ").map(byte => parseInt(byte, 16)));
        } else {
            /**
             * @type {Buffer}
             */
            this.buffer = buffer;
        }

        /**
         * The offset of the reader.
         * @type {Number}
         */
        this.offset = 0x00;
    }

    [Symbol.toStringTag]() {
        return this.buffer.toString();
    }
    
    /**
     * The size of the buffer in bytes.
     */
    get size() {
        return this.buffer.byteLength;
    }
    
    /**
     * Goto a certain position in the buffer.
     * @param {Number} offset
     */
    goto(offset) {
        this.offset = offset;
    }

    /**
     * Jump a certain amount of bytes.
     * @returns {Number}
     */
    jump(bytes) {
        this.offset += bytes;

        return this.offset;
    }

    /**
     * Get the number of bytes remaining in the reader.
     * @type {Number}
     */
    get left() {
        return this.size - this.offset;
    }

    /**
     * Check if the reader has a certain number of bytes remaining.
     * @param {Number} bytes 
     * @returns {Boolean}
     */
    has(bytes) {
        return this.left >= bytes;
    }

    /**
     * Assert the number of bytes left.
     * @param {Number} bytes The number of bytes to check.
     * @param {String} err The error to throw.
     */
    expect(bytes, err) {
        if (!this.has(bytes)) throw new Error("Expected " + err + " (" + bytes + " byte" + (bytes === 1 ? "" : "s") + ") after byte " + this.offset + ", but reached end of buffer instead.");
    }

    /**
     * Read a Big-Endian unsigned 32 bit integer.
     * @returns {Number}
     */
    uint32BE() {
        const val = this.buffer.readUInt32BE(this.offset);
        this.offset += 0x04;

        return val;
    }
    
    /**
     * Read a Little-Endian unsigned 32 bit integer.
     * @returns {Number}
     */
    uint32LE() {
        const val = this.buffer.readUInt32LE(this.offset);
        this.offset += 0x04;

        return val;
    }
    
    /**
     * Read a Big-Endian 32 bit integer.
     * @returns {Number}
     */
    int32BE() {
        const val = this.buffer.readInt32BE(this.offset);
        this.offset += 0x04;

        return val;
    }
    
    /**
     * Read a Big-Endian 32 bit integer.
     * @returns {Number}
     */
    int32LE() {
        const val = this.buffer.readInt32LE(this.offset);
        this.offset += 0x04;

        return val;
    }
    
    /**
     * Read a Big-Endian unsigned 16 bit integer.
     * @returns {Number}
     */
    uint16BE() {
        const val = this.buffer.readUInt16BE(this.offset);
        this.offset += 0x02;

        return val;
    }
    
    /**
     * Read a Little-Endian unsigned 16 bit integer.
     * @returns {Number}
     */
    uint16LE() {
        const val = this.buffer.readUInt16LE(this.offset);
        this.offset += 0x02;

        return val;
    }

    /**
     * Read a Big-Endian 16 bit integer.
     * @returns {Number}
     */
    int16BE() {
        const val = this.buffer.readInt16LE(this.offset);
        this.offset += 0x02;

        return val;
    }
    
    /**
     * Read a Little-Endian 16 bit integer.
     * @returns {Number}
     */
    int16LE() {
        const val = this.buffer.readInt16LE(this.offset);
        this.offset += 0x02;

        return val;
    }
    
    /**
     * Read an unsigned 8 bit integer.
     * @returns {Number}
     */
    uint8() {
        const val = this.buffer.readUInt8(this.offset);
        this.offset += 0x01;

        return val;
    }
    
    /**
     * Read an 8 bit integer.
     * @returns {Number}
     */
    int8() {
        const val = this.buffer.readInt8(this.offset);
        this.offset += 0x01;

        return val;
    }

    /**
     * Read a single byte.
     * @returns {Number}
     */
    byte() {
        return this.uint8();
    }
    
    /**
     * Read several bytes.
     * @param {Number} num
     * @returns {Array<Number>}
     */
    bytes(num) {
        const bytes = [];

        for (let i = 0; i < num; i++) {
            bytes.push(this.byte());
        }

        return bytes;
    }

    /**
     * Read a boolean.
     * @returns {Boolean}
     */
    bool() {
        return this.uint8() === 0x01;
    }

    /**
     * Read a Big-Endian 32 bit float.
     * @returns {Number}
     */
    floatBE() {
        const val = this.buffer.readFloatBE(this.offset);
        this.offset += 0x04;

        return val;
    }

    /**
     * Read a Little-Endian 32 bit float.
     * @returns {Number}
     */
    floatLE() {
        const val = this.buffer.readFloatLE(this.offset);
        this.offset += 0x04;

        return val;
    }

    /**
     * Read a Big-Endian 64 bit double.
     * @returns {Number}
     */
    doubleBE() {
        const val = this.buffer.readDoubleBE(this.offset);
        this.offset += 0x08;

        return val;
    }

    /**
     * Read a Little-Endian 64 bit double.
     * @returns {Number}
     */
    doubleLE() {
        const val = this.buffer.readDoubleLE(this.offset);
        this.offset += 0x08;

        return val;
    }

    /**
     * Read a packed integer.
     * @returns {Number}
     */
    packed() {
        let output = 0;

        for (let shift = 0;; shift+=7) {
            this.expect(0x01, "packed byte");
            const byte = this.uint8();

            const read = (byte >> 7) & 1;
            const val = read ? byte ^ 0b10000000 : byte;

            output |= val << shift;

            if (!read) {
                break;
            }
        }

        return output;
    }

    /**
     * Read a string with a known length.
     */
    string(length) {
        let str = "";

        if (typeof length === "undefined") {
            const length = this.uint8();

            this.expect(length, "string");
            return this.string(length);
        }

        for (let i = 0; i < length; i++) {
            str += String.fromCharCode(this.uint8());
        }

        return str;
    }
}
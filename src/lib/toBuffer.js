import { Buffer } from "buffer/"

export default function toBuffer(text) {
    const bytes = (text.replace(/ /g, "").match(/[^\s]{1,2}/g) || []).map(byte => parseInt(byte, 16));

    return Buffer.from(bytes);
}
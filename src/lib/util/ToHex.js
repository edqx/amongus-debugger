export function ToHex(val, length, be) {
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
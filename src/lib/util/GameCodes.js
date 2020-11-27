const V2 = "QWXRTYLPESDFGHUJKZOCVBINMA";
const V2Map = [25, 21, 19, 10, 8, 11, 12, 13, 22, 15, 16, 6, 24, 23, 18, 7, 0, 3, 9, 4, 14, 20, 1, 2, 5, 17];

export function V1Code2Int(code) {
    const a = code.charCodeAt(0) & 0xFF;
    const b = code.charCodeAt(1) & 0xFF;
    const c = code.charCodeAt(2) & 0xFF;
    const d = code.charCodeAt(3) & 0xFF;

    return a << 24 | b << 16 | c << 8 | d;
}

export function V1Int2Code(bytes) {
    const a = String.fromCharCode((bytes >> 24) & 0xFF);
    const b = String.fromCharCode((bytes >> 16) & 0xFF);
    const c = String.fromCharCode((bytes >> 8) & 0xFF);
    const d = String.fromCharCode(bytes & 0xFF);

    return a + b + c + d;
}

export function V2Code2Int(code) {
    var a = V2Map[code.charCodeAt(0) - 65];
    var b = V2Map[code.charCodeAt(1) - 65];
    var c = V2Map[code.charCodeAt(2) - 65];
    var d = V2Map[code.charCodeAt(3) - 65];
    var e = V2Map[code.charCodeAt(4) - 65];
    var f = V2Map[code.charCodeAt(5) - 65];
    var one = (a + 26 * b) & 0x3FF;
    var two = (c + 26 * (d + 26 * (e + 26 * f)));
    return (one | ((two << 10) & 0x3FFFFC00) | 0x80000000);
}

export function V2Int2Code(bytes) {
    var a = bytes & 0x3FF;
    var b = (bytes >> 10) & 0xFFFFF;
    return V2[a % 26] +
        V2[~~(a / 26)] +
        V2[b % 26] +
        V2[~~(b / 26 % 26)] +
        V2[~~(b / (26 * 26) % 26)] +
        V2[~~(b / (26 * 26 * 26) % 26)];
}

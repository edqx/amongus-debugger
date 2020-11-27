<script>
    import { V2Int2Code, V2Code2Int, V1Int2Code, V1Code2Int } from "../lib/util/GameCodes.js"
    import { EncodeVersion, DecodeVersion } from "../lib/util/Versions.js"
    import { LerpValue, UnlerpValue } from "../lib/util/Lerp.js"
    import { Buffer } from "buffer/"

    import PacketReader from "../lib/util/PacketReader.js"

    import toBuffer from "../lib/toBuffer.js"

    let v1code = "";
    let v1bytes = "00 00 00 00";
    let v1num = 0;

    let v2code = "";
    let v2bytes = "00 00 00 00";
    let v2num = 0;

    function hex(val, length, be) {
        const hexstr = Math.abs(val).toString(16);
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

    $: v1code = v1code.toUpperCase();
    $: v1bytes = (v1bytes.replace(/[^a-fA-f0-9]/g, "").match(/[^\s]{1,2}/g) || []).join(" ").toUpperCase();

    function SetV1Code() {
        v1bytes = v1code.split("").map(char => hex(char.charCodeAt(0))).join(" ");
        v1num = V1Code2Int(v1code);
    }

    function setV1Bytes() {
        v1code = v1bytes ? v1bytes.split(" ").map(byte => String.fromCharCode(parseInt(byte, 16))).join("") : "";
        v1num = V1Code2Int(v1code);
    }

    function setV1Num() {
        v1code = V1Int2Code(v1num);
        v1bytes = hex(v1num, 8).match(/.{1,2}/g).join(" ");
    }

    $: v2code = v2code.toUpperCase();
    $: v2bytes = (v2bytes.replace(/[^a-fA-f0-9]/g, "").match(/[^\s]{1,2}/g) || []).join(" ").toUpperCase();

    function setV2Code() {
        const intcode = V2Code2Int(v2code);
        v2bytes = v2code ? hex(intcode, 8).match(/.{1,2}/g).join(" ") : "";
        v2num = intcode;
    }

    function setV2Bytes() {
        const buff = toBuffer(v2bytes);

        v2code = v2bytes.length ? V2Int2Code(buff.byteLength >= 4 ? buff.readInt32LE(0) : 0) : "";
        v2num = buff.readInt32LE();
    }

    function setV2Num() {
        v2code = V2Int2Code(v2num);
        v2bytes = hex(v2num.toString(16), 8);
    }

    let vyear = "";
    let vmonth = "";
    let vday = "";
    let vbuild = "";

    let vbytes = "00 00 00 00";
    let vnum = 0;

    $: vyear = (vyear || "").toString().replace(/[^0-9]/g, "");
    $: vmonth = (vmonth || "").toString().replace(/[^0-9]/g, "");
    $: vday = (vday || "").toString().replace(/[^0-9]/g, "");
    $: vbuild = (vbuild || "").toString().replace(/[^0-9]/g, "");
    
    $: vbytes = (vbytes.replace(/[^a-fA-f0-9]/g, "").match(/[^\s]{1,2}/g) || []).join(" ").toUpperCase();

    function setVersionInputs() {
        if (vyear || vmonth || vday || vbuild) {
            vbytes = EncodeVersion({
                year: parseInt(vyear) || 0,
                month: parseInt(vmonth) || 0,
                day: parseInt(vday) || 0,
                build: parseInt(vbuild) || 0
            });
            
            const buff = Buffer.alloc(4);
            buff.writeUInt32LE(Math.min(vbytes, (2 ** 32) - 1));

            vnum = buff.readUInt32LE(0);
            vbytes = vbytes ? [...buff].map(byte => hex(byte)).join(" ") : "00 00 00 00";
        } else {
            vnum = 0;
            vbytes = "00 00 00 00";
        }
    }

    function setVersionBytes() {
        const buff = toBuffer(vbytes);

        const version = vbytes.length ? DecodeVersion(buff.byteLength >= 4 ? buff.readInt32LE(0x00) : 0) : null;

        if (version) {
            vyear = version.year.toString();
            vmonth = version.month.toString();
            vday = version.day.toString();
            vbuild = version.build.toString();
        }
    }

    function setVersionNum() {

    }

    let packedint = 0;
    let packedbytes = "00 00 00 00 ";

    $: packedint = (packedint || "").toString().replace(/[^\-0-9]/g, "");
    $: packedbytes = (packedbytes.replace(/[^a-fA-f0-9]/g, "").match(/[^\s]{1,2}/g) || []).join(" ").toUpperCase();

    function setPackedIntBytes() {
        let bytes = [];
        let val = packedint;

        do {
            let b = val & 0b11111111;

            if (val >= 0b10000000) {
                b |= 0b10000000;
            }

            bytes.push(b);

            val >>= 7;
        } while (val > 0);
        
        packedbytes = bytes.map(byte => hex(byte)).join(" ");
    }

    function setPackedInt() {
        const buff = toBuffer(packedbytes);
        const reader = new PacketReader(buff);

        try {
            packedint = reader.packed().value.toString();
        } catch (e) {
            packedint = "0";
        }
    }

    function setLerped() {
        lerpx = UnlerpValue(lerpedx, lerpmin, lerpmax).toFixed(3);
        lerpy = UnlerpValue(lerpedy, lerpmin, lerpmax).toFixed(3);
    }

    function setLerp() {
        lerpedx = LerpValue(lerpx, lerpmin, lerpmax);
        lerpedy = LerpValue(lerpy, lerpmin, lerpmax);
    }

    let lerpedx = 0;
    let lerpedy = 0;
    let lerpmin = -40;
    let lerpmax = 40;
    let lerpx = 0;
    let lerpy = 0;

    setLerped();
</script>

<span class="title">Among Us Tools</span>
<span>Convert Among Us packet structures quickly and accurately.</span>
<span>Made by <a href="https://github.com/edqx/amongus-debugger">weakeyes</a>.</span>
<br>
<div class="center-wrapper">
    <div class="conversion">
        <span>Code V1</span><br>
        <input placeholder="Code V1" maxlength=4 bind:value={v1code} on:input={SetV1Code}/><br>
        <span>Bytes</span><br>
        <input placeholder="Bytes" maxlength=11 bind:value={v1bytes} on:input={setV1Bytes}/><br>
        <span>Integer</span><br>
        <input placeholder="Integer" type="number" bind:value={v1num} on:input={setV1Num}/><br>
    </div>
    <div class="conversion">
        <span>Code V2</span><br>
        <input placeholder="Code V2" maxlength=6 bind:value={v2code} on:input={setV2Code}/><br>
        <span>Bytes</span><br>
        <input placeholder="Bytes" maxlength=11 bind:value={v2bytes} on:input={setV2Bytes}/><br>
        <span>Integer</span><br>
        <input placeholder="Integer" type="number" bind:value={v2num} on:input={setV2Num}/><br>
    </div>
    <div class="conversion parts">
        <div class="section">
            <span>Version</span><br>
            <input placeholder="Year" type="number" min="0" maxlength=4 bind:value={vyear} on:input={setVersionInputs}/><br>
            <input placeholder="Month" type="number" min="0" max="12" maxlength=2 bind:value={vmonth} on:input={setVersionInputs}/><br>
            <input placeholder="Day" type="number" min="0" max="31" maxlength=2 bind:value={vday} on:input={setVersionInputs}/><br>
            <input placeholder="Build" type="number" min="0" bind:value={vbuild} on:input={setVersionInputs}/><br>
        </div>
        <div class="section" style="text-align: center;">-&gt;</div>
        <div class="section">
            <span>Bytes</span><br>
            <input placeholder="Bytes" maxlength=11 bind:value={vbytes} on:input={setVersionBytes}/>
        </div>
        <div class="section">
            <span>Integer</span><br>
            <input placeholder="Integer" type="number" min="0" max="4294967295" bind:value={vnum} on:input={setVersionNum}/>
        </div>
    </div>
    <div class="conversion">
        <span>Packed int</span><br>
        <input placeholder="Integer" type="number" bind:value={packedint} on:input={setPackedIntBytes}/><br>
        <span>Bytes</span><br>
        <input placeholder="Bytes" maxlength=22 bind:value={packedbytes} on:input={setPackedInt}/><br>
    </div>
    <div class="conversion">
        <span>Vector lerp</span><br>
        <input placeholder="X" type="number" bind:value={lerpedx} on:input={setLerped}/><br>
        <input placeholder="Y" type="number" bind:value={lerpedy} on:input={setLerped}/><br>
        <span>Min/max</span><br>
        <input placeholder="Min" type="number" bind:value={lerpmin} on:input={setLerped}/><br>
        <input placeholder="Max" type="number" bind:value={lerpmax} on:input={setLerped}/><br>
        <span>Lerped</span><br>
        <input placeholder="X" type="number" bind:value={lerpx} on:input={setLerp}/><br>
        <input placeholder="Y" type="number" bind:value={lerpy} on:input={setLerp}/><br>
    </div>
</div>

<style>
    .center-wrapper {
        width: 60%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .conversion {
        border-radius: 8px;
        border: 1px solid #cccecc;
        padding: 14px;
        margin: 8px;
        flex: 1 1 0;
    }

    .conversion.parts {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }

    .section {
        flex: 1 1 0;
        white-space: nowrap;
    }

    input {
        margin-top: 4px;
    }
</style>
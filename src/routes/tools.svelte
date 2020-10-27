<script>
    import { Int2Code, Code2Int } from "../lib/util/GameCodes.js"
    import { EncodeVersion, DecodeVersion } from "../lib/util/Versions.js"
    import { Buffer } from "buffer/"
    import toBuffer from "../lib/toBuffer.js"

    let v1code = "";
    let v1bytes = "";

    let v2code = "";
    let v2bytes = "";

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

    $: v1code = v1code.toUpperCase();
    $: v1bytes = (v1bytes.replace(/[^a-fA-f0-9]/g, "").match(/[^\s]{1,2}/g) || []).join(" ").toUpperCase();

    function setV1Bytes() {
        v1bytes = v1code.split("").map(char => hex(char.charCodeAt(0))).join(" ");
    }

    function setV1Code() {
        v1code = v1bytes ? v1bytes.split(" ").map(byte => String.fromCharCode(parseInt(byte, 16))).join("") : "";
    }

    $: v2code = v2code.toUpperCase();
    $: v2bytes = (v2bytes.replace(/[^a-fA-f0-9]/g, "").match(/[^\s]{1,2}/g) || []).join(" ").toUpperCase();

    function setV2Bytes() {
        const buff = Buffer.alloc(4);
        buff.writeInt32LE(Code2Int(v2code));

        v2bytes = v2code ? [...buff].map(byte => hex(byte)).join(" ") : "";
    }

    function setV2Code() {
        const buff = toBuffer(v2bytes);

        v2code = v2bytes.length ? Int2Code(buff.byteLength >= 4 ? buff.readInt32LE(0x00) : 0) : "";
    }

    let vyear = "";
    let vmonth = "";
    let vday = "";
    let vbuild = "";

    let vbytes = "";

    $: vyear = parseInt(vyear.toString().replace(/[^0-9]/g, "")) || "";
    $: vmonth = parseInt(vmonth.toString().replace(/[^0-9]/g, "")) || "";
    $: vday = parseInt(vday.toString().replace(/[^0-9]/g, "")) || "";
    $: vbuild = parseInt(vbuild.toString().replace(/[^0-9]/g, "")) || "";
    
    $: vbytes = (vbytes.replace(/[^a-fA-f0-9]/g, "").match(/[^\s]{1,2}/g) || []).join(" ").toUpperCase();

    function setVersionBytes() {
        vbytes = EncodeVersion({
            year: vyear,
            month: vmonth,
            day: vday,
            build: vbuild
        });
        
        const buff = Buffer.alloc(4);
        buff.writeUInt32LE(Math.min(vbytes, (2 ** 32) - 1));

        vbytes = vbytes ? [...buff].map(byte => hex(byte)).join(" ") : "";
    }

    function setVersion() {
        const buff = toBuffer(vbytes);

        const version = vbytes.length ? DecodeVersion(buff.byteLength >= 4 ? buff.readInt32LE(0x00) : 0) : null;

        if (version) {
            vyear = version.year;
            vmonth = version.month;
            vday = version.day;
            vbuild = version.build;
        }

        console.log(version);
    }
</script>

<span class="title">Among Us Tools</span>
<span>Convert Among Us packet structures quickly and accurately.</span>
<span>Made by <a href="https://github.com/edqx/amongus-debugger">weakeyes</a>.</span>
<br>
<div class="center-wrapper">
    <div class="conversion">
        <span>Code V1</span><br>
        <input placeholder="Code V1" maxlength=4 bind:value={v1code} on:input={setV1Bytes}/><br>
        <span>Bytes</span><br>
        <input placeholder="Bytes" maxlength=11 bind:value={v1bytes} on:input={setV1Code}/><br>
    </div>
    <div class="conversion">
        <span>Code V2</span><br>
        <input placeholder="Code V2" maxlength=6 bind:value={v2code} on:input={setV2Bytes}/><br>
        <span>Bytes</span><br>
        <input placeholder="Bytes" maxlength=11 bind:value={v2bytes} on:input={setV2Code}/><br>
    </div>
    <div class="conversion parts">
        <div class="section">
            <span>Version</span><br>
            <input placeholder="Year" maxlength=4 bind:value={vyear} on:input={setVersionBytes}/><br>
            <input placeholder="Month" maxlength=2 bind:value={vmonth} on:input={setVersionBytes}/><br>
            <input placeholder="Day" maxlength=2 bind:value={vday} on:input={setVersionBytes}/><br>
            <input placeholder="Build" bind:value={vbuild} on:input={setVersionBytes}/><br>
        </div>
        <div class="section" style="text-align: center;">-&gt;</div>
        <div class="section">
            <span>Bytes</span><br>
            <input placeholder="Bytes" maxlength=11 bind:value={vbytes} on:input={setVersion}/>
        </div>
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
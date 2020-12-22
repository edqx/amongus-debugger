<script>
    import { flip } from "svelte/animate";
	import { quadOut } from 'svelte/easing';

    import { Buffer } from "buffer/"
    import RegionServer from "../components/RegionServer.svelte";
    import PacketReader from "../lib/util/PacketReader";
    import toBuffer from "../lib/toBuffer";

    const IPV4_VALIDATE = /^((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))$/;

    let region = load_region();
    let regionbytes = "";

    regionbytes = serialise_region(region).toString("hex").match(/[^\s]{1,2}/g).join(" ");

    function load_region() {
        const storage = localStorage.getItem("region");

        if (storage) {
            const json = JSON.parse(storage);

            if (Array.isArray(json.servers) && json.selected >= json.servers.length) {
                json.selected = json.servers.length - 1;
            }

            return {
                name: "",
                pingip: "",
                servers: [],
                selected: 0,
                ...json
            };
        }

        return {
            name: "",
            pingip: "",
            servers: [],
            selected: 0
        };
    }

    function save_region() {
        regionbytes = serialise_region(region).toString("hex").match(/[^\s]{1,2}/g).join(" ");;

        localStorage.setItem("region", JSON.stringify(region));
    }

    $: region.name = region.name.replace(/[^\u0000-\u00ff]/g, "");
    $: region.pingip = region.pingip.replace(/[^0-9A-Za-z.]/g, "");

    function create_server() {
        region.servers = [...region.servers, {
            name: region.name + "-Master-" + (region.servers.length + 1),
            ip: "",
            port: 22023
        }];
    }

    function get_packed_int_sz(num) {
        return Math.ceil(num.toString(2).length / 7);
    }

    function write_packed_int(buf, num, cursor) {
        if (num < 0) {
            num = num >>> 0;
        }

        do {
            let b = num & 0b11111111;

            if (num >= 0b10000000) {
                b |= 0b10000000;
            }

            cursor = buf.writeUInt8(b, cursor);

            num >>>= 7;
        } while (num > 0);

        return cursor;
    }

    function download_region() {
        const buf = serialise_region(region);

        const element = document.createElement("a");
        const blob = new Blob([buf]);
        const url = window.URL.createObjectURL(blob);

        element.setAttribute("href", url);
        element.setAttribute("download", "regionInfo.dat");

        element.style.display = "none";
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    function serialise_region(region) {
        const buf = Buffer.alloc(
            + 4 // Current server idx
            + region.name.length + get_packed_int_sz(region.name.length) // Name of region (+length)
            + region.pingip.length + get_packed_int_sz(region.pingip.length) // Name of ping IP (+length)
            + 4 // number of servers
            + region.servers.reduce((acc, server) => {
                return acc
                    + server.name.length + get_packed_int_sz(server.name.length) // Name of server (+length)
                    + 4 // Server IP address
                    + 2 // Server port
                    + 4 // Connection attempts
            }, 0)
        );

        let cursor = 0;
        cursor = buf.writeInt32LE(region.selected < 0 ? 0 : region.selected, cursor);
        cursor = write_packed_int(buf, region.name.length, cursor);
        cursor += buf.write(region.name, cursor);
        cursor = write_packed_int(buf, region.pingip.length, cursor);
        cursor += buf.write(region.pingip, cursor);
        
        cursor = buf.writeInt32LE(region.servers.length, cursor);
        for (let i = 0; i < region.servers.length; i++) {
            const server = region.servers[i];

            cursor = write_packed_int(buf, server.name.length, cursor);
            cursor += buf.write(server.name, cursor);
            
            const bytes = server.ip.split(".").map(_ => parseInt(_));
            cursor = buf.writeUInt8(bytes[0] || 0, cursor);
            cursor = buf.writeUInt8(bytes[1] || 0, cursor);
            cursor = buf.writeUInt8(bytes[2] || 0, cursor);
            cursor = buf.writeUInt8(bytes[3] || 0, cursor);

            cursor = buf.writeUInt16LE(server.port, cursor);
            cursor = buf.writeInt32LE(0, cursor);
        }

        return buf;
    }

    function deserialise_region(buf) {
        const reader = new PacketReader(buf);

        region.selected = reader.int32LE().value;
        region.name = reader.string().value;
        region.pingip = reader.string().value;
        
        const num_servers = reader.int32LE().value;
        region.servers = [];
        for (let i = 0; i < num_servers; i++) {
            const server = {};
            server.name = reader.string().value;
            server.ip = reader.bytes(4).value.join(".");
            server.port = reader.uint16LE().value;
            reader.int32LE();

            region.servers.push(server);
        }
    }

    function delete_server(i) {
        region.servers.splice(i, 1);
        region.servers = region.servers;
        
        if (region.selected >= region.servers.length) {
            region.selected = region.servers.length - 1;
        }

        save_region();
    }

    const file_select = document.createElement("input");
    file_select.type = "file";
    file_select.accept = ".dat";

    file_select.style.display = "none";
    document.body.appendChild(file_select);
    
    file_select.onchange = () => {
        var file = file_select.files[0]; 
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = readerEvent => {
            var content = readerEvent.target.result;

            const buffer = Buffer.from(content);

            deserialise_region(buffer);
        }
    }
    
    function import_file(e) {
        e.preventDefault();

        file_select.value = "";
        file_select.click();
    }
</script>

<span class="title">Among Us Region Editor</span>
<span>Easily create region files to connect to custom servers.</span>
<span>Made by <a href="https://github.com/edqx/amongus-debugger">weakeyes</a>.</span>
<br>
<div class="center-wrapper">
    <button class="good" on:click={download_region}>Export ➥</button>
    <button class="good" on:click={import_file}>Import file ⇓</button><br><br>
    <span>After exporting the file, replace the regionInfo.dat in AppData\LocalLow\Innersloth\Among Us with the one you downloaded.</span><br><br>
    <textarea class="region-input" style="width: 80%" spellcheck="false" bind:value={regionbytes} on:input={() => deserialise_region(toBuffer(regionbytes))} placeholder="Region data"></textarea><br><br>
    <input bind:value={region.name} on:input={save_region} placeholder="Region name"/>&nbsp;Region name<br>
    <input bind:value={region.pingip} on:input={save_region} placeholder="Ping IP"/>&nbsp;Ping IP<br>
    <h4>Servers <button class="good" on:click={create_server}>+</button></h4><br>
    <div class="server-list">
        {#each region.servers as server, i (server)}
            <div animate:flip={{ duration: 250, easing: quadOut }}>
                <RegionServer on:input={save_region} bind:selected={region.selected} servers={region.servers} on:delete={() => delete_server(i)} {i}/>
            </div>
        {/each}
    </div>
</div>

<style>
    .center-wrapper {
        width: 80%;
    }

    .server-list {
        display: flex;
        flex-wrap: wrap;
    }

    h4 {
        margin-top: 8px;
        margin-bottom: 0;
    }
</style>
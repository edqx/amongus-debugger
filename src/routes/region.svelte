<script>
    import { flip } from "svelte/animate";
	import { quadOut } from 'svelte/easing';

    import Buffer from "buffer/"
    import RegionServer from "../components/RegionServer.svelte";

    const IPV4_VALIDATE = /^((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))\.((25[0-5])|(2[0-4][0-9])|([0-1]?[0-9]?[0-9]))$/;

    let region = loadRegion();

    function loadRegion() {
        const storage = localStorage.getItem("region");

        if (storage) {
            return JSON.parse(storage);
        }

        return {
            name: "",
            pingip: "",
            servers: []
        };
    }

    function saveRegion() {
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
        cursor = buf.writeInt32LE(1, cursor);
        cursor = write_packed_int(buf, region.name.length, cursor);
        cursor += buf.write(region.name, cursor);
        cursor = write_packed_int(buf, region.pingip.length, cursor);
        cursor += buf.write(region.pingip, cursor);
        
        cursor = buf.writeInt32LE(region.servers.length, cursor);
        for (let i = 0; i < region.servers.length; i++) {
            const server = region.servers[i];

            cursor = write_packed_int(buf, server.name.length, cursor);
            cursor += buf.write(server.name, cursor);
            
            server.ip.split(".").map(_ => parseInt(_)).forEach(byte => {
                cursor = buf.writeUInt8(byte, cursor);
            });
            cursor = buf.writeInt16LE(server.port, cursor);
            cursor = buf.writeInt32LE(0, cursor);
        }
        
        var element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(buf.toString("utf8")));
        element.setAttribute("download", "regionInfo.dat");

        element.style.display = "none";
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
</script>

<span class="title">Among Us Region Editor</span>
<span>Easily create region files to connect to custom servers.</span>
<span>Made by <a href="https://github.com/edqx/amongus-debugger">weakeyes</a>.</span>
<br>
<div class="center-wrapper">
    <button class="good" on:click={download_region}>Export ➥</button><br><br>
    <input bind:value={region.name} on:input={saveRegion} placeholder="Region name"/>&nbsp;Region name<br>
    <input bind:value={region.pingip} on:input={saveRegion} placeholder="Ping IP"/>&nbsp;Ping IP<br>
    <h4>Servers <button class="good" on:click={create_server}>+</button></h4><br>
    <div class="server-list">
        {#each region.servers as server, i (server)}
            <div animate:flip={{ duration: 250, easing: quadOut }}>
                <RegionServer on:input={saveRegion} servers={region.servers} on:delete={() => (region.servers.splice(i, 1), region.servers = region.servers, saveRegion())} {i}/>
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
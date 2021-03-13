<script>
    import { flip } from "svelte/animate";
	import { quadOut } from 'svelte/easing';

    import RegionServer from "../components/RegionServer.svelte";

    const file_select = document.createElement("input");
    file_select.type = "file";
    file_select.accept = ".json";

    file_select.style.display = "none";
    document.body.appendChild(file_select);

    const regionInfo = {
        selected: 0,
        regions: []
    };

    function download_region() {

    }

    function read_region(info) {
        console.log(JSON.parse(info));
    }

    function create_server() {
        regionInfo.regions.push({
            "Fqdn": "na.mm.among.us",
            "DefaultIp": "139.162.111.196",
            "Name": "North America",
            "TranslateName": 1003
        });
        regionInfo.regions = regionInfo.regions;
    }

    function delete_server(i) {
        regionInfo.regions.splice(i, 1);
        regionInfo.regions = regionInfo.regions;
    }
    
    file_select.onchange = () => {
        var file = file_select.files[0]; 
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            read_region(content);
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
    <span>After exporting the file, replace the regionInfo.json in AppData\LocalLow\Innersloth\Among Us with the one you downloaded.</span><br><br>
    <h4>Servers <button class="good" on:click={create_server}>+</button></h4><br>
    <div class="server-list">
        {#each regionInfo.regions as server, i (server)}
            <div animate:flip={{ duration: 250, easing: quadOut }}>
                <RegionServer bind:selected={regionInfo.selected} servers={regionInfo.regions} on:delete={() => delete_server(i)} {i}/>
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
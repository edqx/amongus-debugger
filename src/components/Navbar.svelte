<script>
    export let segment;
</script>

<div class="navbar">
    <a href="/" class="navbar-item" class:selected={segment === undefined}>
        Debugger
    </a>
    <a href="/tools" class="navbar-item" class:selected={segment === "tools"}>
        Tools
    </a>
    <a href="https://github.com/edqx/amongus-protocol" class="navbar-item">
        GitHub
    </a>
</div>

<style>
    .navbar {
        display: flex;
        padding-left: 10%;
        padding-right: 10%;
        background-color: #161515;
    }

    .navbar-item {
        padding: 14px;
    }

    .navbar-item.selected {
        background-color: #282626;
    }
</style>
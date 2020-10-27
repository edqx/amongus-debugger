<script>
    import Navbar from "../components/Navbar.svelte"

    export let segment;
</script>

{#if process.browser}
    <Navbar {segment}/>
    <div class="wrapper">
        <slot></slot>
    </div>
{/if}
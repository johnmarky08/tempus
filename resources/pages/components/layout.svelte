<script>
    import Navbar from "./header.svelte";
    import Footer from "./footer.svelte";

    export let isActive = "";
    export let isActiveSub = "";
</script>

<svelte:head>
    <title>{isActive} | T.E.M.P.U.S.</title>
</svelte:head>

<div
    class="bg-black min-h-screen bg-cover bg-center bg-fixed font-spaceGrotesk font-normal flex flex-col"
    style={`background-image: url("/images/backgrounds/dark_bg.png");`}
>
    <Navbar {isActive} {isActiveSub} />
    <main class="flex-1 min-h-screen px-20 py-14">
        <slot />
    </main>

    <Footer />
</div>

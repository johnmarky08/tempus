<script>
    import Navbar from "./header.svelte";
    import Footer from "./footer.svelte";

    export let isActive = "";
    export let isActiveSub = "";
</script>

<div
    class="bg-black min-h-screen bg-cover bg-center bg-fixed font-spaceGrotesk font-normal"
    style={`background-image: url("/images/backgrounds/dark_bg.png");`}
>
    <Navbar {isActive} {isActiveSub} />
    <main class="px-20 py-14">
        <slot />
    </main>

    <Footer />
</div>

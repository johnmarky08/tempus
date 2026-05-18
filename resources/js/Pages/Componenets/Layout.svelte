<script>
    import { dark } from "../../theme.js";
    import Navbar from "./Navbar.svelte";
    import Footer from "./Footer.svelte";
    import * as img from "../../imagedata.js";

    export let isActive = "";
</script>

<div
    class="bg-black min-h-screen bg-cover bg-center bg-fixed font-spaceGrotesk font-normal"
    style={`background-image: url(${img.dark_bg});`}
>
    <Navbar {isActive} />
    <main class="px-20 py-14">
        <slot />
    </main>

    <Footer />
</div>

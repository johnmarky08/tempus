<script>
    import { dark } from "../../theme.js";
    import Navbar from "./Navbar.svelte";
    import Footer from "./Footer.svelte";
    import * as img from "../../imagedata.js";
</script>

<div
    class="bg-black min-h-screen bg-cover bg-center bg-fixed font-comfortaa font-normal"
    style={`background-image: url(${img.dark_bg});`}
>
    <Navbar />
    <main class="p-20">
        <slot />
    </main>
    <Footer />
</div>

<script>
    import Navbar from "./header.svelte";
    import Footer from "./footer.svelte";
    import TempusFAQPanel from "./tempusFaqPanel.svelte";
    import { onMount, tick } from "svelte";

    export let isActive = "";
    export let isActiveSub = "";

    let x = 100;
    let y = 100;
    let targetX = 100;
    let targetY = 100;
    let viewportWidth = 0;
    let viewportHeight = 0;

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    let frame;
    let animTimer;
    let busy = false;
    let animationKey = 0;

    let currentAnim = "idle";

    let chatOpen = false;
    let hasDragged = false;
    let chatPanelHeight = 0;

    const ICON_SIZE = 48;
    const EDGE_MARGIN = 8;
    const CHAT_PANEL_HEIGHT = 480;
    const CHAT_SHIFT_THRESHOLD = CHAT_PANEL_HEIGHT - 64;

    const animationStyles = {
        shiver: "animation: shiver 0.6s ease-in-out forwards;",
        "stretch-up": "animation: stretch-up 1.2s ease-in-out forwards;",
        squish: "animation: squish 0.9s ease-in-out forwards;",
        nod: "animation: nod 1s ease-in-out forwards;",
        "roll-out-in": "animation: roll-out-in 2.4s ease-in-out forwards;",
        heartbeat: "animation: heartbeat 1.4s ease-in-out forwards;",
        "slam-down": "animation: slam-down 1.4s ease-in-out forwards;",
    };

    $: currentAnimStyle = animationStyles[currentAnim] ?? "";

    const randoms = [
        { name: "shiver", duration: 600 },
        { name: "stretch-up", duration: 1200 },
        { name: "squish", duration: 900 },
        { name: "nod", duration: 1000 },
        { name: "roll-out-in", duration: 2400 },
        { name: "heartbeat", duration: 1400 },
        { name: "slam-down", duration: 1400 },
    ];

    onMount(() => {
        updateViewport();
        const savedX = localStorage.getItem("rimuru-x");
        const savedY = localStorage.getItem("rimuru-y");

        if (savedX) x = targetX = Number(savedX);
        if (savedY) y = targetY = Number(savedY);

        clampTargetToViewport();
        forceChatAnchorIntoView(chatPanelHeight);

        window.addEventListener("resize", handleResize);
        animate();
        scheduleNext();

        return () => {
            cancelAnimationFrame(frame);
            clearTimeout(animTimer);
            window.removeEventListener("resize", handleResize);
        };
    });

    function startDrag(event) {
        dragging = true;
        hasDragged = false;
        offsetX = event.clientX - targetX;
        offsetY = event.clientY - targetY;
        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", stopDrag);
    }

    function drag(event) {
        if (!dragging) return;
        hasDragged = true;
        targetX = event.clientX - offsetX;
        targetY = event.clientY - offsetY;
        clampTargetToViewport();
        forceChatAnchorIntoView(chatPanelHeight);
        localStorage.setItem("rimuru-x", targetX);
        localStorage.setItem("rimuru-y", targetY);
    }

    function stopDrag() {
        dragging = false;
        window.removeEventListener("mousemove", drag);
        window.removeEventListener("mouseup", stopDrag);
    }

    function updateViewport() {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
    }

    function clampTargetToViewport() {
        const minX = EDGE_MARGIN;
        const minY = EDGE_MARGIN;
        const maxX = Math.max(
            EDGE_MARGIN,
            window.innerWidth - ICON_SIZE - EDGE_MARGIN,
        );
        const maxY = Math.max(
            EDGE_MARGIN,
            window.innerHeight - ICON_SIZE - EDGE_MARGIN,
        );
        if (targetX < minX) targetX = minX;
        if (targetY < minY) targetY = minY;
        if (targetX > maxX) targetX = maxX;
        if (targetY > maxY) targetY = maxY;
    }

    function forceChatAnchorIntoView(panelHeight = 0) {
        if (!chatOpen || viewportHeight <= 0) return;
        if (panelHeight > 0 && panelHeight < CHAT_SHIFT_THRESHOLD) return;

        const maxYForPanelBelow = Math.max(
            EDGE_MARGIN,
            viewportHeight -
                (panelHeight > 0 ? panelHeight : CHAT_PANEL_HEIGHT),
        );

        // When the panel would sit below the icon and clip the bottom edge,
        // move the icon up so the panel stays on-screen.
        if (targetY < CHAT_PANEL_HEIGHT && targetY > maxYForPanelBelow) {
            targetY = maxYForPanelBelow;
        }
    }

    function handleResize() {
        updateViewport();
        clampTargetToViewport();
        forceChatAnchorIntoView(chatPanelHeight);
        localStorage.setItem("rimuru-x", targetX);
        localStorage.setItem("rimuru-y", targetY);
    }

    function animate() {
        const ease = 0.12;
        x += (targetX - x) * ease;
        y += (targetY - y) * ease;
        frame = requestAnimationFrame(animate);
    }

    async function playAnimation(name) {
        if (busy) {
            scheduleNext();
            return;
        }
        busy = true;

        currentAnim = name;
        animationKey += 1;

        const r = randoms.find((r) => r.name === name);

        if (!r) {
            busy = false;
            scheduleNext();
            return;
        }

        animTimer = setTimeout(() => {
            currentAnim = "idle";
            animationKey += 1;
            busy = false;
            scheduleNext();
        }, r.duration + 100);
    }
    function triggerRandom() {
        if (dragging) {
            scheduleNext();
            return;
        }
        const r = randoms[Math.floor(Math.random() * randoms.length)];
        playAnimation(r.name);
    }

    function scheduleNext() {
        const delay = 5000 + Math.random() * 4000;
        animTimer = setTimeout(triggerRandom, delay);
    }

    function handleRimuruClick() {
        if (!hasDragged) chatOpen = !chatOpen;
        if (chatOpen) forceChatAnchorIntoView(chatPanelHeight);
        hasDragged = false;
    }

    $: if (chatOpen) {
        forceChatAnchorIntoView(chatPanelHeight);
    }
</script>

<div
    class="bg-black min-h-screen bg-cover bg-center bg-fixed font-spaceGrotesk font-normal"
    style={`background-image: url("/images/backgrounds/dark_bg.png");`}
>
    <Navbar {isActive} {isActiveSub} />

    <main class="px-20 py-14">
        <slot />

        <div
            role="button"
            tabindex="0"
            class="fixed z-50 select-none flex items-center justify-center group
         w-12 h-12 rounded-full border border-[#6FB8E7] overflow-hidden
         bg-[#061E29] hover:bg-[#0A2A3A] cursor-pointer
         hover:border-[#8FD3FF]"
            class:idle={!dragging}
            class:dragging
            class:animating={currentAnim !== "idle"}
            style="left: {x}px; top: {y}px;"
            on:mousedown={startDrag}
            on:mouseup={handleRimuruClick}
        >
            {#key animationKey}
                <img
                    alt="Rimuru Slime Icon"
                    class="jump w-full h-full"
                    style={currentAnimStyle}
                    src="/images/items/rimuru_chatbox_icon.png"
                    draggable="false"
                />
            {/key}
        </div>
        <TempusFAQPanel
            bind:open={chatOpen}
            bind:panelHeight={chatPanelHeight}
            anchorX={x}
            anchorY={y}
        />
    </main>

    <Footer />
</div>

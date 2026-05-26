<script>
    import { onDestroy } from "svelte";
    import { dark } from "../../js/theme.js";

    export let show = false;
    export let text = "Loading";
    export let subtitle = "Please wait while we prepare updated results.";
    export let fullscreen = true;
    export let compact = false;

    const randoms = [
        { name: "shiver", duration: 600 },
        { name: "stretch-up", duration: 1200 },
        { name: "squish", duration: 900 },
        { name: "nod", duration: 1000 },
        { name: "roll-out-in", duration: 2400 },
        { name: "heartbeat", duration: 1400 },
        { name: "slam-down", duration: 1400 },
    ];

    const animationStyles = {
        shiver: "animation: shiver 0.6s ease-in-out forwards;",
        "stretch-up": "animation: stretch-up 1.2s ease-in-out forwards;",
        squish: "animation: squish 0.9s ease-in-out forwards;",
        nod: "animation: nod 1s ease-in-out forwards;",
        "roll-out-in": "animation: roll-out-in 2.4s ease-in-out forwards;",
        heartbeat: "animation: heartbeat 1.4s ease-in-out forwards;",
        "slam-down": "animation: slam-down 1.4s ease-in-out forwards;",
    };

    let dots = "";
    let dotsTimer;
    let animTimer;
    let busy = false;
    let currentAnim = "idle";
    let animationKey = 0;

    $: currentAnimStyle = animationStyles[currentAnim] ?? "";

    $: if (show) {
        startLoader();
    } else {
        stopLoader();
    }

    function startLoader() {
        if (!dotsTimer) {
            dotsTimer = setInterval(() => {
                dots = dots.length >= 3 ? "" : dots + ".";
            }, 420);
        }

        if (!animTimer && !busy) {
            scheduleNext();
        }
    }

    function stopLoader() {
        clearInterval(dotsTimer);
        dotsTimer = null;

        clearTimeout(animTimer);
        animTimer = null;

        dots = "";
        busy = false;
        currentAnim = "idle";
    }

    function scheduleNext() {
        const delay = 450 + Math.random() * 900;
        animTimer = setTimeout(triggerRandom, delay);
    }

    function triggerRandom() {
        if (!show || busy) return;
        const r = randoms[Math.floor(Math.random() * randoms.length)];
        playAnimation(r.name);
    }

    function playAnimation(name) {
        if (!show || busy) return;

        const selected = randoms.find((item) => item.name === name);

        if (!selected) {
            scheduleNext();
            return;
        }

        busy = true;
        currentAnim = name;
        animationKey += 1;

        animTimer = setTimeout(() => {
            currentAnim = "idle";
            animationKey += 1;
            busy = false;

            if (show) {
                scheduleNext();
            }
        }, selected.duration + 100);
    }

    onDestroy(() => {
        stopLoader();
    });
</script>

{#if show}
    <div
        class={`loader-shell ${fullscreen ? "loader-fullscreen" : "loader-inline"}`}
    >
        <div
            class={`loader-card ${compact ? "loader-card-compact" : ""} ${$dark ? "loader-card-dark" : "loader-card-light"}`}
        >
            <div
                class={`loader-rimuru-wrap ${$dark ? "loader-rimuru-wrap-dark" : "loader-rimuru-wrap-light"}`}
            >
                {#key animationKey}
                    <img
                        alt="Rimuru loader icon"
                        class="loader-rimuru"
                        style={currentAnimStyle}
                        src="/images/items/rimuru_chatbox_icon.png"
                        draggable="false"
                    />
                {/key}
            </div>

            <p
                class={`loader-title ${$dark ? "loader-title-dark" : "loader-title-light"}`}
            >
                {text}{dots}
            </p>

            {#if subtitle}
                <p
                    class={`loader-subtitle ${$dark ? "loader-subtitle-dark" : "loader-subtitle-light"}`}
                >
                    {subtitle}
                </p>
            {/if}
        </div>
    </div>
{/if}

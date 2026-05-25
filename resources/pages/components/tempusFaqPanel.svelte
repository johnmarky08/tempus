<script>
    import { onMount, onDestroy, tick } from "svelte";
    import { fly } from "svelte/transition";
    import { faqData } from "../../js/tempusFAQ.js";

    export let open = false;
    export let anchorX = 100;
    export let anchorY = 100;
    export let panelHeight = 0;

    const PANEL_W = 360;
    const PANEL_H = 480;
    const ANCHOR_WIDTH = 48;
    const ANCHOR_HEIGHT = 48;
    const TOP_ANCHOR_SIZE = 0;
    const SIDE_GAP = 10;

    let viewportWidth = 0;
    let viewportHeight = 0;
    let panelEl;
    let heightObserver;
    let sizeTransitioning = false;

    const MIN_PANEL_HEIGHT = 54;

    function updateViewport() {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
    }

    function updatePanelHeight() {
        if (!panelEl || minimized || sizeTransitioning) return;
        panelHeight = panelEl.getBoundingClientRect().height;
    }

    $: effectivePanelHeight =
        panelHeight > 0 ? panelHeight : minimized ? MIN_PANEL_HEIGHT : PANEL_H;
    $: if (panelEl && heightObserver) {
        heightObserver.observe(panelEl);
        updatePanelHeight();
    }

    $: spaceAbove = Math.max(0, anchorY - SIDE_GAP);
    $: spaceBelow = Math.max(0, viewportHeight - anchorY - SIDE_GAP);
    $: useLeftSide =
        viewportWidth > 0 &&
        anchorX + ANCHOR_WIDTH + SIDE_GAP + PANEL_W > viewportWidth;
    $: panelLeft = useLeftSide
        ? Math.max(SIDE_GAP, anchorX - PANEL_W - SIDE_GAP)
        : anchorX + ANCHOR_WIDTH + SIDE_GAP;

    $: useTopSide =
        viewportHeight > 0 &&
        (spaceBelow >= PANEL_H || spaceBelow >= spaceAbove);
    $: panelBottom = viewportHeight - (anchorY + ANCHOR_HEIGHT);
    $: panelTop = useTopSide
        ? anchorY + TOP_ANCHOR_SIZE
        : anchorY - effectivePanelHeight + TOP_ANCHOR_SIZE;
    $: panelMaxHeight = Math.max(
        MIN_PANEL_HEIGHT,
        Math.min(PANEL_H, useTopSide ? spaceBelow : spaceAbove),
    );

    let minimized = false;
    function toggleMinimize() {
        sizeTransitioning = true;
        minimized = !minimized;
    }

    function onPanelTransitionEnd(event) {
        if (event.propertyName !== "max-height") return;
        sizeTransitioning = false;
        updatePanelHeight();
    }

    let messages = [];
    let messagesEl;
    let typingHandles = [];
    let isTyping = false;

    async function scrollBottom() {
        await tick();
        if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function addMessage(message) {
        messages = [...messages, message];
        return messages.length - 1;
    }

    async function typeMessage(role, text, speed = 14) {
        const index = addMessage({ role, text: "", typing: true });

        for (let i = 0; i <= text.length; i += 1) {
            messages = messages.map((message, messageIndex) =>
                messageIndex === index
                    ? {
                          ...message,
                          text: text.slice(0, i),
                          typing: i < text.length,
                      }
                    : message,
            );
            await tick();
            if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
            if (i < text.length) {
                await sleep(speed);
            }
        }
    }

    async function ask(question, answer) {
        if (isTyping) return;

        isTyping = true;
        try {
            await typeMessage("user", question, 10);
            await sleep(180);
            await typeMessage("assistant", answer, 12);
            await scrollBottom();
        } finally {
            isTyping = false;
        }
    }

    let welcomed = false;
    $: if (open && !welcomed) {
        welcomed = true;
        messages = [
            {
                role: "assistant",
                text: "Hey there! I'm Tempest, your FAQ assistant. Pick a topic below, then tap any question to get an answer.",
            },
        ];
    }

    const topicLabels = [
        "General",
        "Fuel Prices",
        "Heat Index",
        "Technical",
        "Disclaimer",
    ];
    let activeTopicIdx = 0;
    $: activeQuestions = faqData[activeTopicIdx]?.items ?? [];

    function makeCarousel(speed = 0.5) {
        let el = null;
        let scrollPos = 0;
        let raf;
        let isDragging = false;
        let dragStartX = 0;
        let dragStartScroll = 0;
        let userInteracting = false;
        let resumeTimer;

        function getHalf() {
            return el ? el.scrollWidth / 2 : 9999;
        }

        function step() {
            if (el && !userInteracting) {
                scrollPos += speed;
                const half = getHalf();
                if (scrollPos >= half) scrollPos -= half;
                el.style.transform = `translateX(-${scrollPos}px)`;
            }
            raf = requestAnimationFrame(step);
        }

        function start() {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(step);
        }
        function stop() {
            cancelAnimationFrame(raf);
        }

        function onMouseDown(e) {
            isDragging = true;
            userInteracting = true;
            dragStartX = e.clientX;
            dragStartScroll = scrollPos;
            clearTimeout(resumeTimer);
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        }

        function onMouseMove(e) {
            if (!isDragging) return;
            const delta = dragStartX - e.clientX;
            scrollPos = dragStartScroll + delta;
            const half = getHalf();
            if (scrollPos < 0) scrollPos += half;
            if (scrollPos >= half) scrollPos -= half;
            if (el) el.style.transform = `translateX(-${scrollPos}px)`;
        }

        function onMouseUp() {
            isDragging = false;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            resumeTimer = setTimeout(() => {
                userInteracting = false;
            }, 800);
        }

        function onWheel(e) {
            e.preventDefault();
            userInteracting = true;
            scrollPos += e.deltaX || e.deltaY * 0.5;
            const half = getHalf();
            if (scrollPos < 0) scrollPos += half;
            if (scrollPos >= half) scrollPos -= half;
            if (el) el.style.transform = `translateX(-${scrollPos}px)`;
            clearTimeout(resumeTimer);
            resumeTimer = setTimeout(() => {
                userInteracting = false;
            }, 800);
        }

        function reset() {
            scrollPos = 0;
            if (el) el.style.transform = `translateX(0px)`;
        }

        return {
            get el() {
                return el;
            },
            set el(v) {
                el = v;
            },
            start,
            stop,
            onMouseDown,
            onWheel,
            reset,
        };
    }

    const topicCarousel = makeCarousel(0.1);
    const questionCarousel = makeCarousel(0.2);

    let topicTrackEl;
    let questionTrackEl;
    $: topicCarousel.el = topicTrackEl;
    $: questionCarousel.el = questionTrackEl;

    let prevTopicIdx = 0;
    $: if (activeTopicIdx !== prevTopicIdx) {
        prevTopicIdx = activeTopicIdx;
        questionCarousel.reset();
    }

    $: topicItems = [...topicLabels, ...topicLabels, ...topicLabels];
    $: questionItems = [
        ...activeQuestions,
        ...activeQuestions,
        ...activeQuestions,
    ];

    onMount(() => {
        updateViewport();
        updatePanelHeight();
        heightObserver = new ResizeObserver(updatePanelHeight);
        if (panelEl) heightObserver.observe(panelEl);
        topicCarousel.start();
        questionCarousel.start();
        window.addEventListener("resize", updateViewport);
        return () => {
            topicCarousel.stop();
            questionCarousel.stop();
            heightObserver?.disconnect();
            window.removeEventListener("resize", updateViewport);
        };
    });

    $: if (open) {
        updatePanelHeight();
        scrollBottom();
    }

    onDestroy(() => {
        typingHandles.forEach((handle) => clearTimeout(handle));
        typingHandles = [];
    });

    function onKeydown(e) {
        if (e.key === "Escape") open = false;
    }
</script>

<svelte:window on:keydown={onKeydown} />

{#if open}
    <div
        bind:this={panelEl}
        transition:fly={{ y: useTopSide ? -12 : 12, duration: 300 }}
        on:transitionend={onPanelTransitionEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Chat with Tempest"
        class="font-jetbrainsMono fixed z-[9999] flex flex-col rounded-2xl overflow-hidden
           border border-white shadow-[0_0_20px_#6FB8E7] bg-[#061E29] text-white"
        style={`
            left: ${panelLeft}px;
            ${useTopSide ? `top: ${panelTop}px;` : `bottom: ${panelBottom}px;`}
            width: ${PANEL_W}px;
            max-width: calc(100vw - ${panelLeft}px - 12px);
            background: #061E29;
            max-height: ${minimized ? "54px" : panelMaxHeight + "px"};
            transition: max-height 0.2s cubic-bezier(0.2, 0, 0, 1);
        `}
    >
        <div
            class=" flex items-center justify-between px-4 py-3 shrink-0"
            style="background: #061E29; border-bottom: 1px solid #ffffff;"
        >
            <h2
                class="text-white font-bold text-lg tracking-tight leading-none select-none"
            >
                Chat with Tempest
            </h2>
            <div class="flex items-center gap-1.5">
                <!-- Minimize -->
                <button
                    type="button"
                    class="w-7 h-7 flex items-center justify-center rounded-md border border-[#1E3A4A]
                 text-[#6FB8E7] hover:bg-[#1A3040] hover:border-[#4A9AC0] transition-all duration-300"
                    on:click|stopPropagation={toggleMinimize}
                    aria-label={minimized ? "Expand" : "Minimize"}
                >
                    {#if minimized}
                        <svg
                            width="11"
                            height="11"
                            viewBox="0 0 11 11"
                            fill="none"
                        >
                            <path
                                d="M2 7l3.5-3.5L9 7"
                                stroke="currentColor"
                                stroke-width="1.6"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    {:else}
                        <svg
                            width="11"
                            height="11"
                            viewBox="0 0 11 11"
                            fill="none"
                        >
                            <path
                                d="M2 4l3.5 3.5L9 4"
                                stroke="currentColor"
                                stroke-width="1.6"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    {/if}
                </button>

                <!-- Close -->
                <button
                    type="button"
                    class="w-7 h-7 flex items-center justify-center rounded-md border border-[#1E3A4A]
                 text-[#6FB8E7] hover:bg-[#2A0D0D] hover:border-[#C06060] hover:text-[#FF8080]
                 transition-all duration-300"
                    on:click|stopPropagation={() => {
                        open = false;
                    }}
                    aria-label="Close"
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <line
                            x1="1"
                            y1="1"
                            x2="9"
                            y2="9"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                        />
                        <line
                            x1="9"
                            y1="1"
                            x2="1"
                            y2="9"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <div
            bind:this={messagesEl}
            class="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            style="min-height: 0; background: #061E29;"
        >
            {#each messages as msg}
                {#if msg.role === "user"}
                    <!-- User bubble — right, blue-purple -->
                    <div class="flex justify-end">
                        <div
                            class="max-w-[78%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-[12px] leading-snug"
                            style="background: #1E3F92; color: #ffffff; word-break: break-word;"
                        >
                            {msg.text}
                        </div>
                    </div>
                {:else}
                    <!-- Tempest bubble — left with avatar -->
                    <div class="flex items-start gap-3">
                        <div
                            class="shrink-0 w-8 h-8 rounded-full overflow-hidden border border-[#2A5070]"
                            style="background: transparent;"
                        >
                            <img
                                src="/images/items/rimuru_chatbox_icon.png"
                                alt="Tempest"
                                class="w-full h-full object-cover"
                                draggable="false"
                            />
                        </div>
                        <div
                            class="flex-1 text-[12px] leading-relaxed"
                            style="color: #ffffff; word-break: break-word; text-align: left;"
                        >
                            {msg.text}
                        </div>
                    </div>
                {/if}
            {/each}
        </div>

        <!-- ══ TOPIC CAROUSEL ══ -->
        <div
            class="shrink-0 py-2.5"
            style="border-top: 1px solid #ffffff; background: #0D1824;"
        >
            <p
                class="px-4 text-[9px] text-white uppercase tracking-[0.18em] font-bold mb-2 select-none"
            >
                Topics
            </p>
            <div
                class="overflow-hidden cursor-grab active:cursor-grabbing select-none"
                style="height: 35px; padding: 0 16px;"
                role="button"
                tabindex="0"
                on:mousedown={topicCarousel.onMouseDown}
                on:wheel|preventDefault={topicCarousel.onWheel}
                aria-label="Topic categories"
            >
                <div
                    bind:this={topicTrackEl}
                    class="flex gap-3 will-change-transform"
                    style="width: max-content;"
                >
                    {#each topicItems as label, i}
                        {@const realIdx = i % topicLabels.length}
                        <button
                            type="button"
                            class="inline-flex items-center px-3 py-0.5 rounded-full
                                  text-sm font-bold whitespace-nowrap shrink-0 border mt-1
                                  transition-all duration-300 ease-out
                                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                  {activeTopicIdx === realIdx
                                ? 'bg-[#2B63D9] border-[#8FD3FF] text-white'
                                : 'bg-[#1E3F92] border-[#6FB8E7] text-white hover:bg-[#2B63D9] hover:border-[#8FD3FF] hover:scale-110 '}"
                            disabled={isTyping}
                            on:click|stopPropagation={() => {
                                activeTopicIdx = realIdx;
                            }}
                        >
                            {label}
                        </button>
                    {/each}
                </div>
            </div>
        </div>

        <!-- ══ QUESTION CAROUSEL ══ -->
        <div
            class="shrink-0 py-2.5"
            style="border-top: 1px solid #182E3C; background: #08121A;"
        >
            <p
                class="px-4 text-[9px] text-white uppercase tracking-[0.18em] font-bold mb-2 select-none"
            >
                {faqData[activeTopicIdx]?.category ?? "Questions"}
            </p>
            <div
                class="overflow-hidden cursor-grab active:cursor-grabbing select-none"
                style="height: 70px; padding: 0 16px;"
                role="button"
                tabindex="0"
                on:mousedown={questionCarousel.onMouseDown}
                on:wheel|preventDefault={questionCarousel.onWheel}
                aria-label="Questions"
            >
                <div
                    bind:this={questionTrackEl}
                    class="flex gap-5 will-change-transform items-start"
                    style="width: max-content;"
                >
                    {#each questionItems as q}
                        <button
                            type="button"
                            class="mt-2 shrink-0 px-3 py-2 rounded-xl text-[10px]
                                border border-[#6FB8E7]
                              bg-[#1E3F92] text-white
                              hover:bg-[#2B63D9]
                              hover:border-[#8FD3FF]
                              hover:text-white
                              hover:scale-110
                                transition-all duration-300 ease-out
                                leading-snug
                              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            disabled={isTyping}
                            style="white-space: normal; width: 170px; text-align: left;"
                            on:click|stopPropagation={() =>
                                ask(q.question, q.answer)}
                        >
                            {q.question}
                        </button>
                    {/each}
                </div>
            </div>
        </div>
    </div>
{/if}

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import { withBase } from "vitepress";

const container = ref(null);
const isFullscreen = ref(false);
let graphInstance = null;
const zoomDuration = 400;

/**
 * Function to calculate available dimensions
 * {@link https://github.com/vuejs/vitepress/blob/8aa6ccbe32655f76c390d15568f69f83d079385d/src/node/markdown/markdown.ts#L16 688}
 */
const getDimensions = () => {
  if (isFullscreen.value) {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
  return {
    width: Math.min(688, container.value?.parentElement?.clientWidth || 688),
    height: 500 // Fixed height when in-line with text
  };
};

const handleResize = () => {
  if (graphInstance) {
    const { width, height } = getDimensions();
    graphInstance.width(width).height(height);
    graphInstance.zoomToFit(zoomDuration);
  }
};

const toggleFullscreen = async () => {
  isFullscreen.value = !isFullscreen.value;
  await nextTick();
  handleResize();
};

onMounted(async () => {
  const ForceGraph = (await import("force-graph")).default;

  try {
    const res = await fetch(withBase("/graph.json"));
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

    const data = await res.json();
    const { width, height } = getDimensions();

    graphInstance = ForceGraph()(container.value)
      .graphData(data)
      .width(width)
      .height(height)
      .nodeId("id")
      .nodeLabel("label")
      .nodeAutoColorBy("group")
      .linkDirectionalParticles(1)
      .cooldownTicks(40)
      .onNodeClick((node) => (window.location.href = withBase("/" + node.id)));

    graphInstance.onEngineStop(() => graphInstance.zoomToFit(600, 40));
    window.addEventListener("resize", handleResize);
  } catch (err) {
    console.error("Graph initialization failed:", err);
  }
});

onUnmounted(() => window.removeEventListener("resize", handleResize));
</script>

<template>
  <div :class="['graph-wrapper', { 'is-fullscreen': isFullscreen }]">
    <button
      :class="['fullscreen-btn', 'alt', { active: isFullscreen }]"
      @click="toggleFullscreen"
    >
      {{ isFullscreen ? "Exit" : "Full Screen" }}
    </button>
    <div ref="container" class="graph-container" />
  </div>
</template>

<style scoped>
.graph-wrapper {
  position: relative;
  margin: 20px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--vp-c-bg-soft);
  transition: all 0.3s ease;
}

/* Fullscreen Overlay Styles */
.graph-wrapper.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  margin: 0;
  border-radius: 0;
}

.fullscreen-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 110;

  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  font-size: 14px;

  /* border: 1px solid var(--vp-button-alt-border); */
  color: var(--vp-button-alt-text);
  background-color: var(--vp-button-alt-bg);
  cursor: pointer;

  transition: all 0.2s ease;

  &:hover {
    border-color: var(--vp-button-alt-hover-border);
    color: var(--vp-button-alt-hover-text);
    background-color: var(--vp-button-alt-hover-bg);
  }
}

.graph-wrapper.is-fullscreen .fullscreen-btn {
  border-color: var(--vp-button-alt-active-border);
  color: var(--vp-button-alt-active-text);
  background: var(--vp-button-alt-active-bg);
}
</style>

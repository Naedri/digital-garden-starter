<script setup>
import { onMounted, ref } from "vue";
import { withBase } from "vitepress";

const container = ref(null);

onMounted(async () => {
  const ForceGraph = (await import("force-graph")).default;
  try {
    const res = await fetch(withBase("/graph.json"));
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

    const data = await res.json();
    const graph = ForceGraph()(container.value)
      .graphData(data)
      .nodeId("id")
      .nodeLabel((node) => node.label)
      .nodeAutoColorBy("group")
      .linkDirectionalParticles(1);

    graph.onNodeClick((node) => {
      window.location.href = "/" + node.id;
    });
  } catch (err) {
    console.error("Graph initialization failed:", err);
  }
});
</script>

<template>
  <div ref="container" style="width: 100%; height: 700px" />
</template>

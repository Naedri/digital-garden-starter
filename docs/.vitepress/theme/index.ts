// https://vitepress.dev/guide/custom-theme
import { h, nextTick, watch } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import { createMermaidRenderer } from "vitepress-mermaid-renderer";

import "@catppuccin/vitepress/theme/frappe/green.css";

import Graph from "./components/Graph.vue";

export default {
  extends: DefaultTheme,
  Layout: () => {
    const { isDark } = useData();

    const initMermaid = () => {
      const mermaidRenderer = createMermaidRenderer({
        theme: isDark.value ? "dark" : "forest",
        gantt: {
          axisFormat: "fr-FR"
        }
      });
      mermaidRenderer.setToolbar({
        showLanguageLabel: false,
        desktop: {
          zoomLevel: "disabled"
        },
        mobile: {
          zoomLevel: "disabled",
          zoomIn: "disabled",
          zoomOut: "disabled",
          copyCode: "disabled",
          positions: { vertical: "bottom", horizontal: "right" }
        }
      });
    };

    // initial mermaid setup
    nextTick(() => initMermaid());

    // on theme change, re-render mermaid charts
    watch(
      () => isDark.value,
      () => {
        initMermaid();
      }
    );
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router, siteData }) {
    app.component("Graph", Graph);
  }
} satisfies Theme;

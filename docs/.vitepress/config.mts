import { defineConfig } from "vitepress";
import { withSidebar } from "vitepress-sidebar";

// https://vitepress.dev/reference/site-config
const vitePressOptions = {
  title: "My Awesome Project",
  description: "A VitePress Site",
  lang: "en",
  cleanUrls: true,
  base: "/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.svg",
    nav: [
      { text: "Home", link: "/" },
      { text: "Tags", link: "/generated/tags/index" },
      { text: "Graph", link: "/graph" },
      { text: "History", link: "/generated/history" }
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/Naedri/digital-garden-starter"
      }
    ],

    footer: {
      copyright: "ISC License"
    },

    search: {
      provider: "local",
      options: {
        miniSearch: {
          /**
           * @type {Pick<import('minisearch').Options, 'extractField' | 'tokenize' | 'processTerm'>}
           */
          options: {},
          /**
           * @type {import('minisearch').SearchOptions}
           */
          searchOptions: {}
        }
      }
    }
  },
  markdown: {
    theme: {
      light: "catppuccin-latte",
      dark: "catppuccin-frappe"
    },
    toc: { level: [1, 2] }
  },
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", href: "/logo.svg", type: "image/svg+xml" }],
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, viewport-fit=cover"
      }
    ]
  ]
};

// https://vitepress-sidebar.cdget.com/guide/options
const vitePressSidebarOptions = {
  // ============ [ RESOLVING PATHS ] ============
  documentRootPath: "/docs/",
  // ============ [ GROUPING ] ============
  collapsed: true,
  collapseDepth: 2,
  // ============ [ INCLUDE / EXCLUDE ] ============
  excludeByGlobPattern: ["generated/", "graph.md"],
  // ============ [ STYLING MENU TITLE ] ============
  capitalizeFirst: true,
  useFolderTitleFromIndexFile: true,
  useTitleFromFrontmatter: true
};

export default defineConfig(
  withSidebar(vitePressOptions, vitePressSidebarOptions)
);

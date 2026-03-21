import { defineConfig } from "vitepress";
import { withSidebar } from "vitepress-sidebar";

// https://vitepress.dev/reference/site-config
const vitePressOptions = {
  title: "Mon super projet",
  description: "Un site VitePress",
  lang: "fr",
  cleanUrls: true,
  base: "/",
  srcExclude: [
    //
    "_guidelines/**",
    "_templates/**",
    ".obsidian/**"
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.svg",
    nav: [
      { text: "Accueil", link: "/" },
      { text: "Tags", link: "/_generated/tags/index" },
      { text: "Graph", link: "/graph" },
      { text: "Historique", link: "/_generated/history" }
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/Naedri/digital-garden-starter"
      }
    ],

    footer: {
      copyright: "Licence ISC"
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
    toc: { level: [2, 3] },
    container: {
      tipLabel: "ASTUCE",
      warningLabel: "ATTENTION",
      dangerLabel: "DANGER",
      infoLabel: "INFO",
      detailsLabel: "Détails"
    }
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
  excludeByGlobPattern: [
    "_generated/",
    "_guidelines/",
    "_templates/",
    ".obsidian/",
    "graph.md"
  ],
  includeFolderIndexFile: false,
  // ============ [ STYLING MENU TITLE ] ============
  capitalizeFirst: true,
  useFolderTitleFromIndexFile: true,
  useTitleFromFrontmatter: true
};

export default defineConfig(
  withSidebar(vitePressOptions, vitePressSidebarOptions)
);

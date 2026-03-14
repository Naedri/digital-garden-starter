import { defineConfig } from "vitepress";

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
      { text: "Examples", link: "/markdown-examples" }
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" }
        ]
      }
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
    }
  },
  // lastUpdated: true,
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

export default defineConfig(vitePressOptions);

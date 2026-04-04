import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const currentYear = new Date().getFullYear()

export default withMermaid(defineConfig({
  title: "Reviewskits",
  description: "The Open-Source, Headless Testimonial API",

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ],

  appearance: 'dark', // Force dark mode to match the theme
  

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: false,

    nav: [
      { text: 'Guide', link: '/' },
      {
        text: 'SDKs', items: [
          { text: 'Vue SDK', link: '/sdk/vue' },
          { text: 'React SDK', link: '/sdk/react' }
        ]
      }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Get Started', link: '/guide/getting-started' },
          { text: 'Deployment', link: '/guide/deployment' },
        ]
      },
      {
        text: 'Core Concepts',
        items: [
          { text: 'Forms & Collection', link: '/guide/forms' },
          { text: 'Reviews & Moderation', link: '/guide/moderation' },
          { text: 'Webhooks & Events', link: '/guide/webhooks' },
          { text: 'API Keys & Security', link: '/guide/security' },
        ]
      },
      {
        text: 'Official SDKs',
        items: [
          { text: 'Vue.js / Nuxt', link: '/sdk/vue' },
          { text: 'React / Next.js', link: '/sdk/react' },
          { text: 'REST API Reference', link: '/sdk/rest' },
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'Authentication', link: '/guide/auth' },
          { text: 'Environment Variables', link: '/guide/env' },
          { text: 'Security', link: '/guide/security' },
          { text: 'License', link: '/guide/license' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/reviews-kits-team/reviews-kits' }
    ],

    footer: {
      message: 'Released under the AGPL-3.0 License.',
      copyright: `Copyright © ${currentYear}-present Reviewskits Team`
    }
  }
}))

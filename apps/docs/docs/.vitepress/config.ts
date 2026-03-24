import { defineConfig } from 'vitepress'

const currentYear = new Date().getFullYear()

export default defineConfig({
  title: "Reviewskits",
  description: "The Open-Source, Headless Testimonial API",
  
  themeConfig: {
    logo: '/logo.png', // Assuming we might add one
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'SDKs', items: [
        { text: 'Vue SDK', link: '/sdk/vue' },
        { text: 'React SDK', link: '/sdk/react' }
      ]}
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Reviewskits?', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Deployment', link: '/guide/deployment' },
          ]
        }
      ],
      '/sdk/': [
        {
          text: 'Official SDKs',
          items: [
            { text: 'Vue.js / Nuxt', link: '/sdk/vue' },
            { text: 'React / Next.js', link: '/sdk/react' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/reviews-kits-team/reviews-kits' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © ${currentYear}-present Reviewskits Team`
    }
  }
})

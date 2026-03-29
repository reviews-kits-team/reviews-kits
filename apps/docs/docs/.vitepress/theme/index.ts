import DefaultTheme from 'vitepress/theme'
import type { EnhanceAppContext } from 'vitepress'
import { h } from 'vue'
import GitHubStars from './components/GitHubStars.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-content-after': () => h(GitHubStars)
    })
  },
  enhanceApp({ app }: EnhanceAppContext) {
    // register global components if needed
  }
}

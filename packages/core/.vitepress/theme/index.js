import DefaultTheme from 'vitepress/theme'
import ImageCompare from './components/ImageCompare.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ImageCompare', ImageCompare)
  }
}

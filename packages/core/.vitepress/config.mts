import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Reading&Note",
  description: "Vivid Rendering",

  // Content is symlinked/referenced from ../content
  srcDir: '../content',

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Posts', link: '/posts/' }
    ],

    sidebar: [
      {
            text: 'Posts',
            items: [
                  {
                        text: 'Image Denoising',
                        link: '/posts/image-denoising/'
                  }
            ]
      }
],

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ]
  }
})

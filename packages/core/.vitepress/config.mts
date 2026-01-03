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
                        text: 'Advanced PostProcessing',
                        link: '/posts/advanced-postprocessing/'
                  },
                  {
                        text: 'Anti-Aliasing',
                        link: '/posts/anti-aliasing/'
                  },
                  {
                        text: 'Bindless',
                        link: '/posts/bindless/'
                  },
                  {
                        text: 'C++',
                        link: '/posts/c/'
                  },
                  {
                        text: 'ComputeShader',
                        link: '/posts/computeshader/'
                  },
                  {
                        text: 'Denoiser & Accumulation',
                        link: '/posts/denoiser-and-accumulation/'
                  },
                  {
                        text: 'DepthOfField',
                        link: '/posts/depthoffield/'
                  },
                  {
                        text: 'FavoritesBlog',
                        link: '/posts/favoritesblog/'
                  },
                  {
                        text: 'FidelityFX',
                        link: '/posts/fidelityfx/'
                  },
                  {
                        text: 'Fluid & Volumetric',
                        link: '/posts/fluid-and-volumetric/'
                  },
                  {
                        text: 'GlobalIllumination',
                        link: '/posts/globalillumination/'
                  },
                  {
                        text: 'GraphicsAPI',
                        link: '/posts/graphicsapi/'
                  },
                  {
                        text: 'Image Denoising',
                        link: '/posts/image-denoising/'
                  },
                  {
                        text: 'Lighting',
                        link: '/posts/lighting/'
                  },
                  {
                        text: 'LTC',
                        link: '/posts/ltc/'
                  },
                  {
                        text: 'Meshlet & MeshShader',
                        link: '/posts/meshlet-and-meshshader/'
                  },
                  {
                        text: 'Misc',
                        link: '/posts/misc/'
                  },
                  {
                        text: 'Performance',
                        link: '/posts/performance/'
                  },
                  {
                        text: 'PhysicallyBasedRendering',
                        link: '/posts/physicallybasedrendering/'
                  },
                  {
                        text: 'PostProcessingEffect',
                        link: '/posts/postprocessingeffect/'
                  },
                  {
                        text: 'RenderGraph',
                        link: '/posts/rendergraph/'
                  },
                  {
                        text: 'RTX',
                        link: '/posts/rtx/'
                  },
                  {
                        text: 'ScreenSpaceRaytracing',
                        link: '/posts/screenspaceraytracing/'
                  },
                  {
                        text: 'Shadow',
                        link: '/posts/shadow/'
                  },
                  {
                        text: 'SSAO',
                        link: '/posts/ssao/'
                  },
                  {
                        text: 'ToneMapping  &  ColorGrading',
                        link: '/posts/tonemapping--and--colorgrading/'
                  },
                  {
                        text: 'VRS',
                        link: '/posts/vrs/'
                  },
                  {
                        text: 'WorkGraphs',
                        link: '/posts/workgraphs/'
                  }
            ]
      }
],

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ]
  }
})

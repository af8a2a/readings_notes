import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Reading&Note",
  description: "Vivid Rendering",

  // Base path for GitHub Pages (repo name)
  base: '/readings_notes/',

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
                  },
                  {
                        text: 'Topics',
                        collapsed: false,
                        link: '/posts/Topic/',
                        items: [
                              {
                                    text: 'Advanced PostProcessing',
                                    link: '/posts/Topic/advanced-postprocessing/'
                              },
                              {
                                    text: 'Anti-Aliasing',
                                    link: '/posts/Topic/anti-aliasing/'
                              },
                              {
                                    text: 'Bindless',
                                    link: '/posts/Topic/bindless/'
                              },
                              {
                                    text: 'C++',
                                    link: '/posts/Topic/c/'
                              },
                              {
                                    text: 'ComputeShader',
                                    link: '/posts/Topic/computeshader/'
                              },
                              {
                                    text: 'Denoiser & Accumulation',
                                    link: '/posts/Topic/denoiser-and-accumulation/'
                              },
                              {
                                    text: 'DepthOfField',
                                    link: '/posts/Topic/depthoffield/'
                              },
                              {
                                    text: 'FavoritesBlog',
                                    link: '/posts/Topic/favoritesblog/'
                              },
                              {
                                    text: 'FidelityFX',
                                    link: '/posts/Topic/fidelityfx/'
                              },
                              {
                                    text: 'Fluid & Volumetric',
                                    link: '/posts/Topic/fluid-and-volumetric/'
                              },
                              {
                                    text: 'GlobalIllumination',
                                    link: '/posts/Topic/globalillumination/'
                              },
                              {
                                    text: 'Graphics Asset',
                                    link: '/posts/Topic/graphics-asset/'
                              },
                              {
                                    text: 'GraphicsAPI',
                                    link: '/posts/Topic/graphicsapi/'
                              },
                              {
                                    text: 'Lighting',
                                    link: '/posts/Topic/lighting/'
                              },
                              {
                                    text: 'LTC',
                                    link: '/posts/Topic/ltc/'
                              },
                              {
                                    text: 'Meshlet & MeshShader',
                                    link: '/posts/Topic/meshlet-and-meshshader/'
                              },
                              {
                                    text: 'Misc',
                                    link: '/posts/Topic/misc/'
                              },
                              {
                                    text: 'Performance',
                                    link: '/posts/Topic/performance/'
                              },
                              {
                                    text: 'PhysicallyBasedRendering',
                                    link: '/posts/Topic/physicallybasedrendering/'
                              },
                              {
                                    text: 'PostProcessingEffect',
                                    link: '/posts/Topic/postprocessingeffect/'
                              },
                              {
                                    text: 'RenderGraph',
                                    link: '/posts/Topic/rendergraph/'
                              },
                              {
                                    text: 'RTX',
                                    link: '/posts/Topic/rtx/'
                              },
                              {
                                    text: 'ScreenSpaceRaytracing',
                                    link: '/posts/Topic/screenspaceraytracing/'
                              },
                              {
                                    text: 'Shadow',
                                    link: '/posts/Topic/shadow/'
                              },
                              {
                                    text: 'SSAO',
                                    link: '/posts/Topic/ssao/'
                              },
                              {
                                    text: 'ToneMapping  &  ColorGrading',
                                    link: '/posts/Topic/tonemapping--and--colorgrading/'
                              },
                              {
                                    text: 'VRS',
                                    link: '/posts/Topic/vrs/'
                              },
                              {
                                    text: 'WorkGraphs',
                                    link: '/posts/Topic/workgraphs/'
                              }
                        ]
                  }
            ]
      }
],

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ]
  }
})

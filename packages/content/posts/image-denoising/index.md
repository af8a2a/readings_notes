# Image Denoising

Image denoising removes noise from images while preserving important details.

## Comparison

<ImageCompare
  before="./noisy.png"
  after="./denoised.png"
  beforeLabel="Noisy"
  afterLabel="Denoised"
/>

## Methods

Common denoising approaches:

- **Gaussian Filter** - Simple blur, loses detail
- **Bilateral Filter** - Edge-preserving smoothing
- **Non-Local Means** - Patch-based averaging
- **Deep Learning** - CNN/Transformer based methods

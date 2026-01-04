<script setup>
import { ref, computed } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps({
  before: { type: String, required: true },
  after: { type: String, required: true },
  beforeLabel: { type: String, default: 'Before' },
  afterLabel: { type: String, default: 'After' }
})

const position = ref(50)
const isDragging = ref(false)
const container = ref(null)

const clipPath = computed(() => `inset(0 ${100 - position.value}% 0 0)`)

// Resolve paths with base URL
const beforeSrc = computed(() => withBase(props.before))
const afterSrc = computed(() => withBase(props.after))

function updatePosition(e) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
  position.value = Math.max(0, Math.min(100, (x / rect.width) * 100))
}

function startDrag(e) {
  isDragging.value = true
  updatePosition(e)
}

function onDrag(e) {
  if (isDragging.value) updatePosition(e)
}

function stopDrag() {
  isDragging.value = false
}
</script>

<template>
  <div
    ref="container"
    class="image-compare"
    @mousedown="startDrag"
    @mousemove="onDrag"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
    @touchstart="startDrag"
    @touchmove="onDrag"
    @touchend="stopDrag"
  >
    <!-- After image (bottom layer) -->
    <img class="compare-image" :src="afterSrc" :alt="afterLabel" />

    <!-- Before image (top layer, clipped) -->
    <img
      class="compare-image before-image"
      :src="beforeSrc"
      :alt="beforeLabel"
      :style="{ clipPath }"
    />

    <!-- Labels -->
    <span class="label before-label" v-show="position > 10">{{ beforeLabel }}</span>
    <span class="label after-label" v-show="position < 90">{{ afterLabel }}</span>

    <!-- Slider -->
    <div class="slider" :style="{ left: position + '%' }">
      <div class="slider-line"></div>
      <div class="slider-handle">
        <span>&lt;&gt;</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-compare {
  position: relative;
  width: 100%;
  overflow: hidden;
  cursor: ew-resize;
  user-select: none;
  border-radius: 8px;
  line-height: 0;
}

.compare-image {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

.before-image {
  position: absolute;
  top: 0;
  left: 0;
}

.label {
  position: absolute;
  bottom: 12px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 13px;
  font-family: sans-serif;
  border-radius: 4px;
  line-height: 1.4;
}

.before-label {
  left: 12px;
}

.after-label {
  right: 12px;
}

.slider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slider-line {
  flex: 1;
  width: 3px;
  background: white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

.slider-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  font-family: monospace;
  color: #333;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const stars = ref<number | null>(null)
const repo = 'reviews-kits-team/reviews-kits'

onMounted(async () => {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`)
    const data = await response.json()
    if (data.stargazers_count !== undefined) {
      stars.value = data.stargazers_count
    }
  } catch (error) {
    console.error('Failed to fetch GitHub stars:', error)
  }
})

const formatStars = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num
}
</script>

<template>
  <a
    v-if="stars !== null"
    :href="`https://github.com/${repo}`"
    target="_blank"
    rel="noopener"
    class="github-stars"
  >
    <span class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
    </span>
    <span class="count">{{ formatStars(stars) }}</span>
  </a>
</template>

<style scoped>
.github-stars {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  margin-left: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.github-stars:hover {
  background-color: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.icon {
  display: flex;
  align-items: center;
}

.icon svg {
  width: 14px;
  height: 14px;
}

@media (max-width: 768px) {
  .github-stars {
    display: none;
  }
}
</style>

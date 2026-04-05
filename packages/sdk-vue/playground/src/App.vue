<script setup lang="ts">
import { computed } from 'vue'
import { useReviews } from '@reviewskits/vue'

const { data: _data, isLoading, error } = useReviews({ formId: 'rk_frm_live_4352ebf7c8008a48c5d70ae4' })
const data = computed(() => _data.value)
</script>

<template>
  <div class="playground">
    <h1>ReviewsKit SDK Playground</h1>
    
    <div v-if="isLoading">Chargement des avis...</div>
    <div v-else-if="error">Erreur: {{ error }}</div>
    <div v-else-if="data">
      <h2>Avis ({{ data.reviews.length }})</h2>
      <ul>
        <li v-for="review in data.reviews" :key="review.id">
          <strong>{{ review.author.name }}</strong>: {{ review.content }}
        </li>
      </ul>
    </div>
    <div v-else>Aucun avis trouvé.</div>
  </div>
</template>

<style scoped>
.playground {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
</style>

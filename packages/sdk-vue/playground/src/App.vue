<script setup lang="ts">
import { useReviews } from '@reviewskits/vue'

const { data, isLoading, error } = useReviews()
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

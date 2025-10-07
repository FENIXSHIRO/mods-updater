<script setup lang="ts">
defineProps<{
  status: 'loading' | 'needUpdate' | 'updated'
}>()
</script>

<template>
  <div class="spinner">
    <div v-if="status === 'loading'" class="spinner-circle"></div>
    <div v-else-if="status === 'needUpdate'" class="arrow-down">↓</div>
    <div v-else-if="status === 'updated'" class="checkmark">✔</div>
  </div>
</template>

<style scoped>
.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.spinner-circle {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-circle.update {
  border-top-color: #f39c12;
}

.arrow-down {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #f39c12;
}

.checkmark {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #27ae60;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<script setup lang="ts">
  import type { Status } from '@src/types/Status.ts';

  defineProps<{
    status: Status;
  }>();

  const statusesWithGif = ['loading', 'updated'];
</script>

<template>
  <div class="status-container">
    <div class="spinner" :class="{ gif: statusesWithGif.includes(status) }">
      <div v-if="status === 'none'" class="icon spinner-idle"></div>
      <div v-if="status === 'loading'" class="icon spinner-circle"></div>
      <div v-else-if="status === 'needUpdate'" class="icon need-update"></div>
      <div v-else-if="status === 'updated'" class="icon updated"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .status-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 15px;
  }

  .gif {
    background-image: url(../assets/img/l.gif);
  }

  .spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    background-size: cover;
    background-position: center;
    border-radius: 100%;
  }

  .icon {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid #555555;
    padding: 2px;
  }

  .spinner-idle {
    border-top: 4px solid #aaaaaa;
    border-right: 4px solid #aaaaaa;
    padding: 10px;
    animation: spin 10s linear infinite;
  }

  .spinner-circle {
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    &.update {
      border-top-color: #f39c12;
    }
  }

  .need-update {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    padding: 10px;
    border: 4px solid #f39c12;
  }

  .updated {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    border: 4px solid #27ae60;
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

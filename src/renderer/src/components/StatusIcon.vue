<script setup lang="ts">
  import type { Status } from '@src/types/Status.ts';

  defineProps<{
    status: Status;
  }>();
</script>

<template>
  <div class="spinner">
    <div v-if="status === 'none'" class="icon spinner-idle"></div>
    <div v-if="status === 'loading'" class="icon spinner-circle"></div>
    <div v-else-if="status === 'needUpdate'" class="icon need-update">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <path
            d="M14 9V3L11 4H8L5 3V9L9.5 11L14 9ZM14 9L20 12L22 18L20 21H4L2 19L4 17L2 15L4 13M7 21V9.88889M11 15V21L16.0435 16H18M8 7L8.00707 7.00707M11 7L11.0071 7.00707"
            stroke-width="1.44"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </g>
      </svg>
    </div>

    <div v-else-if="status === 'updated'" class="icon updated">
      <svg width="160px" height="160px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <path
            d="M8 12.3333L10.4615 15L16 9M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke-width="1.44"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin-top: 40px;
    margin-bottom: 50px;
  }

  .icon {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid #555555;
    background-color: rgba(100, 100, 100, 0.5);
  }

  .spinner-idle {
    border-top: 4px solid #aaaaaa;
    border-right: 4px solid #aaaaaa;
    padding: 10px;
    animation: spin 10s linear infinite;

    &.update {
      border-top-color: #f39c12;
    }
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
    color: #f39c12;
    stroke: #f39c12;
  }

  .updated {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    color: #27ae60;
    stroke: #27ae60;
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

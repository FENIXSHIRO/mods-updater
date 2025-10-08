<script lang="ts" setup>
  import { ServerStatus } from '@src/types/Status';
  import { onMounted, computed } from 'vue';

  interface Props {
    status: ServerStatus;
  }

  const props = defineProps<Props>();

  const iconColor = computed(() => {
    return {
      online: 'green',
      offline: 'red',
      pending: 'yellow',
    }[props.status];
  });

  const statusLabel = computed(() => {
    return {
      online: 'Сервер онлайн',
      offline: 'Сервер недоступен',
      pending: 'Получение информации о сервере',
    }[props.status];
  });

  onMounted(() => {});
</script>

<template>
  <div class="server-status">
    <div class="server-status-icon" :style="{ backgroundColor: iconColor }" />
    <div class="server-status-label">{{ statusLabel }}</div>
  </div>
</template>

<style lang="scss">
  .server-status {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 5px;
    width: 99vw;
    background-color: rgba($color: #aaaaaa, $alpha: 0.1);
    border-radius: 5px;
    padding: 2px 5px 2px 5px;

    &-icon {
      width: 10px;
      height: 10px;
      border-radius: 15px;
    }

    &-label {
      font-size: 12px;
      color: '#111111';
    }
  }
</style>

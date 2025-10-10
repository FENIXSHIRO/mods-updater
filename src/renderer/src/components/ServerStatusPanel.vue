<script lang="ts" setup>
  import { ServerStatus } from '@src/types/Status';
  import { onMounted, computed } from 'vue';

  interface Props {
    serverStatus: ServerStatus;
  }

  const props = defineProps<Props>();

  const iconColor = computed(() => {
    return {
      online: 'green',
      offline: 'red',
      pending: 'yellow',
    }[props.serverStatus.status];
  });

  const statusLabel = computed(() => {
    return {
      online: 'Сервер онлайн',
      offline: 'Сервер недоступен',
      pending: 'Получение информации о сервере',
    }[props.serverStatus.status];
  });

  const clearAddress = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const cleanPath = urlObj.pathname.replace(/\/$/, '');
      return `${urlObj.hostname}${cleanPath}${urlObj.search}${urlObj.hash}`;
    } catch {
      return url;
    }
  };

  onMounted(() => {});
</script>

<template>
  <div class="server-status">
    <div class="server-status-info">
      <div class="server-status-info-icon" :style="{ borderColor: iconColor }" />
      <div class="server-status-info-label">{{ statusLabel }}</div>
    </div>

    <div class="server-status-address">
      {{ clearAddress(serverStatus.address) }}
    </div>
  </div>
</template>

<style lang="scss">
  .server-status {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 5px;
    width: 99vw;
    background-color: rgba($color: #aaaaaa, $alpha: 0.1);
    border-radius: 5px;
    padding: 2px 5px 2px 5px;

    &-info {
      display: flex;
      align-items: center;
      gap: 5px;

      &-icon {
        width: 10px;
        height: 10px;
        border-radius: 15px;
        border: 1px solid transparent;
      }

      &-label {
        font-size: 12px;
        color: '#111111';
      }
    }

    &-address {
      font-size: 10px;
      color: #aaa;
    }
  }
</style>

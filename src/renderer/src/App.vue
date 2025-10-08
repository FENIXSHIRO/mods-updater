<script setup lang="ts">
  import StatusIcon from './components/StatusIcon.vue';
  import ServerStatusPanel from './components/ServerStatusPanel.vue';
  import { onMounted, ref } from 'vue';

  import type { Status, ServerStatus } from '@src/types/Status.ts';

  const path = ref<string>();

  const serverStatus = ref<ServerStatus>('pending');
  const status = ref<Status>('updated');

  const selectFolder = async (): Promise<void> => {
    const selectedPath = await window.api.selectFolder();
    if (selectedPath) {
      path.value = selectedPath;
    }
  };

  const getManifest = async (): Promise<void> => {
    if (!path.value) return;

    status.value = 'loading';

    const result = await window.api.downloadManifest(path.value);
    if (result.success) {
      status.value = 'updated';
    } else {
      alert(result.error || 'Ошибка скачивания');
      status.value = 'needUpdate';
    }
  };

  const syncFiles = async (): Promise<void> => {
    if (!path.value) return;
    status.value = 'loading';

    const result = await window.api.syncFiles(path.value);

    if (result.success) {
      alert(result.deleted);
      status.value = 'updated';
    } else {
      alert(result.error || 'Ошибка скачивания');
      status.value = 'needUpdate';
    }
  };

  onMounted(async () => {
    serverStatus.value = (await window.api.checkServerAvailability()).success ? 'online' : 'offline';
  });
</script>

<template>
  <div class="">
    <ServerStatusPanel :status="serverStatus" />

    <StatusIcon :status="status" />

    <div class="">
      <button type="button" @click="selectFolder">Указать папку</button>

      <div class="">
        {{ path }}
      </div>
    </div>

    <div class="">
      <button type="button" :disabled="!path" @click="getManifest()">Создать манифест файл</button>
      <button type="button" :disabled="!path" @click="syncFiles()">Обновить файлы</button>
    </div>
  </div>
</template>

<style></style>

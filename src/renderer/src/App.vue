<script setup lang="ts">
  import StatusIcon from './components/StatusIcon.vue';
  import { ref } from 'vue';

  import type { Status } from '@src/types/Status.ts'

  const path = ref<string>();

  const status = ref<Status>('updated');

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

  const selectFolder = async (): Promise<void> => {
    const selectedPath = await window.api.selectFolder();
    if (selectedPath) {
      path.value = selectedPath;
    }
  };
</script>

<template>
  <div class="">
    <StatusIcon :status="status" />

    <div class="">
      <button type="button" @click="selectFolder">Указать папку</button>
    </div>

    <div class="">
      {{ path }}
      <button type="button" :disabled="!path" @click="getManifest()">Создать манифест файл</button>
    </div>
  </div>
</template>

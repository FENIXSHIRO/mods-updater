<script setup lang="ts">
import StatusIcon from './components/StatusIcon.vue'
import { ref } from 'vue'

const path = ref<string>()

const getManifest = async (path: string): Promise<void> => {
  const result = await window.api.downloadManifest(path)
  if (result.success) {
    alert(`Манифест сохранён: ${result.filePath}`)
  } else {
    alert(result.error || 'Ошибка скачивания')
  }
}

const selectFolder = async (): Promise<void> => {
  const selectedPath = await window.api.selectFolder()
  if (selectedPath) {
    path.value = selectedPath
    getManifest(selectedPath)
  }
}
</script>

<template>
  <div class="">
    <StatusIcon status="loading" />

    <div class="">
      <button type="button" @click="selectFolder">Указать папку</button>
    </div>

    <div class="">
      {{ path }}
    </div>
  </div>
</template>

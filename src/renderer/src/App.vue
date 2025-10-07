<script setup lang="ts">
import StatusIcon from './components/StatusIcon.vue'
import { ref } from 'vue'

const path = ref<string>()

const selectFolder = async (): Promise<void> => {
  const selectedPath = await window.electronAPI.selectFolder()
  if (selectedPath) path.value = selectedPath
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

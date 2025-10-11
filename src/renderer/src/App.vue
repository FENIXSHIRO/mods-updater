<script setup lang="ts">
  import StatusIcon from './components/StatusIcon.vue';
  import ServerStatusPanel from './components/ServerStatusPanel.vue';
  import OptionsButton from './components/OptionsButton.vue';
  import StateDrawer from './components/StateDrawer.vue';

  import { onMounted, ref } from 'vue';

  import type { Status, ServerStatus } from '@src/types/Status';
  import type { Config } from '@src/types/Config';

  const serverStatus = ref<ServerStatus>({
    status: 'pending',
    address: '...',
  });
  const status = ref<Status>('none');
  const config = ref<Config>();
  const path = ref<string>();

  const updated = ref<{
    downloaded: string[];
    deleted: string[];
  }>({
    downloaded: [],
    deleted: [],
  });

  const forUpdate = ref<{
    toDownload: string[];
    toDelete: string[];
  }>({
    toDownload: [],
    toDelete: [],
  });

  const compareWithServer = async (dir: string): Promise<{ toDownload: string[]; toDelete: string[] }> => {
    const checkResult = await window.api.compareFiles(dir);
    if ('success' in checkResult) {
      if (checkResult.toDownload.length + checkResult.toDelete.length > 0) {
        status.value = 'needUpdate';
        return { toDownload: checkResult.toDownload, toDelete: checkResult.toDelete };
      }
      status.value = 'updated';
    } else {
      alert(checkResult.error);
      status.value = 'error';
    }
    return { toDownload: [], toDelete: [] };
  };

  const selectFolder = async (): Promise<void> => {
    const selectedPath = await window.api.selectGameDir();
    if (selectedPath) {
      path.value = selectedPath;
      forUpdate.value = await compareWithServer(selectedPath);
      await getConfig();
    }
  };

  const getManifest = async (): Promise<void> => {
    if (!path.value) return;

    status.value = 'loading';

    const result = await window.api.downloadManifest(path.value);
    if ('success' in result && result.success) {
      status.value = 'updated';
    } else {
      alert('error' in result ? result.error : 'Ошибка скачивания');
      status.value = 'needUpdate';
    }
  };

  const syncFiles = async (): Promise<void> => {
    if (!path.value) return;
    status.value = 'loading';

    const result = await window.api.syncFiles(path.value);

    if ('success' in result && result.success) {
      updated.value = result;
      status.value = 'updated';
    } else {
      alert('error' in result ? result.error : 'Ошибка скачивания');
      status.value = 'needUpdate';
    }
  };

  const getServerStatus = async (): Promise<void> => {
    const result = await window.api.checkServerAvailability();
    serverStatus.value = {
      status: result.success ? 'online' : 'offline',
      address: result.address,
    };
  };

  const getConfig = async (): Promise<void> => {
    const resultConfig = await window.api.getConfig();
    console.log(config);
    config.value = resultConfig;
    path.value = resultConfig.MODS_DIR;
  };

  const init = async (): Promise<void> => {
    if (config.value?.MODS_DIR) {
      const result = await compareWithServer(config.value.MODS_DIR);
      forUpdate.value.toDownload = result.toDownload;
      forUpdate.value.toDelete = result.toDelete;
      console.log(forUpdate.value);
    }
  };

  onMounted(async () => {
    await getConfig();
    await getServerStatus();
    await init();
  });
</script>

<template>
  <ServerStatusPanel :server-status="serverStatus" />

  <StatusIcon :status="status" />

  <div class="options-bar">
    <OptionsButton label="Папка с модами" :highlight="!config?.MODS_DIR" @click="selectFolder">
      <template #icon>
        <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M3 8.2C3 7.07989 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.51984 5 5.0799 5 6.2 5H9.67452C10.1637 5 10.4083 5 10.6385 5.05526C10.8425 5.10425 11.0376 5.18506 11.2166 5.29472C11.4184 5.4184 11.5914 5.59135 11.9373 5.93726L12.0627 6.06274C12.4086 6.40865 12.5816 6.5816 12.7834 6.70528C12.9624 6.81494 13.1575 6.89575 13.3615 6.94474C13.5917 7 13.8363 7 14.3255 7H17.8C18.9201 7 19.4802 7 19.908 7.21799C20.2843 7.40973 20.5903 7.71569 20.782 8.09202C21 8.51984 21 9.0799 21 10.2V15.8C21 16.9201 21 17.4802 20.782 17.908C20.5903 18.2843 20.2843 18.5903 19.908 18.782C19.4802 19 18.9201 19 17.8 19H6.2C5.07989 19 4.51984 19 4.09202 18.782C3.71569 18.5903 3.40973 18.2843 3.21799 17.908C3 17.4802 3 16.9201 3 15.8V8.2Z"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </g>
        </svg>
      </template>
    </OptionsButton>

    <OptionsButton :disabled="!config?.MODS_DIR" label="Проверить файлы" @click="compareWithServer(config!.MODS_DIR)">
      <template #icon>
        <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M19.9381 13C19.979 12.6724 20 12.3387 20 12C20 7.58172 16.4183 4 12 4C9.49942 4 7.26681 5.14727 5.7998 6.94416M4.06189 11C4.02104 11.3276 4 11.6613 4 12C4 16.4183 7.58172 20 12 20C14.3894 20 16.5341 18.9525 18 17.2916M15 17H18V17.2916M5.7998 4V6.94416M5.7998 6.94416V6.99993L8.7998 7M18 20V17.2916"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </g>
        </svg>
      </template>
    </OptionsButton>

    <OptionsButton v-if="config?.MAINTENANCE" label="Создать manifest.json" :disabled="!path" @click="getManifest()">
      <template #icon>
        <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M10 17L8 15L10 13M14 13L16 15L14 17M13 3H8.2C7.0799 3 6.51984 3 6.09202 3.21799C5.71569 3.40973 5.40973 3.71569 5.21799 4.09202C5 4.51984 5 5.0799 5 6.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.0799 21 8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V9M13 3L19 9M13 3V8C13 8.55228 13.4477 9 14 9H19"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </g>
        </svg>
      </template>
    </OptionsButton>
  </div>

  <div class="">
    <button type="button" :disabled="status !== 'needUpdate'" @click="syncFiles()">Обновить файлы</button>
  </div>

  <StateDrawer :status="status" :for-update="forUpdate" :updated="updated" />

  <div class="path">
    {{ path }}
  </div>
</template>

<style lang="scss">
  #app {
    padding: 0px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .options-bar {
    position: absolute;
    top: 35px;
    right: 5px;
    display: flex;
    flex-direction: column;
    row-gap: 5px;
  }

  .path {
    position: absolute;
    bottom: 5px;
    font-size: 12px;
    color: rgba($color: #aaaaaa, $alpha: 0.5);
  }
</style>

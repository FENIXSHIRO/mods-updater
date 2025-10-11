<!-- eslint-disable vue/no-unused-properties -->
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script lang="ts" setup>
  interface Props {
    status?: string;
    forUpdate: {
      toDownload: string[];
      toDelete: string[];
    };
    updated: {
      downloaded: string[];
      deleted: string[];
    };
  }
  const props = defineProps<Props>();
</script>

<template>
  <div class="drawer">
    <div v-if="forUpdate.toDownload.length || forUpdate.toDelete.length" class="update-list">
      <div class="update-list-item-container">
        <div v-for="downloadItem in forUpdate.toDownload" :key="downloadItem" class="update-list-item">
          <span class="item-new">+</span>
          {{ downloadItem }}
        </div>
      </div>

      <div class="update-list-item-container">
        <div v-for="deleteItem in forUpdate.toDelete" :key="deleteItem" class="update-list-item">
          <span class="item-remove">-</span>
          {{ deleteItem }}
        </div>
      </div>
    </div>

    <div v-if="updated.downloaded.length || updated.deleted.length" class="">
      <div class="">{{ updated.downloaded.length }}</div>
      <div class="">{{ updated.deleted.length }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .drawer {
    padding: 10px;
  }

  .update-list {
    overflow-y: scroll;
    overflow-x: hidden;
    max-height: 50px;
    width: 100%;

    &-item-container {
      padding: 5px;
    }
    &-item {
      font-size: 12px;
      text-overflow: ellipsis;
    }
  }

  .item-new {
    color: green;
  }

  .item-remove {
    color: red;
  }
</style>

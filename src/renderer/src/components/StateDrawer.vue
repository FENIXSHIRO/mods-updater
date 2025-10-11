<script lang="ts" setup>
  import type { Status } from '@src/types/Status.ts';

  interface Props {
    status?: Status;
    forUpdate: {
      toDownload: string[];
      toDelete: string[];
    };
    updated: {
      downloaded: string[];
      deleted: string[];
    };
  }
  defineProps<Props>();
</script>

<template>
  <div class="drawer">
    <div v-if="status !== 'updated' && (forUpdate.toDownload.length || forUpdate.toDelete.length)" class="update-list">
      <div class="update-list-item-container">
        <div v-if="forUpdate.toDownload.length" class="update-list-header">
          К загрузке <span class="update-list-header-count">({{ forUpdate.toDownload.length }}):</span>
        </div>
        <div v-for="downloadItem in forUpdate.toDownload" :key="downloadItem" class="update-list-item">
          <span class="item-new">+</span>
          {{ downloadItem }}
        </div>
      </div>

      <div class="update-list-item-container">
        <div v-if="forUpdate.toDelete.length" class="update-list-header">
          К Удалению <span class="update-list-header-count">({{ forUpdate.toDelete.length }}):</span>
        </div>
        <div v-for="deleteItem in forUpdate.toDelete" :key="deleteItem" class="update-list-item">
          <span class="item-remove">-</span>
          {{ deleteItem }}
        </div>
      </div>
    </div>

    <div v-else-if="updated.downloaded.length || updated.deleted.length" class="updated">
      <div class="">
        <span>Скачано:</span>
        {{ updated.downloaded.length }}
      </div>
      <div class="">
        <span>Удалено:</span>
        {{ updated.deleted.length }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .drawer {
    padding: 10px;
  }

  .updated {
    display: flex;
    padding: 0px 10px;
    gap: 10px;
    font-size: 12px;
    color: #666;
  }

  .update-list {
    overflow-y: scroll;
    overflow-x: hidden;
    max-height: 35vh;
    width: 100vw;
    padding: 0px 10px;
    color: #ddd;

    &::-webkit-scrollbar {
      width: 4px;
      &-track {
        background: rgba($color: #555, $alpha: 0.2);
        border-radius: 6px;
      }
      &-thumb {
        background: #888;
        border-radius: 6px;

        &:hover {
          background: #666;
        }
      }
    }

    &-item-container {
      padding: 5px;
    }

    &-header {
      font-size: 14px;
      font-weight: 600;
      &-count {
        font-size: 12px;
        color: #555;
      }
    }

    &-item {
      color: #aaa;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .item-new {
    color: green;
  }

  .item-remove {
    color: red;
  }
</style>

<script lang="ts" setup>
  import { ref } from 'vue';

  interface Props {
    disabled?: boolean;
    label: string;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    click: [];
  }>();

  const isHovered = ref(false);

  const handleClick = (): void => {
    emit('click');
  };
</script>

<template>
  <div class="options-button-container">
    <div class="options-button-label" :class="{ 'is-hovered': isHovered, 'is-disabled': disabled }">
      {{ label }}
    </div>
    <button
      type="button"
      class="options-button-input"
      :disabled="props.disabled"
      @click="handleClick"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <slot name="icon" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
  .options-button {
    &-container {
      display: flex;
      justify-content: end;
      align-items: center;
      gap: 5px;
    }

    &-label {
      font-size: smaller;
      color: transparent;
      pointer-events: none;
      padding: 5px;
      background-color: transparent;
      border-radius: 5px;

      &.is-hovered {
        color: white;
        background-color: rgba($color: #555, $alpha: 0.3);

        transition: all;
        transition-duration: 600ms;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

        &.is-disabled {
          color: #aaa;
        }
      }
    }

    &-input {
      padding: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      stroke: white;
    }
  }
</style>

<script lang="ts" setup>
  interface Props {
    disabled?: boolean;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    click: [];
  }>();

  const handleClick = (): void => {
    emit('click');
  };
</script>

<template>
  <button type="button" class="options-button" :disabled="props.disabled" @click="handleClick">
    <slot name="icon" />
  </button>
</template>

<style scoped>
  .options-button {
    padding: 5px;
    stroke: white;
  }
</style>

<script setup lang="ts">
import BottomNav from "@/components/BottomNav.vue";
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-xl flex-col">
    <main class="flex-1 pb-28 pt-6 px-4">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <BottomNav />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>

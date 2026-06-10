<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Home, Utensils, Dumbbell, Calendar } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

const items = [
  { to: "/", label: "主页", icon: Home },
  { to: "/food", label: "饮食", icon: Utensils },
  { to: "/exercise", label: "运动", icon: Dumbbell },
  { to: "/history", label: "历史", icon: Calendar },
];

const current = computed(() => route.path);
</script>

<template>
  <nav
    class="fixed bottom-0 left-1/2 z-30 w-full max-w-xl -translate-x-1/2 px-4 pb-3"
  >
    <div
      class="flex items-center justify-between rounded-3xl border border-white/60 bg-white/80 p-2 shadow-card backdrop-blur"
    >
      <button
        v-for="it in items"
        :key="it.to"
        class="flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-xs font-semibold transition"
        :class="
          current === it.to
            ? 'bg-brand-500 text-white shadow-soft'
            : 'text-slate-500 hover:bg-slate-100/70'
        "
        @click="router.push(it.to)"
      >
        <component :is="it.icon" class="h-5 w-5" :stroke-width="2" />
        <span>{{ it.label }}</span>
      </button>
    </div>
  </nav>
</template>

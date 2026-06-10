<script setup lang="ts">
import { computed, type Component } from "vue";

const props = defineProps<{
  label: string;
  value: number;
  unit?: string;
  icon: Component;
  color: "emerald" | "amber" | "blue" | "violet";
}>();

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: {
    bg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
    text: "text-emerald-600",
    ring: "ring-emerald-100",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-400 to-orange-500",
    text: "text-amber-600",
    ring: "ring-amber-100",
  },
  blue: {
    bg: "bg-gradient-to-br from-sky-400 to-blue-600",
    text: "text-sky-600",
    ring: "ring-sky-100",
  },
  violet: {
    bg: "bg-gradient-to-br from-violet-400 to-fuchsia-500",
    text: "text-violet-600",
    ring: "ring-violet-100",
  },
};

const theme = computed(() => colorMap[props.color]);
</script>

<template>
  <div class="card animate-fadeUp flex items-center gap-4">
    <div
      class="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-soft shrink-0"
      :class="theme.bg"
    >
      <component :is="icon" class="h-6 w-6" :stroke-width="2.25" />
    </div>
    <div class="min-w-0">
      <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {{ label }}
      </div>
      <div class="mt-0.5 flex items-baseline gap-1">
        <span
          class="text-3xl font-bold tracking-tight"
          :class="theme.text"
        >
          {{ value.toLocaleString() }}
        </span>
        <span class="text-sm text-slate-500">
          {{ unit || "kcal" }}
        </span>
      </div>
    </div>
  </div>
</template>

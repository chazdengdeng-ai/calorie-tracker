<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  UtensilsCrossed,
  Flame,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
} from "lucide-vue-next";
import StatCard from "@/components/StatCard.vue";
import { useDB, type FoodRecord, type ExerciseRecord } from "@/composables/useDB";
import { prettyDate, sumCalories, todayStr } from "@/utils/date";

const router = useRouter();
const db = useDB();

const foods = ref<FoodRecord[]>([]);
const exercises = ref<ExerciseRecord[]>([]);

const intake = computed(() => sumCalories(foods.value));
const burn = computed(() => sumCalories(exercises.value));
const diff = computed(() => intake.value - burn.value);
const diffLabel = computed(() => (diff.value >= 0 ? "热量盈余" : "热量缺口"));
const greet = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
});

async function refresh() {
  const d = todayStr();
  foods.value = await db.getFoodsByDate(d);
  exercises.value = await db.getExercisesByDate(d);
}

onMounted(() => {
  refresh();
  window.addEventListener("focus", refresh);
});
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-end justify-between animate-fadeUp">
      <div>
        <div class="text-sm font-semibold text-slate-500">
          {{ greet }} 👋
        </div>
        <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-800">
          今日热量
        </h1>
        <div class="mt-1 text-sm text-slate-500">
          {{ prettyDate(todayStr()) }}
        </div>
      </div>
      <div class="chip bg-brand-100 text-brand-700">
        <Flame class="h-3.5 w-3.5" />
        <span>记录中</span>
      </div>
    </div>

    <!-- Diff summary -->
    <div
      class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-emerald-500 to-teal-500 p-6 text-white shadow-soft animate-fadeUp"
    >
      <div
        class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/10"
      ></div>
      <div class="relative">
        <div class="text-xs font-semibold uppercase tracking-wider opacity-80">
          {{ diffLabel }}
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-5xl font-bold tracking-tight">
            {{ Math.abs(diff).toLocaleString() }}
          </span>
          <span class="text-lg opacity-90">kcal</span>
          <component
            :is="diff >= 0 ? TrendingUp : TrendingDown"
            class="ml-1 h-6 w-6 opacity-90"
          />
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div
            class="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"
          >
            <div class="text-xs opacity-80">摄入</div>
            <div class="mt-0.5 text-lg font-bold">
              {{ intake.toLocaleString() }}
              <span class="text-xs opacity-80">kcal</span>
            </div>
          </div>
          <div
            class="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"
          >
            <div class="text-xs opacity-80">消耗</div>
            <div class="mt-0.5 text-lg font-bold">
              {{ burn.toLocaleString() }}
              <span class="text-xs opacity-80">kcal</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid gap-4">
      <StatCard
        label="饮食摄入"
        :value="intake"
        :icon="UtensilsCrossed"
        color="amber"
      />
      <StatCard
        label="运动消耗"
        :value="burn"
        :icon="Flame"
        color="blue"
      />
    </div>

    <!-- Quick actions -->
    <div class="grid grid-cols-2 gap-3">
      <button
        class="card hover:shadow-soft transition animate-fadeUp text-left"
        @click="router.push('/food')"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-slate-700">记录饮食</span>
          <Plus class="h-4 w-4 text-brand-600" />
        </div>
        <div class="mt-2 text-xs text-slate-500">
          已记录 {{ foods.length }} 条
        </div>
      </button>
      <button
        class="card hover:shadow-soft transition animate-fadeUp text-left"
        @click="router.push('/exercise')"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-slate-700">记录运动</span>
          <Plus class="h-4 w-4 text-sky-600" />
        </div>
        <div class="mt-2 text-xs text-slate-500">
          已记录 {{ exercises.length }} 条
        </div>
      </button>
    </div>

    <!-- Recent items preview -->
    <section class="card animate-fadeUp">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-700">今日记录预览</h2>
        <button
          class="text-xs font-semibold text-brand-600 hover:underline"
          @click="router.push('/history')"
        >
          查看历史 <ArrowRight class="inline h-3 w-3" />
        </button>
      </div>
      <div
        v-if="foods.length === 0 && exercises.length === 0"
        class="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500"
      >
        今天还没有记录，快去添加一条吧 🍎
      </div>
      <div v-else class="mt-3 space-y-2">
        <div
          v-for="f in foods.slice(0, 3)"
          :key="'f-' + f.id"
          class="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-white"
            >
              <UtensilsCrossed class="h-4 w-4" />
            </div>
            <div class="text-sm font-semibold text-slate-700">
              {{ f.name }}
            </div>
          </div>
          <div class="text-sm font-bold text-amber-600">
            +{{ f.calories }}
          </div>
        </div>
        <div
          v-for="e in exercises.slice(0, 3)"
          :key="'e-' + e.id"
          class="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500 text-white"
            >
              <Flame class="h-4 w-4" />
            </div>
            <div class="text-sm font-semibold text-slate-700">
              {{ e.name }}
            </div>
          </div>
          <div class="text-sm font-bold text-sky-600">
            -{{ e.calories }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

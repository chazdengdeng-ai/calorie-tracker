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
  Target,
  Scale,
  Sparkles,
} from "lucide-vue-next";
import { useDB, type FoodRecord, type ExerciseRecord, type WeightRecord } from "@/composables/useDB";
import { prettyDate, sumCalories, todayStr } from "@/utils/date";

const router = useRouter();
const db = useDB();

const foods = ref<FoodRecord[]>([]);
const exercises = ref<ExerciseRecord[]>([]);
const latestWeight = ref<WeightRecord | null>(null);
const goal = ref(2000);
const isEditingGoal = ref(false);
const goalDraft = ref("2000");

const intake = computed(() => sumCalories(foods.value));
const burn = computed(() => sumCalories(exercises.value));
const netIntake = computed(() => intake.value - burn.value);
const remaining = computed(() => goal.value - netIntake.value);
const progress = computed(() => {
  if (goal.value <= 0) return 0;
  return Math.min(100, Math.round((netIntake.value / goal.value) * 100));
});
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
  latestWeight.value = await db.getLatestWeight();
  const settings = await db.getSettings();
  goal.value = settings.dailyCalorieGoal || 2000;
}

function openGoalEditor() {
  goalDraft.value = String(goal.value);
  isEditingGoal.value = true;
}

async function submitGoal() {
  const v = Number(goalDraft.value);
  if (!v || v <= 0) return;
  goal.value = v;
  await db.saveSettings({ dailyCalorieGoal: v });
  isEditingGoal.value = false;
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

    <!-- Goal + progress summary card -->
    <div
      class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-emerald-500 to-teal-500 p-5 text-white shadow-soft animate-fadeUp"
    >
      <div
        class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/10"
      ></div>
      <div class="relative">
        <div class="flex items-center justify-between">
          <div class="text-xs font-semibold uppercase tracking-wider opacity-80">
            <Target class="mr-1 inline h-3 w-3" />
            今日目标
          </div>
          <button
            class="text-xs font-semibold opacity-90 hover:opacity-100 transition underline underline-offset-2"
            @click="openGoalEditor"
          >
            调整
          </button>
        </div>

        <!-- Goal editor inline -->
        <div
          v-if="isEditingGoal"
          class="mt-3 rounded-2xl bg-white/20 backdrop-blur p-3"
        >
          <div class="flex items-center gap-2">
            <input
              v-model="goalDraft"
              type="number"
              min="500"
              step="50"
              class="flex-1 rounded-xl bg-white/90 px-3 py-2 text-sm text-slate-800 outline-none"
              placeholder="热量目标"
              @keyup.enter="submitGoal"
            />
            <button
              class="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-emerald-600"
              @click="submitGoal"
            >
              保存
            </button>
          </div>
        </div>

        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-4xl font-bold tracking-tight">
            {{ goal.toLocaleString() }}
          </span>
          <span class="text-base opacity-90">kcal</span>
        </div>

        <!-- Progress bar -->
        <div class="mt-4">
          <div class="h-3 w-full overflow-hidden rounded-full bg-white/25">
            <div
              class="h-full rounded-full bg-white transition-all duration-500"
              :style="{ width: Math.max(0, progress) + '%' }"
            ></div>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs opacity-90">
            <span>已完成 {{ progress }}%</span>
            <span
              class="flex items-center gap-1"
              :class="remaining >= 0 ? '' : 'text-amber-100'"
            >
              <component
                :is="remaining >= 0 ? TrendingDown : TrendingUp"
                class="h-3 w-3"
              />
              {{ remaining >= 0 ? "还可摄入" : "已超出" }}
              {{ Math.abs(remaining).toLocaleString() }} kcal
            </span>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
            <div class="text-xs opacity-80">摄入</div>
            <div class="mt-0.5 text-lg font-bold">
              {{ intake.toLocaleString() }}
              <span class="text-xs opacity-80">kcal</span>
            </div>
          </div>
          <div class="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
            <div class="text-xs opacity-80">消耗</div>
            <div class="mt-0.5 text-lg font-bold">
              {{ burn.toLocaleString() }}
              <span class="text-xs opacity-80">kcal</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weight quick-look -->
    <div
      v-if="latestWeight"
      class="card animate-fadeUp"
    >
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-bold text-slate-700">最新体重</div>
          <div class="mt-1 text-xs text-slate-500">
            {{ prettyDate(latestWeight.date) }}
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="text-2xl font-bold text-brand-600">
              {{ latestWeight.weight }}
              <span class="text-sm text-slate-500">kg</span>
            </div>
          </div>
          <button
            class="rounded-2xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white shadow-soft hover:bg-brand-600 transition"
            @click="router.push('/weight')"
          >
            查看趋势
          </button>
        </div>
      </div>
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

    <!-- Tip / first-weight prompt -->
    <section
      v-if="!latestWeight"
      class="card animate-fadeUp border-brand-200 bg-brand-50/60"
    >
      <div class="flex items-start gap-3">
        <Sparkles class="mt-0.5 h-5 w-5 text-brand-500 shrink-0" />
        <div class="flex-1">
          <div class="text-sm font-bold text-brand-700">开始追踪体重</div>
          <div class="mt-1 text-xs text-brand-700/80">
            记录每天的体重变化，让热量管理更有目标感。
          </div>
          <button
            class="mt-3 rounded-2xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-brand-600 transition"
            @click="router.push('/weight')"
          >
            <Scale class="mr-1 inline h-3 w-3" />
            去记录
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

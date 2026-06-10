<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  CalendarDays,
  UtensilsCrossed,
  Flame,
  ChevronDown,
  ChevronUp,
  Trash2,
  TrendingDown,
  TrendingUp,
  Activity,
} from "lucide-vue-next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line, Bar } from "vue-chartjs";
import {
  useDB,
  type FoodRecord,
  type ExerciseRecord,
} from "@/composables/useDB";
import { prettyDate, sumCalories, todayStr } from "@/utils/date";

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const db = useDB();

interface DaySummary {
  date: string;
  intake: number;
  burn: number;
  diff: number;
  foods: FoodRecord[];
  exercises: ExerciseRecord[];
  expanded: boolean;
}

const summaries = ref<DaySummary[]>([]);

const hasData = computed(() => summaries.value.length > 0);

// 按日期升序的统计（给图表用）
const chartData = computed(() => {
  const sorted = [...summaries.value].sort((a, b) =>
    a.date < b.date ? -1 : 1,
  );
  // 取最近 14 天，让图表更清晰
  const recent = sorted.slice(-14);
  return {
    labels: recent.map((s) => {
      const [, m, d] = s.date.split("-");
      return `${Number(m)}/${Number(d)}`;
    }),
    intake: recent.map((s) => s.intake),
    burn: recent.map((s) => s.burn),
    diff: recent.map((s) => s.diff),
    fullDates: recent.map((s) => s.date),
  };
});

const averageIntake = computed(() => {
  if (summaries.value.length === 0) return 0;
  const total = summaries.value.reduce((a, s) => a + s.intake, 0);
  return Math.round(total / summaries.value.length);
});
const averageBurn = computed(() => {
  if (summaries.value.length === 0) return 0;
  const total = summaries.value.reduce((a, s) => a + s.burn, 0);
  return Math.round(total / summaries.value.length);
});
const averageDiff = computed(() => averageIntake.value - averageBurn.value);
const totalDays = computed(() => summaries.value.length);

// 最高/最低摄入日
const maxIntakeDay = computed(() => {
  if (summaries.value.length === 0) return null;
  return summaries.value.reduce((a, b) => (a.intake > b.intake ? a : b));
});
const minDiffDay = computed(() => {
  // 热量赤字最大的一天（diff 最低）
  if (summaries.value.length === 0) return null;
  return summaries.value.reduce((a, b) => (a.diff < b.diff ? a : b));
});

// Chart 1：摄入 vs 消耗 折线图
const lineChartData = computed(() => ({
  labels: chartData.value.labels,
  datasets: [
    {
      label: "摄入 (kcal)",
      data: chartData.value.intake,
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: "#f59e0b",
    },
    {
      label: "消耗 (kcal)",
      data: chartData.value.burn,
      borderColor: "#0ea5e9",
      backgroundColor: "rgba(14, 165, 233, 0.1)",
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: "#0ea5e9",
    },
  ],
}));

const lineChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: {
      position: "top",
      labels: {
        boxWidth: 12,
        padding: 16,
        font: { size: 12 },
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: "#1e293b",
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 12, weight: "bold" },
      bodyFont: { size: 12 },
      callbacks: {
        title: (items) => {
          const idx = items[0].dataIndex;
          return chartData.value.fullDates[idx] || "";
        },
        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} kcal`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: "#64748b" },
    },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(100, 116, 139, 0.08)" },
      ticks: { font: { size: 11 }, color: "#64748b" },
    },
  },
};

// Chart 2：每日差值 柱状图
const barChartData = computed(() => ({
  labels: chartData.value.labels,
  datasets: [
    {
      label: "热量差 (kcal)",
      data: chartData.value.diff,
      backgroundColor: chartData.value.diff.map((d) =>
        d >= 0 ? "rgba(245, 158, 11, 0.7)" : "rgba(16, 185, 129, 0.7)",
      ),
      borderColor: chartData.value.diff.map((d) =>
        d >= 0 ? "#f59e0b" : "#10b981",
      ),
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
}));

const barChartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1e293b",
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 12, weight: "bold" },
      bodyFont: { size: 12 },
      callbacks: {
        title: (items) => {
          const idx = items[0].dataIndex;
          return chartData.value.fullDates[idx] || "";
        },
        label: (ctx) => {
          const v = ctx.parsed.y;
          return ` 差值: ${v >= 0 ? "+" : ""}${v} kcal (${v >= 0 ? "盈余" : "赤字"})`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: "#64748b" },
    },
    y: {
      grid: { color: "rgba(100, 116, 139, 0.08)" },
      ticks: { font: { size: 11 }, color: "#64748b" },
    },
  },
};

async function load() {
  const base = await db.getAllDatesSummary();
  const result: DaySummary[] = [];
  for (const b of base) {
    const foods = await db.getFoodsByDate(b.date);
    const exercises = await db.getExercisesByDate(b.date);
    result.push({
      date: b.date,
      intake: b.intake,
      burn: b.burn,
      diff: b.intake - b.burn,
      foods,
      exercises,
      expanded: false,
    });
  }
  summaries.value = result;
}

function toggle(i: number) {
  summaries.value[i].expanded = !summaries.value[i].expanded;
}

async function removeFood(id: string, date: string) {
  await db.deleteFood(id);
  const s = summaries.value.find((x) => x.date === date);
  if (s) {
    s.foods = s.foods.filter((f) => f.id !== id);
    s.intake = sumCalories(s.foods);
    s.diff = s.intake - s.burn;
  }
}

async function removeExercise(id: string, date: string) {
  await db.deleteExercise(id);
  const s = summaries.value.find((x) => x.date === date);
  if (s) {
    s.exercises = s.exercises.filter((e) => e.id !== id);
    s.burn = sumCalories(s.exercises);
    s.diff = s.intake - s.burn;
  }
}

function diffClass(diff: number) {
  if (diff >= 0) return "text-amber-600";
  return "text-emerald-600";
}

onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-800">
          历史 & 统计
        </h1>
        <p class="text-sm text-slate-500">回顾每一天的热量平衡</p>
      </div>
      <div
        class="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-soft"
      >
        <CalendarDays class="h-5 w-5" />
      </div>
    </div>

    <!-- Summary stats -->
    <div
      class="animate-fadeUp grid grid-cols-2 gap-3 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-5 text-white shadow-soft"
    >
      <div>
        <div class="text-xs uppercase tracking-wider opacity-80">
          记录天数
        </div>
        <div class="mt-1 text-2xl font-bold">
          {{ totalDays }}
          <span class="text-sm font-normal opacity-80">天</span>
        </div>
      </div>
      <div>
        <div class="text-xs uppercase tracking-wider opacity-80">
          平均摄入/消耗
        </div>
        <div class="mt-1 text-sm font-semibold">
          {{ averageIntake }} / {{ averageBurn }} kcal
        </div>
      </div>
      <div>
        <div class="text-xs uppercase tracking-wider opacity-80">
          日均热量差
        </div>
        <div class="mt-1 text-2xl font-bold">
          {{ averageDiff >= 0 ? "+" : "" }}{{ averageDiff }}
          <span class="text-sm font-normal opacity-80">kcal</span>
        </div>
      </div>
      <div>
        <div class="text-xs uppercase tracking-wider opacity-80">
          趋势
        </div>
        <div class="mt-1 flex items-center gap-1 text-base font-semibold">
          <component
            :is="averageDiff >= 0 ? TrendingUp : TrendingDown"
            class="h-5 w-5"
          />
          <span>{{ averageDiff >= 0 ? "盈余" : "赤字" }}</span>
        </div>
      </div>
    </div>

    <!-- Charts section -->
    <template v-if="hasData">
      <!-- Intake vs Burn Line Chart -->
      <div class="card animate-fadeUp">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-bold text-slate-700">
              每日摄入 vs 消耗
            </div>
            <div class="text-xs text-slate-500">
              最近 {{ chartData.labels.length }} 天
            </div>
          </div>
          <Activity class="h-4 w-4 text-violet-500" />
        </div>
        <div class="mt-4 h-60">
          <Line :data="lineChartData" :options="lineChartOptions" />
        </div>
      </div>

      <!-- Diff Bar Chart -->
      <div class="card animate-fadeUp">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-bold text-slate-700">每日热量差</div>
            <div class="text-xs text-slate-500">
              <span class="text-amber-600">橙色</span> = 盈余，
              <span class="text-emerald-600">绿色</span> = 赤字
            </div>
          </div>
          <TrendingUp class="h-4 w-4 text-amber-500" />
        </div>
        <div class="mt-4 h-60">
          <Bar :data="barChartData" :options="barChartOptions" />
        </div>
      </div>

      <!-- Highlights -->
      <div class="grid animate-fadeUp grid-cols-2 gap-3">
        <div class="card">
          <div class="text-xs text-slate-500">最高摄入日</div>
          <div v-if="maxIntakeDay" class="mt-1">
            <div class="text-base font-bold text-amber-600">
              {{ maxIntakeDay.intake }} kcal
            </div>
            <div class="text-xs text-slate-500">
              {{ prettyDate(maxIntakeDay.date) }}
            </div>
          </div>
        </div>
        <div class="card">
          <div class="text-xs text-slate-500">最大热量赤字日</div>
          <div v-if="minDiffDay && minDiffDay.diff < 0" class="mt-1">
            <div class="text-base font-bold text-emerald-600">
              {{ minDiffDay.diff }} kcal
            </div>
            <div class="text-xs text-slate-500">
              {{ prettyDate(minDiffDay.date) }}
            </div>
          </div>
          <div v-else class="mt-1 text-sm text-slate-400">
            暂未出现赤字日
          </div>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-if="!hasData" class="card animate-fadeUp text-center">
      <div class="py-10 text-sm text-slate-500">
        还没有任何记录 🌱
        <br />
        回到主页添加你的第一条记录吧！
      </div>
    </div>

    <!-- Day-by-day list -->
    <div v-if="hasData" class="space-y-3">
      <div class="text-xs font-bold uppercase tracking-wider text-slate-500">
        每日明细
      </div>
      <div
        v-for="(s, idx) in summaries"
        :key="s.date"
        class="card animate-fadeUp"
      >
        <button
          class="flex w-full items-center justify-between text-left"
          @click="toggle(idx)"
        >
          <div>
            <div class="text-sm font-bold text-slate-700">
              {{ prettyDate(s.date) }}
              <span
                v-if="s.date === todayStr()"
                class="chip bg-brand-100 text-brand-700 ml-2"
              >
                今天
              </span>
            </div>
            <div class="mt-1 flex items-center gap-3 text-xs text-slate-500">
              <span>
                <UtensilsCrossed class="mr-1 inline h-3 w-3 text-amber-500" />
                {{ s.intake }} kcal
              </span>
              <span>
                <Flame class="mr-1 inline h-3 w-3 text-sky-500" />
                {{ s.burn }} kcal
              </span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="text-xs text-slate-500">差值</div>
              <div
                class="text-base font-bold"
                :class="diffClass(s.diff)"
              >
                {{ s.diff >= 0 ? "+" : "" }}{{ s.diff }}
              </div>
            </div>
            <component
              :is="s.expanded ? ChevronUp : ChevronDown"
              class="h-5 w-5 text-slate-400"
            />
          </div>
        </button>

        <Transition name="slide">
          <div v-if="s.expanded" class="mt-4 space-y-3 border-t border-slate-100 pt-4">
            <div>
              <div class="text-xs font-bold uppercase text-amber-600">
                饮食
              </div>
              <ul v-if="s.foods.length" class="mt-2 space-y-1">
                <li
                  v-for="f in s.foods"
                  :key="f.id"
                  class="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-sm"
                >
                  <span class="text-slate-700">{{ f.name }}</span>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-amber-600">
                      +{{ f.calories }}
                    </span>
                    <button
                      class="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-rose-500 transition"
                      @click.stop="removeFood(f.id, s.date)"
                    >
                      <Trash2 class="h-3 w-3" />
                    </button>
                  </div>
                </li>
              </ul>
              <div
                v-else
                class="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500"
              >
                无记录
              </div>
            </div>
            <div>
              <div class="text-xs font-bold uppercase text-sky-600">
                运动
              </div>
              <ul v-if="s.exercises.length" class="mt-2 space-y-1">
                <li
                  v-for="e in s.exercises"
                  :key="e.id"
                  class="flex items-center justify-between rounded-xl bg-sky-50 px-3 py-2 text-sm"
                >
                  <span class="text-slate-700">{{ e.name }}</span>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-sky-600">
                      -{{ e.calories }}
                    </span>
                    <button
                      class="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-rose-500 transition"
                      @click.stop="removeExercise(e.id, s.date)"
                    >
                      <Trash2 class="h-3 w-3" />
                    </button>
                  </div>
                </li>
              </ul>
              <div
                v-else
                class="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500"
              >
                无记录
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 600px;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Scale,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Target,
  TrendingDown,
  TrendingUp,
  Activity,
  X,
  Plus,
  Edit2,
  Check,
} from "lucide-vue-next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line } from "vue-chartjs";
import { useDB, type WeightRecord } from "@/composables/useDB";
import { prettyDate, todayStr } from "@/utils/date";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const db = useDB();

const selectedDate = ref(todayStr());
const weights = ref<WeightRecord[]>([]);
const weightInput = ref("");
const noteInput = ref("");
const targetInput = ref("");
const isEditingTarget = ref(false);
const toast = ref<{ type: "ok" | "err"; msg: string } | null>(null);

async function load() {
  weights.value = await db.getWeights();
  const settings = await db.getSettings();
  targetInput.value = settings.targetWeight ? String(settings.targetWeight) : "";
}

function shiftDate(days: number) {
  const [y, m, d] = selectedDate.value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  selectedDate.value = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

async function submitWeight() {
  const w = Number(weightInput.value);
  if (!w || w <= 0) {
    showToast("err", "请输入有效体重");
    return;
  }
  await db.addWeight({
    date: selectedDate.value,
    weight: w,
    note: noteInput.value.trim() || undefined,
  });
  weightInput.value = "";
  noteInput.value = "";
  showToast("ok", "已记录 ✅");
  load();
}

async function removeWeight(id: string) {
  await db.deleteWeight(id);
  load();
}

function openTargetEditor() {
  isEditingTarget.value = true;
}

async function saveTarget() {
  const v = Number(targetInput.value);
  if (!v || v <= 0) {
    showToast("err", "请输入有效目标体重");
    return;
  }
  await db.saveSettings({ targetWeight: v });
  isEditingTarget.value = false;
  showToast("ok", "目标已更新 🎯");
  load();
}

const latest = computed(() =>
  weights.value.length > 0 ? weights.value[0] : null,
);
const earliest = computed(() =>
  weights.value.length > 0 ? weights.value[weights.value.length - 1] : null,
);
const totalChange = computed(() => {
  if (!latest.value || !earliest.value) return 0;
  return Number((latest.value.weight - earliest.value.weight).toFixed(1));
});
const target = computed(() => {
  const v = Number(targetInput.value);
  return v > 0 ? v : null;
});
const targetRemaining = computed(() => {
  if (!latest.value || !target.value) return 0;
  return Number((latest.value.weight - target.value).toFixed(1));
});

// 最近 30 天的图表数据
const chartData = computed(() => {
  // 按日期升序排列
  const sorted = [...weights.value].sort((a, b) =>
    a.date < b.date ? -1 : 1,
  );
  const recent = sorted.slice(-30);
  return {
    labels: recent.map((w) => {
      const [, m, d] = w.date.split("-");
      return `${Number(m)}/${Number(d)}`;
    }),
    weights: recent.map((w) => w.weight),
    targetLine: recent.map(() => target.value || null),
  };
});

const lineChartData = computed(() => ({
  labels: chartData.value.labels,
  datasets: [
    {
      label: "体重 (kg)",
      data: chartData.value.weights,
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.12)",
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: "#10b981",
    },
    ...(target.value && chartData.value.labels.length > 0
      ? [
          {
            label: "目标 (kg)",
            data: chartData.value.targetLine,
            borderColor: "#f59e0b",
            backgroundColor: "transparent",
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 0,
            tension: 0,
            fill: false,
          },
        ]
      : []),
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

function showToast(type: "ok" | "err", msg: string) {
  toast.value = { type, msg };
  setTimeout(() => (toast.value = null), 2500);
}

onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-800">
          体重记录
        </h1>
        <p class="text-sm text-slate-500">追踪每日体重变化</p>
      </div>
      <div
        class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-soft"
      >
        <Scale class="h-5 w-5" />
      </div>
    </div>

    <!-- Summary Card -->
    <div
      class="animate-fadeUp overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-white shadow-soft"
    >
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-wider opacity-80">
            最新体重
          </div>
          <div v-if="latest" class="mt-1 flex items-baseline gap-2">
            <span class="text-5xl font-bold tracking-tight">
              {{ latest.weight }}
            </span>
            <span class="text-base opacity-90">kg</span>
          </div>
          <div v-else class="mt-2 text-lg opacity-90">
            暂无记录
          </div>
          <div class="mt-1 text-xs opacity-80">
            {{ latest ? prettyDate(latest.date) : "" }}
          </div>
        </div>

        <div
          v-if="latest && earliest && latest.id !== earliest.id"
          class="text-right"
        >
          <div class="text-xs font-semibold uppercase tracking-wider opacity-80">
            总变化
          </div>
          <div
            class="mt-1 flex items-baseline justify-end gap-1 text-2xl font-bold"
          >
            <component
              :is="totalChange <= 0 ? TrendingDown : TrendingUp"
              class="h-5 w-5"
            />
            <span>{{ totalChange > 0 ? "+" : "" }}{{ totalChange }}</span>
            <span class="text-sm opacity-80">kg</span>
          </div>
        </div>
      </div>

      <!-- Target row -->
      <div
        v-if="isEditingTarget"
        class="mt-4 rounded-2xl bg-white/15 backdrop-blur p-3"
      >
        <div class="flex items-center gap-2">
          <Target class="h-4 w-4 shrink-0" />
          <input
            v-model="targetInput"
            type="number"
            step="0.1"
            min="20"
            class="flex-1 bg-white/90 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none"
            placeholder="目标体重 (kg)"
            @keyup.enter="saveTarget"
          />
          <button
            class="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-emerald-600"
            @click="saveTarget"
          >
            <Check class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div v-else class="mt-4">
        <div
          class="flex items-center justify-between rounded-2xl bg-white/15 backdrop-blur px-4 py-3"
        >
          <div class="flex items-center gap-2 text-sm">
            <Target class="h-4 w-4" />
            <span class="font-semibold">目标体重</span>
          </div>
          <div class="flex items-center gap-3">
            <span v-if="target" class="font-bold">
              {{ target }} kg
            </span>
            <span v-else class="text-sm opacity-80">未设置</span>
            <button
              class="text-xs font-semibold underline underline-offset-2 opacity-90 hover:opacity-100 transition"
              @click="openTargetEditor"
            >
              <Edit2 class="inline h-3 w-3" />
              {{ target ? "修改" : "设置" }}
            </button>
          </div>
        </div>
        <div
          v-if="latest && target"
          class="mt-3 flex items-center justify-between text-sm"
        >
          <span class="opacity-90">距目标还差</span>
          <span class="font-bold">
            <component
              :is="targetRemaining > 0 ? TrendingDown : TrendingUp"
              class="mr-1 inline h-4 w-4"
            />
            {{ Math.abs(targetRemaining) }} kg
          </span>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="weights.length > 0" class="card animate-fadeUp">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-bold text-slate-700">
            变化趋势
          </div>
          <div class="text-xs text-slate-500">
            最近 {{ chartData.labels.length }} 条记录
          </div>
        </div>
        <Activity class="h-4 w-4 text-emerald-500" />
      </div>
      <div class="mt-4 h-60">
        <Line :data="lineChartData" :options="lineChartOptions" />
      </div>
    </div>

    <!-- Add new record -->
    <div class="card animate-fadeUp">
      <div class="flex items-center justify-between">
        <div class="text-sm font-bold text-slate-700">记录新的体重</div>
        <Plus class="h-4 w-4 text-emerald-500" />
      </div>

      <!-- Date selector -->
      <div class="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2">
        <button
          class="rounded-xl px-2 py-1 text-slate-600 hover:bg-white transition"
          @click="shiftDate(-1)"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
        <div class="text-center">
          <div class="text-sm font-bold text-slate-700">
            {{ prettyDate(selectedDate) }}
          </div>
          <div class="text-xs text-slate-500">
            {{ selectedDate === todayStr() ? "今天" : selectedDate }}
          </div>
        </div>
        <button
          class="rounded-xl px-2 py-1 text-slate-600 hover:bg-white transition disabled:opacity-30"
          :disabled="selectedDate === todayStr()"
          @click="shiftDate(1)"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>

      <div class="mt-3 grid gap-3">
        <div class="flex items-center gap-2">
          <input
            v-model="weightInput"
            type="number"
            step="0.1"
            min="20"
            max="300"
            class="input flex-1"
            placeholder="体重 (kg)，例如：65.5"
            @keyup.enter="submitWeight"
          />
          <span class="text-sm font-semibold text-slate-600 pr-2">kg</span>
        </div>
        <input
          v-model="noteInput"
          class="input"
          placeholder="备注（可选）"
        />
        <button class="btn-primary w-full" @click="submitWeight">
          保存记录
        </button>
      </div>
    </div>

    <!-- History list -->
    <div class="card animate-fadeUp">
      <div class="text-sm font-bold text-slate-700">
        历史记录 · {{ weights.length }}
      </div>
      <div
        v-if="weights.length === 0"
        class="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500"
      >
        还没有任何体重记录，记录你的第一条吧 ⚖️
      </div>
      <ul v-else class="mt-3 space-y-2 max-h-96 overflow-y-auto">
        <li
          v-for="w in weights"
          :key="w.id"
          class="flex items-center justify-between rounded-2xl bg-emerald-50/70 px-4 py-3"
        >
          <div class="min-w-0">
            <div class="text-sm font-bold text-slate-700">
              {{ w.weight }} <span class="text-xs text-slate-500">kg</span>
            </div>
            <div class="text-xs text-slate-500">
              {{ prettyDate(w.date) }}
              <span v-if="w.note" class="ml-1">· {{ w.note }}</span>
            </div>
          </div>
          <button
            class="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-rose-500 transition"
            @click="removeWeight(w.id)"
            aria-label="删除"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </li>
      </ul>
    </div>

    <!-- Toast -->
    <Transition name="fade">
      <div
        v-if="toast"
        class="pointer-events-none fixed bottom-24 left-1/2 z-40 -translate-x-1/2"
      >
        <div
          class="rounded-full px-4 py-2 text-sm font-semibold shadow-card"
          :class="toast.type === 'ok' ? 'bg-brand-500 text-white' : 'bg-rose-500 text-white'"
        >
          {{ toast.msg }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

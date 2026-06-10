<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Dumbbell,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";
import { useDB, type ExerciseRecord } from "@/composables/useDB";
import { prettyDate, sumCalories, todayStr } from "@/utils/date";

const db = useDB();

const selectedDate = ref(todayStr());
const records = ref<ExerciseRecord[]>([]);
const nameInput = ref("");
const caloriesInput = ref("");
const toast = ref<{ type: "ok" | "err"; msg: string } | null>(null);

const total = computed(() => sumCalories(records.value));

const presetExercises: { name: string; calories: number }[] = [
  { name: "快走 30 分钟", calories: 150 },
  { name: "慢跑 30 分钟", calories: 250 },
  { name: "骑行 30 分钟", calories: 200 },
  { name: "瑜伽 30 分钟", calories: 120 },
  { name: "力量训练 30 分钟", calories: 220 },
];

function shiftDate(days: number) {
  const [y, m, d] = selectedDate.value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  selectedDate.value = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  load();
}

async function load() {
  records.value = await db.getExercisesByDate(selectedDate.value);
}

async function submit() {
  const name = nameInput.value.trim();
  const cal = Number(caloriesInput.value);
  if (!name || !cal || cal <= 0) {
    showToast("err", "请输入运动名称和消耗热量");
    return;
  }
  await db.addExercise({ date: selectedDate.value, name, calories: cal });
  nameInput.value = "";
  caloriesInput.value = "";
  showToast("ok", "已添加 🔥");
  load();
}

async function remove(id: string) {
  await db.deleteExercise(id);
  load();
}

function usePreset(p: { name: string; calories: number }) {
  nameInput.value = p.name;
  caloriesInput.value = String(p.calories);
}

function showToast(type: "ok" | "err", msg: string) {
  toast.value = { type, msg };
  setTimeout(() => (toast.value = null), 2500);
}

onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-800">
          运动记录
        </h1>
        <p class="text-sm text-slate-500">记录每一次挥洒汗水</p>
      </div>
      <div
        class="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-soft"
      >
        <Dumbbell class="h-5 w-5" />
      </div>
    </div>

    <div class="card animate-fadeUp flex items-center justify-between">
      <button class="btn-ghost !px-3 !py-2" @click="shiftDate(-1)">
        <ChevronLeft class="h-4 w-4" />
      </button>
      <div class="text-center">
          <div class="text-base font-bold text-slate-800">
            {{ prettyDate(selectedDate) }}
          </div>
          <div class="text-xs text-slate-500">
            {{ selectedDate === todayStr() ? "今天" : selectedDate }}
          </div>
      </div>
      <button
        class="btn-ghost !px-3 !py-2"
        :disabled="selectedDate === todayStr()"
        @click="shiftDate(1)"
      >
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>

    <div
      class="animate-fadeUp rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 p-5 text-white shadow-soft"
    >
      <div class="text-xs font-semibold uppercase tracking-wider opacity-80">
        当日消耗
      </div>
      <div class="mt-1 flex items-baseline gap-2">
        <span class="text-4xl font-bold tracking-tight">
          {{ total.toLocaleString() }}
        </span>
        <span class="text-base opacity-90">kcal</span>
      </div>
      <div class="mt-2 text-xs opacity-80">
        共 {{ records.length }} 条记录
      </div>
    </div>

    <div class="card animate-fadeUp">
      <div class="text-sm font-bold text-slate-700">手动添加</div>
      <div class="mt-3 grid gap-3">
        <input
          v-model="nameInput" class="input" placeholder="运动名称，例如：慢跑" />
        <input
          v-model="caloriesInput"
          class="input"
          type="number"
          min="0"
          step="1"
          placeholder="消耗热量 (kcal)，例如：300"
        />
        <button class="btn-primary w-full" @click="submit">
          保存到 {{ prettyDate(selectedDate) }}
        </button>
      </div>
    </div>

    <div class="card animate-fadeUp">
      <div class="text-sm font-bold text-slate-700">常用运动</div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button
          v-for="p in presetExercises"
          :key="p.name"
          class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-sky-300 hover:bg-sky-50"
          @click="usePreset(p)"
        >
          <div class="text-sm font-semibold text-slate-700">
            {{ p.name }}
          </div>
          <div class="text-xs text-sky-600">{{ p.calories }} kcal</div>
        </button>
      </div>
    </div>

    <div class="card animate-fadeUp">
      <div class="text-sm font-bold text-slate-700">
        当日记录 · {{ records.length }}
      </div>
      <div
        v-if="records.length === 0"
        class="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500"
      >
        今天还没动起来 💪
      </div>
      <ul v-else class="mt-3 space-y-2">
        <li
          v-for="r in records"
          :key="r.id"
          class="flex items-center justify-between rounded-2xl bg-sky-50/70 px-4 py-3"
        >
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-slate-700">
              {{ r.name }}
            </div>
            <div class="text-xs text-slate-500">
              {{ new Date(r.timestamp).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              }) }}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-base font-bold text-sky-600">
              -{{ r.calories }} kcal
            </div>
            <button
              class="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-rose-500 transition"
              @click="remove(r.id)"
              aria-label="删除"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </li>
      </ul>
    </div>

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

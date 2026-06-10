<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  Dumbbell,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Plus,
  Sparkles,
  Timer,
  Scale,
  Flame,
  Activity,
} from "lucide-vue-next";
import { useDB, type ExerciseRecord, type WeightRecord } from "@/composables/useDB";
import { prettyDate, sumCalories, todayStr } from "@/utils/date";
import {
  calcCalories,
  searchExercise,
  type ExerciseItem,
} from "@/utils/exerciseDB";

const db = useDB();

const selectedDate = ref(todayStr());
const records = ref<ExerciseRecord[]>([]);
const latestWeight = ref<WeightRecord | null>(null);

// 手动添加
const nameInput = ref("");
const caloriesInput = ref("");

// 智能搜索
const searchQuery = ref("");
const searchResults = ref<ExerciseItem[]>([]);
const showSearchPanel = ref(false);

// 计算相关
const selectedExercise = ref<ExerciseItem | null>(null);
const durationInput = ref("30"); // 分钟
const weightInput = ref("60"); // kg
const manualWeight = ref(false); // 是否手动输入体重

const toast = ref<{ type: "ok" | "err"; msg: string } | null>(null);

const total = computed(() => sumCalories(records.value));

// 实时计算的消耗
const computedCalories = computed(() => {
  if (!selectedExercise.value) return 0;
  const minutes = Number(durationInput.value);
  const weight = Number(weightInput.value);
  return calcCalories(selectedExercise.value.met, minutes, weight);
});

// 常用运动预设（带 MET 值）
const presetExercises: { name: string; met: number }[] = [
  { name: "快走", met: 4.3 },
  { name: "慢跑", met: 8.3 },
  { name: "骑行", met: 6.8 },
  { name: "瑜伽", met: 3.0 },
  { name: "力量训练", met: 5.0 },
  { name: "HIIT", met: 10.0 },
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
  latestWeight.value = await db.getLatestWeight();
  if (latestWeight.value && !manualWeight.value) {
    weightInput.value = String(latestWeight.value.weight);
  }
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

async function submitComputed() {
  if (!selectedExercise.value) {
    showToast("err", "请先选择运动类型");
    return;
  }
  const minutes = Number(durationInput.value);
  const weight = Number(weightInput.value);
  if (!minutes || minutes <= 0) {
    showToast("err", "请输入有效的时长");
    return;
  }
  if (!weight || weight <= 0) {
    showToast("err", "请输入有效的体重");
    return;
  }
  const cal = calcCalories(selectedExercise.value.met, minutes, weight);
  const name = `${selectedExercise.value.name} · ${minutes} 分钟`;
  await db.addExercise({ date: selectedDate.value, name, calories: cal });
  showToast("ok", `已记录 ${cal} kcal 🔥`);
  selectedExercise.value = null;
  searchQuery.value = "";
  searchResults.value = [];
  showSearchPanel.value = false;
  load();
}

async function remove(id: string) {
  await db.deleteExercise(id);
  load();
}

function usePreset(p: { name: string; met: number }) {
  const minutes = Number(durationInput.value) || 30;
  const weight = Number(weightInput.value) || 60;
  nameInput.value = `${p.name} · ${minutes} 分钟`;
  caloriesInput.value = String(calcCalories(p.met, minutes, weight));
}

// ========= 智能搜索 =========
watch(searchQuery, (q) => {
  const trimmed = q.trim();
  if (!trimmed) {
    searchResults.value = [];
    showSearchPanel.value = false;
    return;
  }
  searchResults.value = searchExercise(trimmed);
  showSearchPanel.value = true;
});

function pickFromSearch(item: ExerciseItem) {
  selectedExercise.value = item;
  searchQuery.value = "";
  searchResults.value = [];
  showSearchPanel.value = false;
}

function fillFromSearch(item: ExerciseItem) {
  const minutes = Number(durationInput.value) || 30;
  const weight = Number(weightInput.value) || 60;
  nameInput.value = `${item.name} · ${minutes} 分钟`;
  caloriesInput.value = String(calcCalories(item.met, minutes, weight));
  searchQuery.value = "";
  searchResults.value = [];
  showSearchPanel.value = false;
}

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

    <!-- Date selector -->
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

    <!-- Total -->
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

    <!-- 智能搜索运动 -->
    <div class="card animate-fadeUp">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-bold text-slate-700">
            智能计算 · 按 MET 值
          </div>
          <div class="text-xs text-slate-500">
            输入运动类型，自动计算热量消耗
          </div>
        </div>
        <Sparkles class="h-4 w-4 text-sky-500" />
      </div>

      <!-- 搜索框 -->
      <div class="relative mt-4">
        <div class="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-sky-400 transition">
          <Search class="h-4 w-4 text-slate-400" />
          <input
            v-model="searchQuery"
            class="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
            placeholder="搜索运动，例如：慢跑、游泳、瑜伽..."
            @focus="showSearchPanel = true"
          />
          <button
            v-if="searchQuery"
            class="text-slate-400 hover:text-slate-600"
            @click="searchQuery = ''; showSearchPanel = false"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- 搜索结果下拉 -->
        <Transition name="dropdown">
          <div
            v-if="showSearchPanel && searchQuery"
            class="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card"
          >
            <div
              v-if="searchResults.length === 0"
              class="p-4 text-center text-sm text-slate-500"
            >
              没找到相关运动，试试其他关键词或手动添加 👇
            </div>
            <ul v-else class="max-h-80 overflow-y-auto">
              <li
                v-for="(item, idx) in searchResults"
                :key="idx"
                class="border-b border-slate-50 last:border-b-0"
              >
                <div class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-sky-50/60 transition">
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-semibold text-slate-700">
                      {{ item.name }}
                    </div>
                    <div class="text-xs text-slate-500">
                      MET {{ item.met }} · 约
                      {{ calcCalories(item.met, 30, Number(weightInput) || 60) }}
                      kcal/30分钟
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button
                      class="btn-ghost !px-2 !py-1 text-xs"
                      @click="fillFromSearch(item)"
                    >
                      填入
                    </button>
                    <button class="btn-primary !py-1 !px-3 text-xs"
                      @click="pickFromSearch(item)"
                    >
                      <Plus class="h-3 w-3" />
                      选择
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </Transition>
      </div>

      <!-- 已选择的运动 + 参数 -->
      <div v-if="selectedExercise" class="mt-3 space-y-3">
        <div
          class="flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3"
        >
          <div class="flex items-center gap-2">
            <Activity class="h-4 w-4 text-sky-600" />
            <div class="text-sm font-semibold text-slate-700">
              {{ selectedExercise.name }}
            </div>
          </div>
          <div class="text-xs text-sky-600">
            MET {{ selectedExercise.met }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Timer class="h-3 w-3" />
              时长（分钟）
            </label>
            <input
              v-model="durationInput"
              type="number"
              min="1"
              step="1"
              class="input"
              placeholder="30"
            />
          </div>
          <div>
            <label class="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Scale class="h-3 w-3" />
              体重（kg）
            </label>
            <input
              v-model="weightInput"
              type="number"
              min="20"
              step="0.1"
              class="input"
              placeholder="60"
              @focus="manualWeight = true"
            />
          </div>
        </div>

        <!-- 实时计算结果 -->
        <div
          class="flex items-center justify-between rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 px-4 py-3 text-white"
        >
          <div class="flex items-center gap-2">
            <Flame class="h-5 w-5" />
            <div>
              <div class="text-xs opacity-80">预计消耗</div>
              <div class="text-2xl font-bold">
                {{ computedCalories }} kcal
              </div>
            </div>
          </div>
          <button
            class="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-sky-600 hover:bg-sky-50 transition shadow-soft"
            @click="submitComputed"
          >
            保存记录
          </button>
        </div>
      </div>
    </div>

    <!-- 常用运动预设 -->
    <div class="card animate-fadeUp">
      <div class="text-sm font-bold text-slate-700">常用运动 · 快速填入</div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button
          v-for="p in presetExercises"
          :key="p.name"
          class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-sky-300 hover:bg-sky-50"
          @click="usePreset(p)"
        >
          <div class="text-sm font-semibold text-slate-700">{{ p.name }}</div>
          <div class="text-xs text-sky-600">
            MET {{ p.met }} · 约
            {{ calcCalories(p.met, Number(durationInput) || 30, Number(weightInput) || 60) }}
            kcal
          </div>
        </button>
      </div>
      <div class="mt-3 text-xs text-slate-500">
        小贴士：时长和体重使用上方输入框中的值计算，点选后自动填入手动区
      </div>
    </div>

    <!-- 手动添加 -->
    <div class="card animate-fadeUp">
      <div class="text-sm font-bold text-slate-700">手动添加</div>
      <div class="mt-3 grid gap-3">
        <input
          v-model="nameInput"
          class="input"
          placeholder="运动名称，例如：慢跑"
        />
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

    <!-- 当日记录列表 -->
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
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.18s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

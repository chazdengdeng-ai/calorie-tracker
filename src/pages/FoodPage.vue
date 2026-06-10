<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  UtensilsCrossed,
  Camera,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-vue-next";
import { useDB, type FoodRecord } from "@/composables/useDB";
import { prettyDate, sumCalories, todayStr } from "@/utils/date";
import {
  hasVisionApiKey,
  recognizeFoodImage,
  type RecognizedFood,
} from "@/utils/vision";

const db = useDB();

const selectedDate = ref(todayStr());
const foods = ref<FoodRecord[]>([]);
const nameInput = ref("");
const caloriesInput = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const recognizing = ref(false);
const recognizedItems = ref<RecognizedFood[]>([]);
const previewUrl = ref<string | null>(null);
const apiKeyMissing = ref(false);
const toast = ref<{ type: "ok" | "err"; msg: string } | null>(null);

const total = computed(() => sumCalories(foods.value));

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
  foods.value = await db.getFoodsByDate(selectedDate.value);
}

async function submit() {
  const name = nameInput.value.trim();
  const cal = Number(caloriesInput.value);
  if (!name || !cal || cal <= 0) {
    showToast("err", "请输入食物名称和热量");
    return;
  }
  await db.addFood({ date: selectedDate.value, name, calories: cal });
  nameInput.value = "";
  caloriesInput.value = "";
  showToast("ok", "已添加 🍎");
  load();
}

async function remove(id: string) {
  await db.deleteFood(id);
  load();
}

function triggerPhoto() {
  if (!hasVisionApiKey()) {
    apiKeyMissing.value = true;
    showToast("err", "需要配置 VITE_GEMINI_API_KEY 才能使用拍照识别");
    return;
  }
  fileInput.value?.click();
}

function onFileChange(e: Event) {
  const t = e.target as HTMLInputElement;
  const file = t.files?.[0];
  if (!file) return;
  previewUrl.value = URL.createObjectURL(file);
  recognizedItems.value = [];
  runRecognize(file);
  t.value = "";
}

async function runRecognize(file: File) {
  recognizing.value = true;
  try {
    const items = await recognizeFoodImage(file);
    if (items.length === 0) {
      showToast("err", "未能识别到食物，请尝试更清晰的照片");
    } else {
      recognizedItems.value = items;
      showToast("ok", `识别到 ${items.length} 种食物，请确认后保存`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    showToast("err", msg);
  } finally {
    recognizing.value = false;
  }
}

function closeRecognize() {
  recognizedItems.value = [];
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
}

async function addRecognized(it: RecognizedFood) {
  await db.addFood({
    date: selectedDate.value,
    name: it.name,
    calories: it.calories,
  });
  recognizedItems.value = recognizedItems.value.filter((x) => x !== it);
  showToast("ok", `已添加：${it.name}`);
  load();
  if (recognizedItems.value.length === 0) closeRecognize();
}

async function addAllRecognized() {
  for (const it of [...recognizedItems.value]) {
    await db.addFood({
      date: selectedDate.value,
      name: it.name,
      calories: it.calories,
    });
  }
  closeRecognize();
  showToast("ok", "已批量添加");
  load();
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
          饮食记录
        </h1>
        <p class="text-sm text-slate-500">记录每一口食物的热量</p>
      </div>
      <div
        class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-white shadow-soft"
      >
        <UtensilsCrossed class="h-5 w-5" />
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
      class="animate-fadeUp rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white shadow-soft"
    >
      <div class="text-xs font-semibold uppercase tracking-wider opacity-80">
        当日摄入
      </div>
      <div class="mt-1 flex items-baseline gap-2">
        <span class="text-4xl font-bold tracking-tight">
          {{ total.toLocaleString() }}
        </span>
        <span class="text-base opacity-90">kcal</span>
      </div>
      <div class="mt-2 text-xs opacity-80">
        共 {{ foods.length }} 条记录
      </div>
    </div>

    <!-- Photo recognition -->
    <div class="card animate-fadeUp">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-bold text-slate-700">拍照识别</div>
          <div class="text-xs text-slate-500">
            拍一张食物照片，AI 帮你估算热量
          </div>
        </div>
        <Sparkles class="h-4 w-4 text-amber-500" />
      </div>
      <button class="btn-primary mt-4 w-full" @click="triggerPhoto">
        <Camera class="h-4 w-4" />
        <span>选择 / 拍摄食物照片</span>
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden"
        @change="onFileChange"
      />
      <p v-if="apiKeyMissing" class="mt-2 text-xs text-amber-600">
        提示：在项目根目录创建 .env 文件，添加
        <code class="rounded bg-amber-50 px-1 py-0.5">
          VITE_GEMINI_API_KEY=yourkey
        </code>
        后重启开发服务器即可使用拍照识别功能。
      </p>
    </div>

    <!-- Manual input -->
    <div class="card animate-fadeUp">
      <div class="text-sm font-bold text-slate-700">手动添加</div>
      <div class="mt-3 grid gap-3">
        <input
          v-model="nameInput"
          class="input"
          placeholder="食物名称，例如：一碗牛肉面"
        />
        <input
          v-model="caloriesInput"
          class="input"
          type="number"
          min="0"
          step="1"
          placeholder="热量 (kcal)，例如：500"
        />
        <button class="btn-primary w-full" @click="submit">
          保存到 {{ prettyDate(selectedDate) }}
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="card animate-fadeUp">
      <div class="text-sm font-bold text-slate-700">
        当日记录 · {{ foods.length }}
      </div>
      <div
        v-if="foods.length === 0"
        class="mt-4 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500"
      >
        暂无记录，开始记录今天的第一餐吧 🍱
      </div>
      <ul v-else class="mt-3 space-y-2">
        <li
          v-for="f in foods"
          :key="f.id"
          class="flex items-center justify-between rounded-2xl bg-amber-50/70 px-4 py-3"
        >
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-slate-700">
              {{ f.name }}
            </div>
            <div class="text-xs text-slate-500">
              {{ new Date(f.timestamp).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              }) }}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-base font-bold text-amber-600">
              {{ f.calories }} kcal
            </div>
            <button
              class="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-rose-500 transition"
              @click="remove(f.id)"
              aria-label="删除"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Recognition modal -->
    <Transition name="fade">
      <div
        v-if="previewUrl || recognizing || recognizedItems.length > 0"
        class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
        @click.self="closeRecognize"
      >
        <div class="w-full max-w-md animate-pop overflow-hidden rounded-3xl bg-white shadow-soft">
          <div class="flex items-center justify-between px-5 pt-5">
            <div class="text-base font-bold text-slate-800">识别结果</div>
            <button
              class="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              @click="closeRecognize"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <div class="px-5 pt-4 pb-5">
            <img
              v-if="previewUrl"
              :src="previewUrl"
              class="h-48 w-full rounded-2xl object-cover"
              alt="food"
            />
            <div
              v-if="recognizing"
              class="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700"
            >
              ✨ 正在识别中，请稍候...
            </div>
            <div v-else-if="recognizedItems.length > 0" class="mt-4 space-y-2">
              <div
                v-for="(it, idx) in recognizedItems"
                :key="idx"
                class="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3"
              >
                <div>
                  <div class="text-sm font-bold text-slate-700">
                    {{ it.name }}
                  </div>
                  <div class="text-xs text-slate-500">
                    估算 {{ it.calories }} kcal
                  </div>
                </div>
                <button class="btn-primary !py-2 !px-3 text-xs" @click="addRecognized(it)">
                  添加
                </button>
              </div>
              <button
                class="btn-primary w-full"
                @click="addAllRecognized"
              >
                全部添加 ({{ recognizedItems.length }})
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

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

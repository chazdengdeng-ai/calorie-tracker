<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  UtensilsCrossed,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Plus,
  ChevronDown,
} from "lucide-vue-next";
import { useDB, type FoodRecord } from "@/composables/useDB";
import { prettyDate, sumCalories, todayStr } from "@/utils/date";
import { searchFood, type FoodItem } from "@/utils/foodDB";

const db = useDB();

const selectedDate = ref(todayStr());
const foods = ref<FoodRecord[]>([]);
const nameInput = ref("");
const caloriesInput = ref("");
const searchQuery = ref("");
const searchResults = ref<FoodItem[]>([]);
const showSearchPanel = ref(false);
const toast = ref<{ type: "ok" | "err"; msg: string } | null>(null);

const total = computed(() => sumCalories(foods.value));

// 智能搜索：监听搜索词变化
watch(searchQuery, (q) => {
  const trimmed = q.trim();
  if (!trimmed) {
    searchResults.value = [];
    showSearchPanel.value = false;
    return;
  }
  searchResults.value = searchFood(trimmed);
  showSearchPanel.value = true;
});

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

// 从搜索结果中选择一个食物，直接添加
async function pickFoodFromSearch(item: FoodItem) {
  await db.addFood({
    date: selectedDate.value,
    name: item.name,
    calories: item.calories,
  });
  searchQuery.value = "";
  searchResults.value = [];
  showSearchPanel.value = false;
  showToast("ok", `已添加：${item.name} (${item.calories} kcal)`);
  load();
}

// 把搜索结果填充到手动输入区（方便修改）
function fillFromSearch(item: FoodItem) {
  nameInput.value = item.name;
  caloriesInput.value = String(item.calories);
  searchQuery.value = "";
  searchResults.value = [];
  showSearchPanel.value = false;
}

function closeSearchPanel() {
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

    <!-- Smart Food Search -->
    <div class="card animate-fadeUp">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-bold text-slate-700">智能搜食物</div>
          <div class="text-xs text-slate-500">
            输入食物名，从内置食物库快速添加热量
          </div>
        </div>
        <Sparkles class="h-4 w-4 text-amber-500" />
      </div>
      <div class="relative mt-4">
        <div class="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-amber-400 transition">
          <Search class="h-4 w-4 text-slate-400" />
          <input
            v-model="searchQuery"
            class="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
            placeholder="搜索食物，例如：鸡蛋、米饭、牛肉面..."
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

        <!-- Search Results Dropdown -->
        <Transition name="dropdown">
          <div
            v-if="showSearchPanel && searchQuery"
            class="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card"
          >
            <div
              v-if="searchResults.length === 0"
              class="p-4 text-center text-sm text-slate-500"
            >
              没有找到「{{ searchQuery }}」，试试用其他关键词，或直接手动添加 👇
            </div>
            <ul v-else class="max-h-80 overflow-y-auto">
              <li
                v-for="(item, idx) in searchResults"
                :key="idx"
                class="border-b border-slate-50 last:border-b-0"
              >
                <div class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-amber-50/60 transition">
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-semibold text-slate-700">{{ item.name }}</div>
                    <div class="text-xs text-slate-500">{{ item.unit }}</div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="text-sm font-bold text-amber-600">{{ item.calories }} kcal</div>
                    <div class="flex gap-2">
                      <button
                        class="btn-ghost !px-2 !py-1 text-xs"
                        @click="fillFromSearch(item)"
                        title="填入手动区修改"
                      >
                        修改
                      </button>
                      <button
                        class="btn-primary !py-1 !px-3 text-xs"
                        @click="pickFoodFromSearch(item)"
                      >
                        <Plus class="h-3 w-3" />
                        <span>添加</span>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </Transition>
      </div>
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

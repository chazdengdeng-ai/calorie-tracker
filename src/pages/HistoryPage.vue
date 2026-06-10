<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  CalendarDays,
  UtensilsCrossed,
  Flame,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-vue-next";
import {
  useDB,
  type FoodRecord,
  type ExerciseRecord,
} from "@/composables/useDB";
import { prettyDate, sumCalories, todayStr } from "@/utils/date";

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
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-800">
          历史记录
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
          {{ summaries.length }}
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
    </div>

    <div v-if="!hasData" class="card animate-fadeUp text-center">
      <div class="py-10 text-sm text-slate-500">
        还没有任何记录 🌱
        <br />
        回到主页添加你的第一条记录吧！
      </div>
    </div>

    <div v-else class="space-y-3">
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

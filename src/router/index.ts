import { createRouter, createWebHashHistory } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import FoodPage from "@/pages/FoodPage.vue";
import ExercisePage from "@/pages/ExercisePage.vue";
import HistoryPage from "@/pages/HistoryPage.vue";
import WeightPage from "@/pages/WeightPage.vue";

// 部署在 GitHub Pages 子路径时，hash 模式更稳定
// base 由 vite.config.ts 自动根据 GITHUB_REPOSITORY 环境变量设置
const base = import.meta.env.BASE_URL;

const routes = [
  { path: "/", name: "home", component: HomePage },
  { path: "/food", name: "food", component: FoodPage },
  { path: "/exercise", name: "exercise", component: ExercisePage },
  { path: "/history", name: "history", component: HistoryPage },
  { path: "/weight", name: "weight", component: WeightPage },
];

const router = createRouter({
  history: createWebHashHistory(base),
  routes,
});

export default router;

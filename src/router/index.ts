import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import FoodPage from "@/pages/FoodPage.vue";
import ExercisePage from "@/pages/ExercisePage.vue";
import HistoryPage from "@/pages/HistoryPage.vue";

const routes = [
  { path: "/", name: "home", component: HomePage },
  { path: "/food", name: "food", component: FoodPage },
  { path: "/exercise", name: "exercise", component: ExercisePage },
  { path: "/history", name: "history", component: HistoryPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

// 运动热量数据库
// 采用 MET 值（代谢当量）计算：
// 消耗热量 (kcal) = MET × 体重 (kg) × 时长 (小时)
// 参考值：MET 代表相对于静息代谢的能量消耗倍数
export interface ExerciseItem {
  name: string;
  met: number; // MET 值
  keywords: string[];
}

export const exerciseDatabase: ExerciseItem[] = [
  // 步行类
  { name: "慢走（逛街/散步）", met: 2.5, keywords: ["慢走", "散步", "逛街", "走路", "步行", "漫步"] },
  { name: "快走", met: 4.3, keywords: ["快走", "健走", "暴走"] },
  { name: "中速步行（5km/h）", met: 3.5, keywords: ["步行", "走路"] },
  { name: "快走爬坡", met: 6.3, keywords: ["爬坡", "登山走"] },
  { name: "徒步", met: 4.0, keywords: ["徒步", "远足", "hiking"] },
  { name: "爬楼梯", met: 4.0, keywords: ["爬楼梯", "楼梯", "stair"] },

  // 跑步类
  { name: "慢跑（8km/h）", met: 8.3, keywords: ["慢跑", "jog", "跑步"] },
  { name: "跑步（10km/h）", met: 9.8, keywords: ["跑步", "run", "10公里"] },
  { name: "快跑（12km/h）", met: 12.3, keywords: ["快跑", "冲刺跑"] },
  { name: "跑步机（9km/h）", met: 8.8, keywords: ["跑步机", "treadmill"] },
  { name: "户外跑", met: 9.5, keywords: ["户外跑", "路跑", "晨跑", "夜跑"] },

  // 骑行类
  { name: "骑行（慢速 <16km/h）", met: 4.0, keywords: ["骑车", "骑行", "自行车", "bike"] },
  { name: "骑行（中速 16-19km/h）", met: 6.8, keywords: ["骑行", "骑车", "单车"] },
  { name: "骑行（快速 19-22km/h）", met: 8.0, keywords: ["快速骑行", "动感单车"] },
  { name: "动感单车", met: 7.5, keywords: ["动感单车", "spinning"] },

  // 有氧/健身操
  { name: "有氧操（低强度）", met: 5.0, keywords: ["有氧操", "aerobics", "健身操"] },
  { name: "有氧操（高强度）", met: 7.5, keywords: ["高强度有氧", "hiit"] },
  { name: "HIIT 间歇训练", met: 10.0, keywords: ["hiit", "间歇训练", "高强度间歇"] },
  { name: "跳操", met: 7.0, keywords: ["跳操", "健美操"] },
  { name: "跳绳（慢）", met: 8.5, keywords: ["跳绳", "jumprope"] },
  { name: "跳绳（快）", met: 12.3, keywords: ["快速跳绳"] },
  { name: "开合跳", met: 8.0, keywords: ["开合跳", "jumping jack"] },
  { name: "波比跳", met: 12.0, keywords: ["波比跳", "burpee"] },

  // 力量训练
  { name: "力量训练（轻）", met: 3.5, keywords: ["力量", "撸铁", "哑铃", "weight"] },
  { name: "力量训练（中）", met: 5.0, keywords: ["力量训练", "举重", "健身"] },
  { name: "力量训练（高强度）", met: 8.0, keywords: ["高强度力量", "力量", "重训"] },
  { name: "俯卧撑", met: 4.0, keywords: ["俯卧撑", "pushup"] },
  { name: "深蹲", met: 3.5, keywords: ["深蹲", "squat"] },
  { name: "平板支撑", met: 3.8, keywords: ["平板支撑", "plank", "平板"] },
  { name: "引体向上", met: 8.0, keywords: ["引体向上", "pullup"] },
  { name: "CrossFit", met: 11.0, keywords: ["crossfit", "cf"] },

  // 球类运动
  { name: "瑜伽", met: 3.0, keywords: ["瑜伽", "yoga", "拉伸"] },
  { name: "普拉提", met: 3.5, keywords: ["普拉提", "pilates"] },
  { name: "羽毛球", met: 5.5, keywords: ["羽毛球", "badminton"] },
  { name: "乒乓球", met: 4.0, keywords: ["乒乓球", "乒乓", "table tennis"] },
  { name: "网球", met: 7.3, keywords: ["网球", "tennis"] },
  { name: "篮球", met: 8.0, keywords: ["篮球", "basketball"] },
  { name: "足球", met: 10.0, keywords: ["足球", "soccer"] },
  { name: "排球", met: 4.0, keywords: ["排球", "volleyball"] },
  { name: "游泳（自由泳）", met: 8.3, keywords: ["游泳", "自由泳", "swim"] },
  { name: "游泳（蛙泳）", met: 6.8, keywords: ["蛙泳", "游泳"] },
  { name: "游泳（仰泳）", met: 6.0, keywords: ["仰泳", "游泳"] },
  { name: "游泳（蝶泳）", met: 13.8, keywords: ["蝶泳", "游泳"] },
  { name: "划船机", met: 7.0, keywords: ["划船机", "划船", "rower"] },
  { name: "高尔夫", met: 4.8, keywords: ["高尔夫", "golf"] },
  { name: "棒球/垒球", met: 5.0, keywords: ["棒球", "垒球", "baseball"] },

  // 舞蹈
  { name: "跳舞（慢）", met: 3.5, keywords: ["跳舞", "舞蹈", "dance"] },
  { name: "跳舞（快）", met: 7.8, keywords: ["街舞", "zumba", "尊巴"] },
  { name: "Zumba / 尊巴", met: 7.5, keywords: ["zumba", "尊巴"] },

  // 其他
  { name: "做家务/打扫", met: 3.5, keywords: ["家务", "打扫", "clean"] },
  { name: "拖地/擦地", met: 3.0, keywords: ["拖地", "擦地"] },
  { name: "爬楼机", met: 9.0, keywords: ["爬楼机", "stairmaster"] },
  { name: "椭圆机", met: 5.0, keywords: ["椭圆机", "elliptical"] },
  { name: "滑雪机", met: 9.0, keywords: ["滑雪机"] },
];

// 计算消耗热量 (kcal)
// 默认体重 60kg，会随用户设置动态覆盖
export function calcCalories(
  met: number,
  minutes: number,
  weightKg: number = 60,
): number {
  if (met <= 0 || minutes <= 0 || weightKg <= 0) return 0;
  return Math.round(met * weightKg * (minutes / 60));
}

// 搜索函数
export function searchExercise(
  query: string,
  limit: number = 10,
): ExerciseItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: { item: ExerciseItem; score: number }[] = [];

  for (const item of exerciseDatabase) {
    let score = 0;
    if (item.name.toLowerCase() === q) score += 100;
    if (item.name.toLowerCase().includes(q)) score += 50;
    for (const kw of item.keywords) {
      if (kw.toLowerCase() === q) score += 30;
      if (kw.toLowerCase().includes(q)) score += 10;
    }
    if (score > 0) results.push({ item, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map((r) => r.item);
}

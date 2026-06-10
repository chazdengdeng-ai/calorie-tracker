// 常见食物热量数据库 (单位: kcal, 默认份量)
export interface FoodItem {
  name: string;
  calories: number;
  unit: string; // 份量说明
  keywords: string[]; // 搜索关键词
}

export const foodDatabase: FoodItem[] = [
  // 主食
  { name: "米饭", calories: 230, unit: "一碗（约200g）", keywords: ["米饭", "白饭", "米", "饭", "白米饭", "大米"] },
  { name: "馒头", calories: 220, unit: "一个（约100g）", keywords: ["馒头", "包子", "白面馒头"] },
  { name: "面条", calories: 280, unit: "一碗（约150g）", keywords: ["面条", "面", "煮面", "汤面", "拌面"] },
  { name: "牛肉面", calories: 450, unit: "一碗", keywords: ["牛肉面", "牛肉拉面", "拉面", "兰州拉面"] },
  { name: "饺子", calories: 250, unit: "10个（约120g）", keywords: ["饺子", "水饺", "交子"] },
  { name: "包子（肉包）", calories: 230, unit: "一个（约100g）", keywords: ["包子", "肉包", "菜包", "鲜肉包"] },
  { name: "煎饼", calories: 350, unit: "一个", keywords: ["煎饼", "杂粮煎饼", "煎饼果子"] },
  { name: "三明治", calories: 300, unit: "一个", keywords: ["三明治", "sandwich", "三文治"] },
  { name: "汉堡", calories: 550, unit: "一个", keywords: ["汉堡", "hamburger", "burger", "汉堡包"] },
  { name: "披萨", calories: 285, unit: "一片（约100g）", keywords: ["披萨", "pizza", "比萨", "匹萨"] },
  { name: "寿司", calories: 150, unit: "一份（6个）", keywords: ["寿司", "sushi", "饭团"] },
  { name: "炒饭", calories: 450, unit: "一盘（约250g）", keywords: ["炒饭", "蛋炒饭", "扬州炒饭"] },
  { name: "粥（白粥）", calories: 70, unit: "一碗（约250g）", keywords: ["粥", "白粥", "稀饭", "米粥"] },
  { name: "红薯", calories: 130, unit: "一个中等大小", keywords: ["红薯", "地瓜", "番薯", "甘薯"] },
  { name: "燕麦片", calories: 150, unit: "40克（干）", keywords: ["燕麦", "麦片", "oatmeal", "燕麦片"] },
  { name: "玉米", calories: 150, unit: "一根（约200g）", keywords: ["玉米", "苞米", "玉蜀黍"] },
  { name: "面包（白面包）", calories: 260, unit: "两片（约100g）", keywords: ["面包", "吐司", "toast", "bread"] },
  { name: "全麦面包", calories: 240, unit: "两片（约100g）", keywords: ["全麦面包", "全麦吐司", "全麦"] },
  { name: "小笼包", calories: 300, unit: "一笼（8个）", keywords: ["小笼包", "小笼馒头"] },
  { name: "煎饺", calories: 280, unit: "10个", keywords: ["煎饺", "锅贴"] },
  { name: "肠粉", calories: 250, unit: "一份", keywords: ["肠粉", "蒸肠粉"] },

  // 蛋白质/肉类
  { name: "鸡肉（水煮）", calories: 165, unit: "100克", keywords: ["鸡肉", "鸡", "水煮鸡", "白切鸡"] },
  { name: "鸡肉（油炸）", calories: 290, unit: "100克", keywords: ["炸鸡", "油炸鸡", "fried chicken", "鸡翅"] },
  { name: "鸡腿", calories: 260, unit: "一个（约120g）", keywords: ["鸡腿", "鸡大腿", "chicken leg"] },
  { name: "鸡胸肉", calories: 180, unit: "一份（约150g）", keywords: ["鸡胸", "鸡胸肉", "chicken breast"] },
  { name: "牛肉", calories: 250, unit: "100克", keywords: ["牛肉", "牛", "steak", "牛排"] },
  { name: "牛排", calories: 500, unit: "一份（约200g）", keywords: ["牛排", "牛扒", "beef steak"] },
  { name: "猪肉", calories: 240, unit: "100克", keywords: ["猪肉", "猪", "pork"] },
  { name: "红烧肉", calories: 400, unit: "一份", keywords: ["红烧肉", "东坡肉"] },
  { name: "回锅肉", calories: 500, unit: "一份", keywords: ["回锅肉"] },
  { name: "鱼", calories: 200, unit: "一份（约150g）", keywords: ["鱼", "蒸鱼", "水煮鱼", "fish"] },
  { name: "三文鱼", calories: 280, unit: "一份（约100g）", keywords: ["三文鱼", "鲑鱼", "salmon", "生鱼片"] },
  { name: "虾", calories: 99, unit: "100克", keywords: ["虾", "基围虾", "shrimp", "prawn"] },
  { name: "鸡蛋", calories: 78, unit: "一个（约50g）", keywords: ["鸡蛋", "蛋", "egg", "水煮蛋"] },
  { name: "煎蛋", calories: 110, unit: "一个", keywords: ["煎蛋", "荷包蛋", "fried egg"] },
  { name: "茶叶蛋", calories: 82, unit: "一个", keywords: ["茶叶蛋"] },
  { name: "豆腐", calories: 80, unit: "一份（约200g）", keywords: ["豆腐", "麻婆豆腐", "tofu"] },
  { name: "豆浆", calories: 54, unit: "一杯（约250ml）", keywords: ["豆浆", "豆奶", "soy milk"] },
  { name: "火腿", calories: 150, unit: "两片（约50g）", keywords: ["火腿", "ham"] },
  { name: "培根", calories: 210, unit: "三片（约50g）", keywords: ["培根", "bacon"] },
  { name: "香肠", calories: 230, unit: "一根（约70g）", keywords: ["香肠", "腊肠", "hot dog"] },

  // 蔬菜
  { name: "西兰花", calories: 55, unit: "一份（约200g）", keywords: ["西兰花", "花椰菜", "broccoli"] },
  { name: "番茄", calories: 40, unit: "一个中等大小", keywords: ["番茄", "西红柿", "tomato"] },
  { name: "黄瓜", calories: 30, unit: "一根", keywords: ["黄瓜", "青瓜", "cucumber"] },
  { name: "胡萝卜", calories: 45, unit: "一根", keywords: ["胡萝卜", "红萝卜", "carrot"] },
  { name: "土豆", calories: 110, unit: "一个中等大小", keywords: ["土豆", "马铃薯", "potato"] },
  { name: "薯条", calories: 400, unit: "一份中份", keywords: ["薯条", "french fries", "炸薯条"] },
  { name: "生菜", calories: 15, unit: "一份沙拉", keywords: ["生菜", "莴苣", "lettuce"] },
  { name: "白菜", calories: 25, unit: "一份（约200g）", keywords: ["白菜", "大白菜"] },
  { name: "菠菜", calories: 40, unit: "一份（约200g）", keywords: ["菠菜", "菠菜汤"] },
  { name: "炒青菜", calories: 110, unit: "一份", keywords: ["炒青菜", "青菜"] },
  { name: "地三鲜", calories: 320, unit: "一份", keywords: ["地三鲜"] },
  { name: "酸辣土豆丝", calories: 180, unit: "一份", keywords: ["酸辣土豆丝", "土豆丝"] },
  { name: "凉拌黄瓜", calories: 50, unit: "一份", keywords: ["凉拌黄瓜"] },

  // 水果
  { name: "苹果", calories: 95, unit: "一个中等大小", keywords: ["苹果", "apple", "红富士"] },
  { name: "香蕉", calories: 105, unit: "一根", keywords: ["香蕉", "banana"] },
  { name: "橙子", calories: 62, unit: "一个", keywords: ["橙子", "橘子", "orange"] },
  { name: "葡萄", calories: 104, unit: "一串（约150g）", keywords: ["葡萄", "提子", "grape"] },
  { name: "西瓜", calories: 85, unit: "一牙（约250g）", keywords: ["西瓜", "watermelon"] },
  { name: "草莓", calories: 49, unit: "一碗（约150g）", keywords: ["草莓", "strawberry"] },
  { name: "蓝莓", calories: 85, unit: "一碗（约150g）", keywords: ["蓝莓", "blueberry"] },
  { name: "芒果", calories: 200, unit: "一个", keywords: ["芒果", "mango"] },
  { name: "梨", calories: 100, unit: "一个中等大小", keywords: ["梨", "pear", "鸭梨"] },
  { name: "火龙果", calories: 100, unit: "一个", keywords: ["火龙果", "pitaya", "dragon fruit"] },
  { name: "菠萝", calories: 83, unit: "一份（约200g）", keywords: ["菠萝", "凤梨", "pineapple"] },
  { name: "猕猴桃", calories: 42, unit: "一个", keywords: ["猕猴桃", "奇异果", "kiwi"] },
  { name: "樱桃", calories: 90, unit: "一碗（约150g）", keywords: ["樱桃", "车厘子", "cherry"] },
  { name: "桃子", calories: 59, unit: "一个", keywords: ["桃子", "桃", "水蜜桃"] },

  // 零食/小吃
  { name: "薯片", calories: 160, unit: "一小包（约30g）", keywords: ["薯片", "chips", "potato chips"] },
  { name: "巧克力", calories: 230, unit: "一块（约40g）", keywords: ["巧克力", "chocolate"] },
  { name: "饼干", calories: 140, unit: "两片（约30g）", keywords: ["饼干", "cookies", "曲奇"] },
  { name: "蛋糕", calories: 350, unit: "一块", keywords: ["蛋糕", "cake", "生日蛋糕"] },
  { name: "冰淇淋", calories: 240, unit: "一球（约100g）", keywords: ["冰淇淋", "ice cream", "冰激凌"] },
  { name: "薯片（大包）", calories: 540, unit: "一包（约100g）", keywords: [] },
  { name: "坚果（混合）", calories: 180, unit: "一小把（约30g）", keywords: ["坚果", "mixed nuts"] },
  { name: "花生", calories: 160, unit: "一小把（约30g）", keywords: ["花生", "peanut", "花生米"] },
  { name: "核桃", calories: 185, unit: "3个（约30g）", keywords: ["核桃", "walnut"] },
  { name: "爆米花", calories: 150, unit: "一小桶", keywords: ["爆米花", "popcorn"] },
  { name: "关东煮", calories: 300, unit: "一串组合", keywords: ["关东煮"] },
  { name: "麻辣烫", calories: 500, unit: "一份", keywords: ["麻辣烫"] },
  { name: "烤串（综合）", calories: 200, unit: "一串", keywords: ["烤串", "烧烤", "烤肉串"] },
  { name: "方便面", calories: 440, unit: "一包", keywords: ["方便面", "泡面", "instant noodles"] },
  { name: "章鱼小丸子", calories: 300, unit: "一份（8个）", keywords: ["章鱼小丸子", "章鱼烧"] },
  { name: "辣条", calories: 200, unit: "一包", keywords: ["辣条"] },
  { name: "肉夹馍", calories: 450, unit: "一个", keywords: ["肉夹馍"] },
  { name: "煎饼果子", calories: 400, unit: "一个", keywords: ["煎饼果子"] },

  // 饮料
  { name: "可乐", calories: 140, unit: "一瓶（330ml）", keywords: ["可乐", "coke", "coca cola", "可口可乐"] },
  { name: "雪碧", calories: 140, unit: "一瓶（330ml）", keywords: ["雪碧", "sprite"] },
  { name: "果汁（橙汁）", calories: 115, unit: "一杯（250ml）", keywords: ["果汁", "橙汁", "juice"] },
  { name: "奶茶", calories: 250, unit: "一杯（中杯）", keywords: ["奶茶", "milk tea", "珍珠奶茶"] },
  { name: "咖啡（黑咖啡）", calories: 5, unit: "一杯", keywords: ["咖啡", "coffee", "黑咖啡"] },
  { name: "咖啡（拿铁）", calories: 190, unit: "一杯（中杯）", keywords: ["拿铁", "latte", "咖啡拿铁"] },
  { name: "啤酒", calories: 150, unit: "一瓶（330ml）", keywords: ["啤酒", "beer"] },
  { name: "牛奶", calories: 150, unit: "一杯（250ml）", keywords: ["牛奶", "milk", "纯牛奶"] },
  { name: "酸奶", calories: 120, unit: "一杯（200g）", keywords: ["酸奶", "yogurt"] },
  { name: "绿茶", calories: 2, unit: "一杯", keywords: ["绿茶", "green tea"] },
  { name: "矿泉水", calories: 0, unit: "一瓶", keywords: ["矿泉水", "water", "水"] },
  { name: "柠檬水", calories: 60, unit: "一杯", keywords: ["柠檬水", "lemonade"] },
  { name: "豆浆（加糖）", calories: 120, unit: "一杯", keywords: ["甜豆浆"] },
  { name: "椰子水", calories: 46, unit: "一个（约200ml）", keywords: ["椰子水", "椰青"] },

  // 中式菜肴
  { name: "宫保鸡丁", calories: 430, unit: "一份", keywords: ["宫保鸡丁"] },
  { name: "鱼香肉丝", calories: 400, unit: "一份", keywords: ["鱼香肉丝"] },
  { name: "番茄炒蛋", calories: 320, unit: "一份", keywords: ["番茄炒蛋", "西红柿炒鸡蛋"] },
  { name: "青椒肉丝", calories: 300, unit: "一份", keywords: ["青椒肉丝"] },
  { name: "麻婆豆腐", calories: 270, unit: "一份", keywords: ["麻婆豆腐"] },
  { name: "鱼香茄子", calories: 330, unit: "一份", keywords: ["鱼香茄子"] },
  { name: "糖醋里脊", calories: 460, unit: "一份", keywords: ["糖醋里脊"] },
  { name: "水煮鱼", calories: 550, unit: "一份", keywords: ["水煮鱼"] },
  { name: "酸菜鱼", calories: 420, unit: "一份", keywords: ["酸菜鱼"] },
  { name: "番茄鸡蛋面", calories: 450, unit: "一碗", keywords: ["番茄鸡蛋面", "西红柿鸡蛋面"] },
  { name: "炸酱面", calories: 480, unit: "一碗", keywords: ["炸酱面"] },
  { name: "担担面", calories: 450, unit: "一碗", keywords: ["担担面"] },
  { name: "阳春面", calories: 250, unit: "一碗", keywords: ["阳春面"] },
  { name: "过桥米线", calories: 400, unit: "一份", keywords: ["米线", "过桥米线"] },
  { name: "螺蛳粉", calories: 550, unit: "一碗", keywords: ["螺蛳粉"] },

  // 西式餐点
  { name: "意大利面（肉酱）", calories: 500, unit: "一盘", keywords: ["意大利面", "意面", "pasta", "spaghetti"] },
  { name: "凯撒沙拉", calories: 350, unit: "一份", keywords: ["凯撒沙拉", "caesar salad"] },
  { name: "鸡肉卷", calories: 400, unit: "一个", keywords: ["鸡肉卷", "wrap"] },
  { name: "热狗", calories: 350, unit: "一个", keywords: ["热狗", "hotdog"] },
  { name: "薯条（大份）", calories: 500, unit: "一份大份", keywords: [] },
  { name: "炸鸡套餐", calories: 900, unit: "一份套餐", keywords: ["炸鸡", "肯德基", "麦当劳", "麦乐鸡"] },
  { name: "巨无霸", calories: 590, unit: "一个", keywords: ["巨无霸", "big mac"] },

  // 早餐
  { name: "油条", calories: 270, unit: "一根", keywords: ["油条"] },
  { name: "豆浆+油条", calories: 320, unit: "一套", keywords: ["豆浆油条"] },
  { name: "牛奶麦片", calories: 280, unit: "一碗", keywords: ["麦片", "牛奶麦片", "cereal"] },
  { name: "煎蛋吐司", calories: 350, unit: "一份", keywords: [] },
  { name: "皮蛋瘦肉粥", calories: 300, unit: "一碗", keywords: ["皮蛋瘦肉粥"] },
  { name: "煎饼果子加蛋", calories: 450, unit: "一个", keywords: [] },
  { name: "包子+豆浆", calories: 280, unit: "一套（2包子+1豆浆", keywords: [] },
];

// 搜索函数
export function searchFood(query: string, limit: number = 10): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: { item: FoodItem; score: number }[] = [];

  for (const item of foodDatabase) {
    let score = 0;

    // 名称完全匹配，最高优先级
    if (item.name.toLowerCase() === q) score += 100;

    // 名称包含关键词
    if (item.name.toLowerCase().includes(q)) score += 50;

    // 关键词匹配
    for (const kw of item.keywords) {
      if (kw.toLowerCase() === q) score += 30;
      if (kw.toLowerCase().includes(q)) score += 10;
    }

    if (score > 0) {
      results.push({ item, score });
    }
  }

  // 按相关度排序
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map((r) => r.item);
}

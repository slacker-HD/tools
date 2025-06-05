// 食物数据 - 扩展到100个项目（纯食物，不含饮品）
const foods = [
  { id: 1, name: "宫保鸡丁饭", description: "经典川菜，香辣下饭", category: "中餐", icon: "fa-utensils", color: "food-chinese" },
  { id: 2, name: "番茄鸡蛋面", description: "家常口味，营养均衡", category: "中餐", icon: "fa-utensils", color: "food-chinese" },
  { id: 3, name: "汉堡套餐", description: "美式快餐，牛肉饼配蔬菜", category: "快餐", icon: "fa-hamburger", color: "food-fast" },
  { id: 4, name: "寿司拼盘", description: "新鲜生鱼片搭配软糯米饭", category: "日料", icon: "fa-bowl-food", color: "food-japanese" },
  { id: 5, name: "麻辣烫", description: "自选食材，麻辣鲜香", category: "中餐", icon: "fa-fire", color: "food-chinese" },
  { id: 6, name: "沙拉碗", description: "健康低卡，多种蔬菜搭配", category: "西餐", icon: "fa-leaf", color: "food-western" },
  { id: 7, name: "炸鸡排饭", description: "香酥鸡排，搭配蔬菜和米饭", category: "快餐", icon: "fa-drumstick-bite", color: "food-fast" },
  { id: 8, name: "螺蛳粉", description: "广西特色，酸辣过瘾", category: "小吃", icon: "fa-bowl-rice", color: "food-snack" },
  { id: 9, name: "饺子", description: "传统面食，多种馅料可选", category: "中餐", icon: "fa-dumpling", color: "food-chinese" },
  { id: 10, name: "披萨", description: "意大利经典美食，多种口味可选", category: "西餐", icon: "fa-pizza-slice", color: "food-western" },
  { id: 11, name: "重庆小面", description: "麻辣鲜香，口感丰富", category: "小吃", icon: "fa-bowl-food", color: "food-snack" },
  { id: 12, name: "叉烧饭", description: "港式经典，甜咸适中", category: "中餐", icon: "fa-bowl-rice", color: "food-chinese" },
  { id: 13, name: "意大利面", description: "西式面食，多种酱汁可选", category: "西餐", icon: "fa-utensils", color: "food-western" },
  { id: 14, name: "烤肉拌饭", description: "香嫩烤肉，搭配蔬菜和米饭", category: "中餐", icon: "fa-fire", color: "food-chinese" },
  { id: 15, name: "炒河粉", description: "广东特色，口感爽滑", category: "中餐", icon: "fa-bowl-food", color: "food-chinese" },
  { id: 16, name: "三明治", description: "简易早餐，营养丰富", category: "西餐", icon: "fa-bread-slice", color: "food-western" },
  { id: 17, name: "烤肉串", description: "街边小吃，香气四溢", category: "小吃", icon: "fa-fire", color: "food-snack" },
  { id: 18, name: "炒饭", description: "简单方便，口味多样", category: "中餐", icon: "fa-bowl-rice", color: "food-chinese" },
  { id: 19, name: "拉面", description: "日式经典，汤浓面劲", category: "日料", icon: "fa-bowl-food", color: "food-japanese" },
  { id: 20, name: "炸鸡", description: "酥脆外皮，多汁鸡肉", category: "快餐", icon: "fa-drumstick-bite", color: "food-fast" },
  { id: 21, name: "酸菜鱼", description: "酸辣开胃，鱼肉鲜嫩", category: "中餐", icon: "fa-fish", color: "food-chinese" },
  { id: 22, name: "咖喱饭", description: "浓郁咖喱，搭配嫩滑鸡肉", category: "日料", icon: "fa-bowl-rice", color: "food-japanese" },
  { id: 23, name: "小龙虾", description: "夏季热门，麻辣鲜香", category: "中餐", icon: "fa-shrimp", color: "food-chinese" },
  { id: 24, name: "春卷", description: "外酥里嫩，传统小吃", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 25, name: "烤冷面", description: "东北特色，Q弹有嚼劲", category: "小吃", icon: "fa-fire", color: "food-snack" },
  { id: 26, name: "汉堡王皇堡", description: "双层牛肉，口感丰富", category: "快餐", icon: "fa-hamburger", color: "food-fast" },
  { id: 27, name: "肯德基吮指原味鸡", description: "经典炸鸡，吮指回味", category: "快餐", icon: "fa-drumstick-bite", color: "food-fast" },
  { id: 28, name: "麦当劳巨无霸", description: "双层牛肉，经典汉堡", category: "快餐", icon: "fa-hamburger", color: "food-fast" },
  { id: 29, name: "必胜客意式肉酱面", description: "意式风味，肉酱浓郁", category: "西餐", icon: "fa-utensils", color: "food-western" },
  { id: 30, name: "海底捞火锅", description: "知名火锅，服务周到", category: "中餐", icon: "fa-fire", color: "food-chinese" },
  { id: 31, name: "西贝莜面村", description: "西北风味，健康食材", category: "中餐", icon: "fa-bowl-food", color: "food-chinese" },
  { id: 32, name: "外婆家红烧肉", description: "浓油赤酱，肥而不腻", category: "中餐", icon: "fa-drumstick-bite", color: "food-chinese" },
  { id: 33, name: "全聚德烤鸭", description: "北京名菜，皮酥肉嫩", category: "中餐", icon: "fa-drumstick-bite", color: "food-chinese" },
  { id: 34, name: "味千拉面", description: "日式拉面，骨汤浓郁", category: "日料", icon: "fa-bowl-food", color: "food-japanese" },
  { id: 35, name: "吉野家牛肉饭", description: "日式快餐，经济实惠", category: "日料", icon: "fa-bowl-rice", color: "food-japanese" },
  { id: 36, name: "鲜芋仙招牌芋圆", description: "台湾甜品，料足味美", category: "小吃", icon: "fa-bowl-food", color: "food-snack" },
  { id: 37, name: "DQ暴风雪", description: "冰淇淋甜点，口感绵密", category: "西餐", icon: "fa-ice-cream", color: "food-western" },
  { id: 38, name: "哈根达斯冰淇淋", description: "高端冰淇淋，口感丝滑", category: "西餐", icon: "fa-ice-cream", color: "food-western" },
  { id: 39, name: "满记甜品芒果班戟", description: "港式甜品，芒果香甜", category: "小吃", icon: "fa-cake", color: "food-snack" },
  { id: 40, name: "85度C黑森林蛋糕", description: "欧式蛋糕，巧克力浓郁", category: "西餐", icon: "fa-cake", color: "food-western" },
  { id: 41, name: "面包新语红豆包", description: "松软面包，红豆沙香甜", category: "西餐", icon: "fa-bread-slice", color: "food-western" },
  { id: 42, name: "好利来半熟芝士", description: "网红甜品，口感绵密", category: "西餐", icon: "fa-cake", color: "food-western" },
  { id: 43, name: "绝味鸭脖", description: "麻辣鲜香，休闲零食", category: "小吃", icon: "fa-drumstick-bite", color: "food-snack" },
  { id: 44, name: "周黑鸭", description: "甜辣口味，肉质紧实", category: "小吃", icon: "fa-drumstick-bite", color: "food-snack" },
  { id: 45, name: "来伊份芒果干", description: "酸甜可口，天然健康", category: "小吃", icon: "fa-apple-whole", color: "food-snack" },
  { id: 46, name: "良品铺子猪肉脯", description: "肉质鲜美，嚼劲十足", category: "小吃", icon: "fa-drumstick-bite", color: "food-snack" },
  { id: 47, name: "三只松鼠坚果礼盒", description: "多种坚果，营养丰富", category: "小吃", icon: "fa-nut", color: "food-snack" },
  { id: 48, name: "海底捞自热火锅", description: "方便火锅，随时随地享用", category: "中餐", icon: "fa-fire", color: "food-chinese" },
  { id: 49, name: "康师傅红烧牛肉面", description: "经典泡面，方便快捷", category: "快餐", icon: "fa-bowl-food", color: "food-fast" },
  { id: 50, name: "统一老坛酸菜面", description: "酸爽开胃，口感独特", category: "快餐", icon: "fa-bowl-food", color: "food-fast" },
  { id: 51, name: "辛拉面", description: "韩式泡面，辣味十足", category: "快餐", icon: "fa-bowl-food", color: "food-fast" },
  { id: 52, name: "三养火鸡面", description: "超辣泡面，挑战味蕾", category: "快餐", icon: "fa-bowl-food", color: "food-fast" },
  { id: 53, name: "王饱饱麦片", description: "网红麦片，健康早餐", category: "西餐", icon: "fa-bowl-food", color: "food-western" },
  { id: 54, name: "李子柒藕粉", description: "传统小吃，口感细腻", category: "小吃", icon: "fa-bowl-food", color: "food-snack" },
  { id: 55, name: "阿宽红油面皮", description: "麻辣鲜香，口感筋道", category: "小吃", icon: "fa-bowl-food", color: "food-snack" },
  { id: 56, name: "卫龙大面筋", description: "经典辣条，麻辣过瘾", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 57, name: "旺旺雪饼", description: "米果零食，香甜酥脆", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 58, name: "乐事薯片", description: "休闲零食，多种口味", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 59, name: "奥利奥饼干", description: "经典饼干，夹心美味", category: "西餐", icon: "fa-cookie", color: "food-western" },
  { id: 60, name: "德芙巧克力", description: "丝滑巧克力，甜蜜享受", category: "西餐", icon: "fa-candy", color: "food-western" },
  { id: 61, name: "费列罗榛果巧克力", description: "高端巧克力，口感丰富", category: "西餐", icon: "fa-candy", color: "food-western" },
  { id: 62, name: "芝士蛋糕", description: "浓郁芝士，口感绵密", category: "西餐", icon: "fa-cake", color: "food-western" },
  { id: 63, name: "提拉米苏", description: "意大利经典甜点，咖啡酒香", category: "西餐", icon: "fa-cake", color: "food-western" },
  { id: 64, name: "抹茶红豆大福", description: "日式甜点，软糯香甜", category: "日料", icon: "fa-cookie", color: "food-japanese" },
  { id: 65, name: "铜锣烧", description: "日式甜点，红豆馅夹心", category: "日料", icon: "fa-cookie", color: "food-japanese" },
  { id: 66, name: "蛋挞", description: "港式甜点，酥脆外皮", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 67, name: "牛角包", description: "法式面包，酥脆多层", category: "西餐", icon: "fa-bread-slice", color: "food-western" },
  { id: 68, name: "甜甜圈", description: "美式甜点，香甜可口", category: "西餐", icon: "fa-cookie", color: "food-western" },
  { id: 69, name: "榴莲酥", description: "港式点心，榴莲香味浓郁", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 70, name: "老婆饼", description: "中式甜点，冬瓜馅", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 71, name: "叉烧包", description: "港式点心，甜咸适中", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 72, name: "虾饺", description: "粤式点心，鲜虾内馅", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 73, name: "烧麦", description: "传统点心，糯米猪肉馅", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 74, name: "肠粉", description: "广东特色，口感嫩滑", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 75, name: "油条", description: "传统早餐，金黄酥脆", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 76, name: "煎饼果子", description: "天津特色，香脆可口", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 77, name: "肉夹馍", description: "陕西特色，外酥里嫩", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 78, name: "凉皮", description: "陕西特色，酸辣开胃", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 79, name: "肉包子", description: "传统面食，猪肉馅", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 80, name: "豆沙包", description: "传统面食，红豆馅", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 81, name: "灌汤包", description: "传统小吃，汤汁丰富", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 82, name: "蟹黄包", description: "江苏特色，蟹黄鲜美", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 83, name: "春饼", description: "传统面食，卷菜食用", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 84, name: "手抓饼", description: "台湾特色，酥脆多层", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 85, name: "葱油饼", description: "传统小吃，葱香浓郁", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 86, name: "韭菜盒子", description: "传统面食，韭菜鸡蛋馅", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 87, name: "锅贴", description: "传统小吃，底部酥脆", category: "小吃", icon: "fa-bread-slice", color: "food-snack" },
  { id: 88, name: "烤红薯", description: "冬季热食，香甜绵软", category: "小吃", icon: "fa-fire", color: "food-snack" },
  { id: 89, name: "糖炒栗子", description: "秋季零食，香甜可口", category: "小吃", icon: "fa-nut", color: "food-snack" },
  { id: 90, name: "糖葫芦", description: "传统小吃，酸甜开胃", category: "小吃", icon: "fa-apple-whole", color: "food-snack" },
  { id: 91, name: "棉花糖", description: "休闲零食，柔软香甜", category: "小吃", icon: "fa-candy", color: "food-snack" },
  { id: 92, name: "爆米花", description: "影院零食，香脆可口", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 93, name: "沙琪玛", description: "传统糕点，甜脆可口", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 94, name: "麻花", description: "天津特色，香酥脆口", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 95, name: "江米条", description: "传统小吃，香甜酥脆", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 96, name: "驴打滚", description: "北京特色，软糯香甜", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 97, name: "豌豆黄", description: "北京特色，清凉爽口", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 98, name: "绿豆糕", description: "传统糕点，清甜可口", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 99, name: "芝麻糖", description: "传统小吃，芝麻香味", category: "小吃", icon: "fa-cookie", color: "food-snack" },
  { id: 100, name: "牛皮糖", description: "江苏特色，Q弹有嚼劲", category: "小吃", icon: "fa-cookie", color: "food-snack" }
];

// 饮品数据 - 扩展到100个项目
const beverages = [
  { id: 1, name: "珍珠奶茶", description: "经典奶茶，Q弹珍珠", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 2, name: "美式咖啡", description: "浓郁咖啡，提神醒脑", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 3, name: "拿铁", description: "牛奶与咖啡的完美融合", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 4, name: "芒果汁", description: "新鲜芒果现榨，口感浓郁", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 5, name: "柠檬茶", description: "清爽解腻，酸甜可口", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 6, name: "冰红茶", description: "经典茶饮，冰镇更爽口", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 7, name: "卡布奇诺", description: "泡沫丰富，口感绵密", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 8, name: "杨枝甘露", description: "芒果、西柚与西米的美妙组合", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 9, name: "冰美式", description: "夏日清凉，美式咖啡加冰", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 10, name: "橙汁", description: "新鲜橙子现榨，富含维C", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 11, name: "草莓奶昔", description: "香甜草莓与牛奶的混合", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 12, name: "乌龙茶", description: "半发酵茶，香气馥郁", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 13, name: "焦糖玛奇朵", description: "香甜焦糖与咖啡的完美结合", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 14, name: "西瓜汁", description: "夏日解暑必备，清甜爽口", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 15, name: "抹茶拿铁", description: "日式抹茶与牛奶的融合", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 16, name: "气泡水", description: "清爽气泡，多种口味可选", category: "汽水", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 17, name: "柚子茶", description: "酸甜柚子，开胃解腻", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 18, name: "热可可", description: "温暖香浓，冬日必备", category: "其他", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 19, name: "苹果汁", description: "新鲜苹果现榨，天然健康", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 20, name: "可乐", description: "经典碳酸饮料，提神解渴", category: "汽水", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 21, name: "雪碧", description: "清爽柠檬味，碳酸饮料", category: "汽水", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 22, name: "元气森林", description: "无糖气泡水，多种口味", category: "汽水", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 23, name: "喜茶多肉葡萄", description: "人气茶饮，果肉饱满", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 24, name: "奈雪霸气草莓", description: "新鲜草莓，清爽可口", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 25, name: "乐乐茶酪酪系列", description: "芝士奶盖，口感丰富", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 26, name: "一点点波霸奶茶", description: "经典奶茶，Q弹波霸", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 27, name: "星巴克厚乳拿铁", description: "浓郁厚乳，咖啡醇香", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 28, name: "瑞幸生椰拿铁", description: "椰香浓郁，咖啡醇厚", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 29, name: "Costa摩卡", description: "巧克力与咖啡的完美融合", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 30, name: "蜜雪冰城柠檬水", description: "经济实惠，酸甜解渴", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 31, name: "沪上阿姨血糯米奶茶", description: "特色奶茶，血糯米软糯", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 32, name: "茶颜悦色声声乌龙", description: "国潮茶饮，茶香浓郁", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 33, name: "7分甜杨枝甘露", description: "芒果西柚，清爽解腻", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 34, name: "瑞幸橙C美式", description: "橙子与咖啡的奇妙组合", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 35, name: "喜茶波波冰", description: "冰沙饮品，Q弹波波", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 36, name: "奈雪霸气橙子", description: "新鲜橙子，维C满满", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 37, name: "星巴克星冰乐", description: "冰爽饮品，多种口味", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 38, name: "康师傅冰红茶", description: "经典茶饮，冰镇爽口", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 39, name: "统一冰绿茶", description: "清新绿茶，夏日必备", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 40, name: "东方树叶", description: "无糖茶饮，自然茶香", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 41, name: "王老吉", description: "草本凉茶，清热解毒", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 42, name: "加多宝", description: "草本凉茶，口感清甜", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 43, name: "旺仔牛奶", description: "经典甜牛奶，口感浓郁", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 44, name: "纯甄酸奶", description: "酸甜酸奶，口感顺滑", category: "其他", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 45, name: "安慕希酸奶", description: "浓稠酸奶，多种口味", category: "其他", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 46, name: "蒙牛特仑苏", description: "高端纯牛奶，营养丰富", category: "其他", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 47, name: "伊利金典", description: "有机纯牛奶，品质保证", category: "其他", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 48, name: "椰树牌椰汁", description: "天然椰汁，口感浓郁", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 49, name: "六个核桃", description: "核桃乳，营养补脑", category: "其他", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 50, name: "红牛", description: "功能性饮料，提神醒脑", category: "其他", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 51, name: "东鹏特饮", description: "国产功能饮料，性价比高", category: "其他", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 52, name: "魔爪", description: "能量饮料，口感独特", category: "其他", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 53, name: "脉动", description: "维生素饮料，补充能量", category: "其他", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 54, name: "佳得乐", description: "运动饮料，补充电解质", category: "其他", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 55, name: "农夫山泉矿泉水", description: "天然矿泉水，健康补水", category: "其他", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 56, name: "怡宝纯净水", description: "纯净水质，口感清甜", category: "其他", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 57, name: "百岁山", description: "高端矿泉水，品质优良", category: "其他", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 58, name: "依云", description: "进口矿泉水，天然纯净", category: "其他", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 59, name: "恒大冰泉", description: "长白山天然矿泉水", category: "其他", icon: "fa-glass-water", color: "beverage-soda" },
  { id: 60, name: "雀巢咖啡", description: "速溶咖啡，方便快捷", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 61, name: "麦斯威尔咖啡", description: "经典速溶咖啡，香气浓郁", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 62, name: "星巴克馥芮白", description: "浓郁奶香，咖啡醇厚", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 63, name: "瑞幸拿铁", description: "经典拿铁，口感平衡", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 64, name: "喜茶波波奶茶", description: "Q弹波波，奶茶香浓", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 65, name: "奈雪霸气葡萄", description: "新鲜葡萄，清爽可口", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 66, name: "乐乐茶草莓酪酪", description: "草莓与芝士的完美融合", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 67, name: "一点点红茶玛奇朵", description: "奶盖茶，口感丰富", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 68, name: "沪上阿姨青提奶盖", description: "青提与奶盖的清爽组合", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 69, name: "茶颜悦色声声乌龙", description: "清新乌龙茶，奶盖香浓", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 70, name: "7分甜芒果奶昔", description: "新鲜芒果，奶香浓郁", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 71, name: "瑞幸厚乳拿铁", description: "浓郁厚乳，咖啡醇香", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 72, name: "喜茶多肉杨梅", description: "新鲜杨梅，酸甜可口", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 73, name: "奈雪霸气车厘子", description: "车厘子与茶的完美融合", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 74, name: "乐乐茶葡萄酪酪", description: "葡萄与芝士的美妙组合", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 75, name: "一点点阿华田", description: "经典饮品，麦芽香浓", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 76, name: "沪上阿姨紫薯牛乳", description: "紫薯与牛奶的健康组合", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 77, name: "茶颜悦色声声乌龙", description: "清新乌龙茶，口感柔和", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 78, name: "7分甜杨枝甘露", description: "经典饮品，芒果西柚", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 79, name: "瑞幸橙C美式", description: "橙子与咖啡的奇妙组合", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 80, name: "喜茶波波冰", description: "冰沙饮品，Q弹波波", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 81, name: "奈雪霸气草莓", description: "新鲜草莓，清爽可口", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 82, name: "乐乐茶酪酪系列", description: "芝士奶盖，口感丰富", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 83, name: "一点点波霸奶茶", description: "经典奶茶，Q弹波霸", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 84, name: "星巴克厚乳拿铁", description: "浓郁厚乳，咖啡醇香", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 85, name: "瑞幸生椰拿铁", description: "椰香浓郁，咖啡醇厚", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 86, name: "Costa摩卡", description: "巧克力与咖啡的完美融合", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 87, name: "蜜雪冰城柠檬水", description: "经济实惠，酸甜解渴", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 88, name: "沪上阿姨血糯米奶茶", description: "特色奶茶，血糯米软糯", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 89, name: "茶颜悦色声声乌龙", description: "国潮茶饮，茶香浓郁", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 90, name: "7分甜杨枝甘露", description: "芒果西柚，清爽解腻", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 91, name: "瑞幸橙C美式", description: "橙子与咖啡的奇妙组合", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 92, name: "喜茶波波冰", description: "冰沙饮品，Q弹波波", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" },
  { id: 93, name: "奈雪霸气橙子", description: "新鲜橙子，维C满满", category: "果汁", icon: "fa-glass-martini", color: "beverage-juice" },
  { id: 94, name: "星巴克星冰乐", description: "冰爽饮品，多种口味", category: "咖啡", icon: "fa-coffee", color: "beverage-coffee" },
  { id: 95, name: "康师傅冰红茶", description: "经典茶饮，冰镇爽口", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 96, name: "统一冰绿茶", description: "清新绿茶，夏日必备", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 97, name: "东方树叶", description: "无糖茶饮，自然茶香", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 98, name: "王老吉", description: "草本凉茶，清热解毒", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 99, name: "加多宝", description: "草本凉茶，口感清甜", category: "茶类", icon: "fa-mug-hot", color: "beverage-tea" },
  { id: 100, name: "旺仔牛奶", description: "经典甜牛奶，口感浓郁", category: "奶茶", icon: "fa-mug-hot", color: "beverage-milk" }
];
// DOM 元素
const randomBtn = document.getElementById('random-btn');
const beverageBtn = document.getElementById('beverage-btn');
const resultContainer = document.getElementById('result-container');
const placeholder = document.getElementById('placeholder');
const result = document.getElementById('result');
const loading = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');
const foodName = document.getElementById('food-name');
const foodDesc = document.getElementById('food-desc');
const foodIcon = document.getElementById('food-icon');
const foodIconElement = document.getElementById('food-icon-element');
const beverageContainer = document.getElementById('beverage-container');
const beverageName = document.getElementById('beverage-name');
const beverageDesc = document.getElementById('beverage-desc');

// 初始化
function init() {
  setupEventListeners();
  checkScreenSize();
}

// 设置事件监听器
function setupEventListeners() {
  // 随机选择吃什么按钮
  randomBtn.addEventListener('click', selectRandomFood);
  
  // 随机选择喝什么按钮
  beverageBtn.addEventListener('click', selectRandomBeverage);
  
  // 滚动效果
  window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 10) {
      header.classList.add('py-2');
      header.classList.remove('py-4');
    } else {
      header.classList.add('py-4');
      header.classList.remove('py-2');
    }
  });
}

// 检查屏幕尺寸
function checkScreenSize() {
  if (window.innerWidth >= 1024) { // lg breakpoint
    mobileMenu.classList.add('hidden');
  }
}

// 随机选择食物
function selectRandomFood() {
  if (foods.length === 0) {
    alert('请先添加一些食物！');
    return;
  }
  
  // 显示加载状态
  placeholder.classList.add('hidden');
  result.classList.add('hidden');
  loading.classList.remove('hidden');
  loadingText.textContent = "正在思考吃什么...";
  
  // 模拟思考时间
  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * foods.length);
    const randomFood = foods[randomIndex];
    
    // 更新结果显示
    foodName.textContent = randomFood.name;
    foodDesc.textContent = randomFood.description;
    foodIconElement.className = `fa-solid ${randomFood.icon} text-4xl`;
    
    // 更新图标容器的背景色
    foodIcon.className = `mb-4 w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-${randomFood.color}/10 flex items-center justify-center shadow-lg transform transition-all duration-500 hover:scale-105`;
    
    // 设置食物名称的颜色
    foodName.className = `text-2xl md:text-3xl font-bold text-${randomFood.color} mb-2`;
    
    // 隐藏加载状态，显示结果
    loading.classList.add('hidden');
    result.classList.remove('hidden');
    beverageContainer.classList.add('hidden');
    
    // 添加动画效果
    result.classList.add('animate-float');
    setTimeout(() => {
      result.classList.remove('animate-float');
    }, 1000);
  }, 1500);
}

// 随机选择饮品
function selectRandomBeverage() {
  if (beverages.length === 0) {
    alert('请先添加一些饮品！');
    return;
  }
  
  // 显示加载状态
  placeholder.classList.add('hidden');
  result.classList.add('hidden');
  loading.classList.remove('hidden');
  loadingText.textContent = "正在思考喝什么...";
  
  // 模拟思考时间
  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * beverages.length);
    const randomBeverage = beverages[randomIndex];
    
    // 更新结果显示
    foodName.textContent = randomBeverage.name;
    foodDesc.textContent = randomBeverage.description;
    foodIconElement.className = `fa-solid ${randomBeverage.icon} text-4xl`;
    
    // 更新图标容器的背景色
    foodIcon.className = `mb-4 w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-${randomBeverage.color}/10 flex items-center justify-center shadow-lg transform transition-all duration-500 hover:scale-105`;
    
    // 设置饮品名称的颜色
    foodName.className = `text-2xl md:text-3xl font-bold text-${randomBeverage.color} mb-2`;
    
    // 隐藏加载状态，显示结果
    loading.classList.add('hidden');
    result.classList.remove('hidden');
    beverageContainer.classList.add('hidden');
    
    // 添加动画效果
    result.classList.add('animate-float');
    setTimeout(() => {
      result.classList.remove('animate-float');
    }, 1000);
  }, 1500);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
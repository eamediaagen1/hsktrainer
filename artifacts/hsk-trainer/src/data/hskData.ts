export interface VocabWord {
  id: string;
  hskLevel: 1 | 2 | 3 | 4 | 5 | 6;
  word: string;
  pinyin: string;
  meaning: string;
  imageUrl: string;
}

export const hskData: VocabWord[] = [
  // HSK 1
  { id: "hsk1-1", hskLevel: 1, word: "你好", pinyin: "nǐ hǎo", meaning: "Hello", imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&q=80" },
  { id: "hsk1-2", hskLevel: 1, word: "谢谢", pinyin: "xiè xiè", meaning: "Thank you", imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80" },
  { id: "hsk1-3", hskLevel: 1, word: "水", pinyin: "shuǐ", meaning: "Water", imageUrl: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400&q=80" },
  { id: "hsk1-4", hskLevel: 1, word: "吃", pinyin: "chī", meaning: "Eat", imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" },
  { id: "hsk1-5", hskLevel: 1, word: "猫", pinyin: "māo", meaning: "Cat", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80" },
  { id: "hsk1-6", hskLevel: 1, word: "书", pinyin: "shū", meaning: "Book", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80" },
  { id: "hsk1-7", hskLevel: 1, word: "家", pinyin: "jiā", meaning: "Home/Family", imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80" },
  { id: "hsk1-8", hskLevel: 1, word: "爱", pinyin: "ài", meaning: "Love", imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80" },

  // HSK 2
  { id: "hsk2-1", hskLevel: 2, word: "医院", pinyin: "yīyuàn", meaning: "Hospital", imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80" },
  { id: "hsk2-2", hskLevel: 2, word: "学校", pinyin: "xuéxiào", meaning: "School", imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80" },
  { id: "hsk2-3", hskLevel: 2, word: "公司", pinyin: "gōngsī", meaning: "Company", imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" },
  { id: "hsk2-4", hskLevel: 2, word: "银行", pinyin: "yínháng", meaning: "Bank", imageUrl: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&q=80" },
  { id: "hsk2-5", hskLevel: 2, word: "电话", pinyin: "diànhuà", meaning: "Telephone", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80" },
  { id: "hsk2-6", hskLevel: 2, word: "颜色", pinyin: "yánsè", meaning: "Color", imageUrl: "https://images.unsplash.com/photo-1532960401447-7dd05bef20b0?w=400&q=80" },
  { id: "hsk2-7", hskLevel: 2, word: "天气", pinyin: "tiānqì", meaning: "Weather", imageUrl: "https://images.unsplash.com/photo-1504608524841-42584120d848?w=400&q=80" },
  { id: "hsk2-8", hskLevel: 2, word: "地图", pinyin: "dìtú", meaning: "Map", imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&q=80" },

  // HSK 3
  { id: "hsk3-1", hskLevel: 3, word: "环境", pinyin: "huánjìng", meaning: "Environment", imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80" },
  { id: "hsk3-2", hskLevel: 3, word: "文化", pinyin: "wénhuà", meaning: "Culture", imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&q=80" },
  { id: "hsk3-3", hskLevel: 3, word: "经济", pinyin: "jīngjì", meaning: "Economy", imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80" },
  { id: "hsk3-4", hskLevel: 3, word: "机会", pinyin: "jīhuì", meaning: "Opportunity", imageUrl: "https://images.unsplash.com/photo-1459257831348-f0cdd359235f?w=400&q=80" },
  { id: "hsk3-5", hskLevel: 3, word: "音乐", pinyin: "yīnyuè", meaning: "Music", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80" },
  { id: "hsk3-6", hskLevel: 3, word: "健康", pinyin: "jiànkāng", meaning: "Health", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { id: "hsk3-7", hskLevel: 3, word: "友谊", pinyin: "yǒuyì", meaning: "Friendship", imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80" },
  { id: "hsk3-8", hskLevel: 3, word: "旅游", pinyin: "lǚyóu", meaning: "Travel/Tourism", imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80" },

  // HSK 4
  { id: "hsk4-1", hskLevel: 4, word: "责任", pinyin: "zérèn", meaning: "Responsibility", imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80" },
  { id: "hsk4-2", hskLevel: 4, word: "效率", pinyin: "xiàolǜ", meaning: "Efficiency", imageUrl: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400&q=80" },
  { id: "hsk4-3", hskLevel: 4, word: "传统", pinyin: "chuántǒng", meaning: "Tradition", imageUrl: "https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=400&q=80" },
  { id: "hsk4-4", hskLevel: 4, word: "创新", pinyin: "chuàngxīn", meaning: "Innovation", imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80" },
  { id: "hsk4-5", hskLevel: 4, word: "政策", pinyin: "zhèngcè", meaning: "Policy", imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80" },
  { id: "hsk4-6", hskLevel: 4, word: "艺术", pinyin: "yìshù", meaning: "Art", imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80" },
  { id: "hsk4-7", hskLevel: 4, word: "科学", pinyin: "kēxué", meaning: "Science", imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&q=80" },
  { id: "hsk4-8", hskLevel: 4, word: "情感", pinyin: "qínggǎn", meaning: "Emotion/Feeling", imageUrl: "https://images.unsplash.com/photo-1474564862817-1704d9167e?w=400&q=80" },

  // HSK 5
  { id: "hsk5-1", hskLevel: 5, word: "辩证", pinyin: "biànzhèng", meaning: "Dialectical", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
  { id: "hsk5-2", hskLevel: 5, word: "哲学", pinyin: "zhéxué", meaning: "Philosophy", imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80" },
  { id: "hsk5-3", hskLevel: 5, word: "矛盾", pinyin: "máodùn", meaning: "Contradiction/Conflict", imageUrl: "https://images.unsplash.com/photo-1530099486328-e021101a494a?w=400&q=80" },
  { id: "hsk5-4", hskLevel: 5, word: "策略", pinyin: "cèlüè", meaning: "Strategy", imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&q=80" },
  { id: "hsk5-5", hskLevel: 5, word: "竞争", pinyin: "jìngzhēng", meaning: "Competition", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80" },
  { id: "hsk5-6", hskLevel: 5, word: "意识", pinyin: "yìshí", meaning: "Consciousness/Awareness", imageUrl: "https://images.unsplash.com/photo-1464618663641-bbdd760ae84a?w=400&q=80" },
  { id: "hsk5-7", hskLevel: 5, word: "探索", pinyin: "tànsuǒ", meaning: "Explore/Exploration", imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80" },
  { id: "hsk5-8", hskLevel: 5, word: "融合", pinyin: "rónghé", meaning: "Integration/Fusion", imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80" },

  // HSK 6
  { id: "hsk6-1", hskLevel: 6, word: "诠释", pinyin: "quánshì", meaning: "Interpret/Elucidate", imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80" },
  { id: "hsk6-2", hskLevel: 6, word: "渲染", pinyin: "xuànrǎn", meaning: "Render/Embellish", imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80" },
  { id: "hsk6-3", hskLevel: 6, word: "蕴含", pinyin: "yùnhán", meaning: "Contain/Imply", imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80" },
  { id: "hsk6-4", hskLevel: 6, word: "契机", pinyin: "qìjī", meaning: "Opportunity/Turning point", imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80" },
  { id: "hsk6-5", hskLevel: 6, word: "彰显", pinyin: "zhāngxiǎn", meaning: "Display/Manifest", imageUrl: "https://images.unsplash.com/photo-1494253109108-2e30c049369b?w=400&q=80" },
  { id: "hsk6-6", hskLevel: 6, word: "遏制", pinyin: "èzhì", meaning: "Contain/Restrain", imageUrl: "https://images.unsplash.com/photo-1508921340878-ba53e1f016ec?w=400&q=80" },
  { id: "hsk6-7", hskLevel: 6, word: "渗透", pinyin: "shèntòu", meaning: "Infiltrate/Permeate", imageUrl: "https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=400&q=80" },
  { id: "hsk6-8", hskLevel: 6, word: "凝聚", pinyin: "níngjù", meaning: "Condense/Unite", imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80" },
];

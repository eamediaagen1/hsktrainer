export interface Phrase {
  id: string;
  hskLevel: 1 | 2 | 3 | 4 | 5 | 6;
  category: string;
  phrase: string;
  pinyin: string;
  meaning: string;
}

export const phraseData: Phrase[] = [

  // ─── HSK 1 — Greetings ───────────────────────────────────────────────────
  { id: "ph1-g1", hskLevel: 1, category: "Greetings", phrase: "你好吗？",           pinyin: "nǐ hǎo ma?",                meaning: "How are you?" },
  { id: "ph1-g2", hskLevel: 1, category: "Greetings", phrase: "我很好，谢谢。",     pinyin: "wǒ hěn hǎo, xiè xiè.",      meaning: "I'm fine, thank you." },
  { id: "ph1-g3", hskLevel: 1, category: "Greetings", phrase: "你叫什么名字？",     pinyin: "nǐ jiào shénme míngzi?",    meaning: "What is your name?" },
  { id: "ph1-g4", hskLevel: 1, category: "Greetings", phrase: "我叫李明。",         pinyin: "wǒ jiào Lǐ Míng.",           meaning: "My name is Li Ming." },
  { id: "ph1-g5", hskLevel: 1, category: "Greetings", phrase: "很高兴认识你。",     pinyin: "hěn gāoxìng rènshi nǐ.",    meaning: "Nice to meet you." },
  { id: "ph1-g6", hskLevel: 1, category: "Greetings", phrase: "再见！明天见！",     pinyin: "zàijiàn! míngtiān jiàn!",   meaning: "Goodbye! See you tomorrow!" },

  // ─── HSK 1 — Food & Drink ────────────────────────────────────────────────
  { id: "ph1-fd1", hskLevel: 1, category: "Food & Drink", phrase: "我想喝茶。",         pinyin: "wǒ xiǎng hē chá.",           meaning: "I want to drink tea." },
  { id: "ph1-fd2", hskLevel: 1, category: "Food & Drink", phrase: "这个多少钱？",       pinyin: "zhège duōshǎo qián?",       meaning: "How much is this?" },
  { id: "ph1-fd3", hskLevel: 1, category: "Food & Drink", phrase: "我要一杯咖啡。",     pinyin: "wǒ yào yī bēi kāfēi.",      meaning: "I'd like a cup of coffee." },
  { id: "ph1-fd4", hskLevel: 1, category: "Food & Drink", phrase: "好吃！",             pinyin: "hǎo chī!",                   meaning: "Delicious!" },
  { id: "ph1-fd5", hskLevel: 1, category: "Food & Drink", phrase: "我不吃肉。",         pinyin: "wǒ bù chī ròu.",             meaning: "I don't eat meat." },
  { id: "ph1-fd6", hskLevel: 1, category: "Food & Drink", phrase: "请给我水。",         pinyin: "qǐng gěi wǒ shuǐ.",         meaning: "Please give me water." },
  { id: "ph1-fd7", hskLevel: 1, category: "Food & Drink", phrase: "我喜欢吃面包。",     pinyin: "wǒ xǐhuān chī miànbāo.",   meaning: "I like eating bread." },

  // ─── HSK 1 — Time & Dates ────────────────────────────────────────────────
  { id: "ph1-t1", hskLevel: 1, category: "Time & Dates", phrase: "今天几月几号？",   pinyin: "jīntiān jǐ yuè jǐ hào?",    meaning: "What is today's date?" },
  { id: "ph1-t2", hskLevel: 1, category: "Time & Dates", phrase: "现在几点？",       pinyin: "xiànzài jǐ diǎn?",           meaning: "What time is it now?" },
  { id: "ph1-t3", hskLevel: 1, category: "Time & Dates", phrase: "明天见！",         pinyin: "míngtiān jiàn!",             meaning: "See you tomorrow!" },
  { id: "ph1-t4", hskLevel: 1, category: "Time & Dates", phrase: "我明天去学校。",   pinyin: "wǒ míngtiān qù xuéxiào.",   meaning: "I'm going to school tomorrow." },
  { id: "ph1-t5", hskLevel: 1, category: "Time & Dates", phrase: "今天星期几？",     pinyin: "jīntiān xīngqī jǐ?",        meaning: "What day is today?" },
  { id: "ph1-t6", hskLevel: 1, category: "Time & Dates", phrase: "昨天我在家。",     pinyin: "zuótiān wǒ zài jiā.",        meaning: "Yesterday I was at home." },

  // ─── HSK 1 — Family ──────────────────────────────────────────────────────
  { id: "ph1-f1", hskLevel: 1, category: "Family", phrase: "这是我妈妈。",     pinyin: "zhè shì wǒ māma.",           meaning: "This is my mother." },
  { id: "ph1-f2", hskLevel: 1, category: "Family", phrase: "你有兄弟姐妹吗？", pinyin: "nǐ yǒu xiōngdì jiěmèi ma?", meaning: "Do you have siblings?" },
  { id: "ph1-f3", hskLevel: 1, category: "Family", phrase: "我们是一家人。",   pinyin: "wǒmen shì yījiā rén.",       meaning: "We are family." },
  { id: "ph1-f4", hskLevel: 1, category: "Family", phrase: "我爸爸在家。",     pinyin: "wǒ bàba zài jiā.",           meaning: "My father is at home." },
  { id: "ph1-f5", hskLevel: 1, category: "Family", phrase: "她是我的朋友。",   pinyin: "tā shì wǒ de péngyǒu.",     meaning: "She is my friend." },

  // ─── HSK 1 — Daily Life ──────────────────────────────────────────────────
  { id: "ph1-dl1", hskLevel: 1, category: "Daily Life", phrase: "我去上班了。",   pinyin: "wǒ qù shàngbān le.",         meaning: "I'm going to work." },
  { id: "ph1-dl2", hskLevel: 1, category: "Daily Life", phrase: "你在哪里？",     pinyin: "nǐ zài nǎlǐ?",              meaning: "Where are you?" },
  { id: "ph1-dl3", hskLevel: 1, category: "Daily Life", phrase: "请坐下。",       pinyin: "qǐng zuò xià.",             meaning: "Please sit down." },
  { id: "ph1-dl4", hskLevel: 1, category: "Daily Life", phrase: "我听不懂。",     pinyin: "wǒ tīng bù dǒng.",           meaning: "I don't understand." },
  { id: "ph1-dl5", hskLevel: 1, category: "Daily Life", phrase: "请说慢一点。",   pinyin: "qǐng shuō màn yīdiǎn.",    meaning: "Please speak slower." },
  { id: "ph1-dl6", hskLevel: 1, category: "Daily Life", phrase: "我学习汉语。",   pinyin: "wǒ xuéxí Hànyǔ.",           meaning: "I study Chinese." },

  // ─── HSK 1 — Travel & Places ─────────────────────────────────────────────
  { id: "ph1-p1", hskLevel: 1, category: "Travel", phrase: "去机场怎么走？",       pinyin: "qù jīchǎng zěnme zǒu?",      meaning: "How do I get to the airport?" },
  { id: "ph1-p2", hskLevel: 1, category: "Travel", phrase: "我要去北京。",         pinyin: "wǒ yào qù Běijīng.",         meaning: "I want to go to Beijing." },
  { id: "ph1-p3", hskLevel: 1, category: "Travel", phrase: "这里是哪里？",         pinyin: "zhèlǐ shì nǎlǐ?",           meaning: "Where is this place?" },
  { id: "ph1-p4", hskLevel: 1, category: "Travel", phrase: "请问，医院在哪里？",   pinyin: "qǐngwèn, yīyuàn zài nǎlǐ?", meaning: "Excuse me, where is the hospital?" },
  { id: "ph1-p5", hskLevel: 1, category: "Travel", phrase: "我在学校工作。",       pinyin: "wǒ zài xuéxiào gōngzuò.",   meaning: "I work at a school." },
  { id: "ph1-p6", hskLevel: 1, category: "Travel", phrase: "飞机几点到？",         pinyin: "fēijī jǐ diǎn dào?",         meaning: "What time does the plane arrive?" },
];

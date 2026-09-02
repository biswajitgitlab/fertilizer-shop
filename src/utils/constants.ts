import { Category, Product } from '../types';

export const CATEGORIES: Category[] = [];

export interface SymptomItem {
  id: string;
  label: string;
  hindiLabel?: string;
  icon: string;
  category: 'Fungal/Bacterial' | 'Insect/Pest' | 'Nutrient Deficiency' | 'Viral/Abiotic';
}

export interface CropMaster {
  name: string;
  hindiName: string;
  category: 'Cereal' | 'Cash Crop' | 'Vegetable' | 'Oilseed & Pulse';
  icon: string;
  growthStages: string[];
  symptoms: SymptomItem[];
}

export const INDIAN_CROP_MATRIX: Record<string, CropMaster> = {
  "Rice / Paddy": {
    name: "Rice / Paddy",
    hindiName: "धान (Paddy)",
    category: "Cereal",
    icon: "🌾",
    growthStages: [
      "Seedling & Nursery Stage",
      "Active Tillering Stage",
      "Panicle Initiation & Booting",
      "Flowering & Heading",
      "Grain Filling & Milking",
      "Maturity & Harvest"
    ],
    symptoms: [
      { id: "p1", label: "Khaira Disease (Rusty Brown Patch - Zinc Def.)", hindiLabel: "खैरा रोग (जिंक की कमी)", icon: "🍂", category: "Nutrient Deficiency" },
      { id: "p2", label: "Bacterial Leaf Blight (Yellow Wavy Leaf Margins)", hindiLabel: "बैक्टीरियल झुलसा रोग", icon: "🍃", category: "Fungal/Bacterial" },
      { id: "p3", label: "Rice Blast (Spindle/Diamond Shaped Lesions)", hindiLabel: "धान का ब्लास्ट रोग", icon: "💥", category: "Fungal/Bacterial" },
      { id: "p4", label: "Sheath Blight (Snake-Skin Grey Stem Patches)", hindiLabel: "शीथ ब्लाइट रोग", icon: "🐍", category: "Fungal/Bacterial" },
      { id: "p5", label: "Brown Planthopper Hopperburn (Circular Drying)", hindiLabel: "ब्राउन प्लांटहॉपर (भूरा माहू)", icon: "🦟", category: "Insect/Pest" },
      { id: "p6", label: "Stem Borer Dead Heart / White Head", hindiLabel: "तना छेदक (डेड हार्ट)", icon: "🐛", category: "Insect/Pest" },
      { id: "p7", label: "Nitrogen Deficiency (Uniform Pale Yellowing)", hindiLabel: "नाइट्रोजन की कमी", icon: "🟡", category: "Nutrient Deficiency" }
    ]
  },
  "Wheat": {
    name: "Wheat",
    hindiName: "गेहूं (Wheat)",
    category: "Cereal",
    icon: "🌾",
    growthStages: [
      "Crown Root Initiation (CRI Stage)",
      "Tillering Stage",
      "Jointing & Booting",
      "Flowering & Heading",
      "Dough & Grain Filling",
      "Ripening & Harvest"
    ],
    symptoms: [
      { id: "w1", label: "Yellow / Brown Rust (Powdery Yellow Pustules)", hindiLabel: "पीला/भूरा रतुआ (गेरुई)", icon: "🟡", category: "Fungal/Bacterial" },
      { id: "w2", label: "Loose Smut (Black Powdery Spore Head)", hindiLabel: "कंडुआ रोग (काली बाली)", icon: "⬛", category: "Fungal/Bacterial" },
      { id: "w3", label: "Karnal Bunt (Fishy Odor & Black Grains)", hindiLabel: "करनाल बंट", icon: "🐟", category: "Fungal/Bacterial" },
      { id: "w4", label: "Termite Attack (Drying Hollow Stems)", hindiLabel: "दीमक का प्रकोप", icon: "🐜", category: "Insect/Pest" },
      { id: "w5", label: "Helminthosporium Leaf Blight", hindiLabel: "पत्ती झुलसा रोग", icon: "🍂", category: "Fungal/Bacterial" },
      { id: "w6", label: "Nitrogen Deficiency (Lower Leaf Yellowing)", hindiLabel: "नाइट्रोजन की कमी", icon: "🌾", category: "Nutrient Deficiency" }
    ]
  },
  "Cotton": {
    name: "Cotton",
    hindiName: "कपास / कॉटन (Cotton)",
    category: "Cash Crop",
    icon: "☁️",
    growthStages: [
      "Germination & Nursery",
      "Square Formation & Vegetative",
      "Flowering & Boll Setting",
      "Boll Development & Maturation",
      "Boll Opening & Picking"
    ],
    symptoms: [
      { id: "c1", label: "Pink Bollworm Attack (Bored Bolls & Rosette Flower)", hindiLabel: "गुलाबी सुंडी (Pink Bollworm)", icon: "🐛", category: "Insect/Pest" },
      { id: "c2", label: "Leaf Curl Virus (Upward Cupped Thickened Leaves)", hindiLabel: "पत्ती मोड़क वायरस", icon: "🌀", category: "Viral/Abiotic" },
      { id: "c3", label: "Whitefly Infestation (Sticky Honeydew & Sooty Mold)", hindiLabel: "सफेद मक्खी (Whitefly)", icon: "🪰", category: "Insect/Pest" },
      { id: "c4", label: "Magnesium Reddening (Old Leaves Blood Red)", hindiLabel: "लाल रोग (मैग्नीशियम की कमी)", icon: "🔴", category: "Nutrient Deficiency" },
      { id: "c5", label: "Bacterial Blight / Black Arm Lesions", hindiLabel: "ब्लैक आर्म रोग", icon: "⬛", category: "Fungal/Bacterial" },
      { id: "c6", label: "Parawilt / Sudden Field Wilting", hindiLabel: "पैराविल्ट (अचानक सूखना)", icon: "🥀", category: "Viral/Abiotic" }
    ]
  },
  "Sugarcane": {
    name: "Sugarcane",
    hindiName: "गन्ना (Sugarcane)",
    category: "Cash Crop",
    icon: "🎋",
    growthStages: [
      "Germination & Sprouting",
      "Formative & Tillering Stage",
      "Grand Growth & Cane Elongation",
      "Ripening & Harvest"
    ],
    symptoms: [
      { id: "sc1", label: "Red Rot (Internal Stalk Reddening & Sour Smell)", hindiLabel: "लाल सड़न रोग (Red Rot)", icon: "🔴", category: "Fungal/Bacterial" },
      { id: "sc2", label: "Early Shoot Borer (Dead Heart Shoot)", hindiLabel: "कंसुआ / तना छेदक", icon: "🐛", category: "Insect/Pest" },
      { id: "sc3", label: "Top Borer (Bunchy Top & Leaf Holes)", hindiLabel: "चोटी छेदक (Top Borer)", icon: "🎋", category: "Insect/Pest" },
      { id: "sc4", label: "Iron Chlorosis (Bleached White Top Leaves)", hindiLabel: "लोहे की कमी (Iron Chlorosis)", icon: "⚪", category: "Nutrient Deficiency" },
      { id: "sc5", label: "Sugarcane Smut (Black Whip Structure)", hindiLabel: "चाबुक कंडुआ रोग", icon: "🦯", category: "Fungal/Bacterial" }
    ]
  },
  "Tomato": {
    name: "Tomato",
    hindiName: "टमाटर (Tomato)",
    category: "Vegetable",
    icon: "🍅",
    growthStages: [
      "Seedling & Nursery",
      "Vegetative Branching",
      "Flowering & Fruit Set",
      "Fruit Bulking & Development",
      "Harvesting & Ripening"
    ],
    symptoms: [
      { id: "t1", label: "Tomato Leaf Curl Virus (Stunted Cupped Leaves)", hindiLabel: "टमाटर लीफ कर्ल वायरस", icon: "🌀", category: "Viral/Abiotic" },
      { id: "t2", label: "Early Blight / Alternaria (Concentric Target Rings)", hindiLabel: "अगेती झुलसा (Early Blight)", icon: "🎯", category: "Fungal/Bacterial" },
      { id: "t3", label: "Fruit Borer / Helicoverpa (Holes in Tomatoes)", hindiLabel: "फल छेदक सुंडी", icon: "🐛", category: "Insect/Pest" },
      { id: "t4", label: "Bacterial Wilt (Sudden Green Plant Wilting)", hindiLabel: "बैक्टीरियल उकठा (Wilt)", icon: "🥀", category: "Fungal/Bacterial" },
      { id: "t5", label: "Blossom End Rot (Black Sunken Rot at Fruit Bottom)", hindiLabel: "ब्लॉसम एंड रॉट (कैल्शियम कमी)", icon: "🖤", category: "Nutrient Deficiency" }
    ]
  },
  "Potato": {
    name: "Potato",
    hindiName: "आलू (Potato)",
    category: "Vegetable",
    icon: "🥔",
    growthStages: [
      "Sprouting & Emergence",
      "Vegetative Branching",
      "Tuber Initiation Stage",
      "Tuber Bulking Stage",
      "Maturity & Harvesting"
    ],
    symptoms: [
      { id: "po1", label: "Late Blight (Water-Soaked Lesions & White Downy Mold)", hindiLabel: "पछेती झुलसा (Late Blight)", icon: "🌧️", category: "Fungal/Bacterial" },
      { id: "po2", label: "Early Blight (Concentric Ring Target Spots)", hindiLabel: "अगेती झुलसा (Early Blight)", icon: "🎯", category: "Fungal/Bacterial" },
      { id: "po3", label: "Aphid Infestation (Leaf Curling & Virus Risk)", hindiLabel: "माहू (Aphid) प्रकोप", icon: "🦟", category: "Insect/Pest" },
      { id: "po4", label: "Blackleg & Tuber Rot (Black Soil Line Stem Decay)", hindiLabel: "ब्लैकलेग (तना सड़न)", icon: "🪵", category: "Fungal/Bacterial" },
      { id: "po5", label: "Potassium Deficiency (Bronzing & Margin Scorching)", hindiLabel: "पोटाश की कमी", icon: "🍂", category: "Nutrient Deficiency" }
    ]
  },
  "Chilli": {
    name: "Chilli",
    hindiName: "मिर्च (Chilli)",
    category: "Vegetable",
    icon: "🌶️",
    growthStages: [
      "Nursery & Establishment",
      "Vegetative Branching",
      "Flowering & Fruit Set",
      "Pod Development & Harvesting"
    ],
    symptoms: [
      { id: "ch1", label: "Chilli Murda / Thrips Curl (Upward Boat-Shaped Leaves)", hindiLabel: "चुरड़ा-मुरड़ा रोग (थ्रिप्स)", icon: "⛵", category: "Insect/Pest" },
      { id: "ch2", label: "Mite Attack (Downward Leaf Cupping & Inverted Edge)", hindiLabel: "माइट का प्रकोप (नीचे मुड़ना)", icon: "🌀", category: "Insect/Pest" },
      { id: "ch3", label: "Anthracnose / Fruit Rot (Sunken Dark Pod Lesions)", hindiLabel: "फल सड़न (ऐंथ्रेक्नोस)", icon: "🔴", category: "Fungal/Bacterial" },
      { id: "ch4", label: "Powdery Mildew (White Powdery Growth Under Leaf)", hindiLabel: "पाउडरी मिलड्यू (सफेद चूर्णी)", icon: "❄️", category: "Fungal/Bacterial" },
      { id: "ch5", label: "Dieback (Top-Down Twig Drying)", hindiLabel: "डाईबैक (डालियों का सूखना)", icon: "🥀", category: "Fungal/Bacterial" }
    ]
  },
  "Mustard": {
    name: "Mustard",
    hindiName: "सरसों (Mustard)",
    category: "Oilseed & Pulse",
    icon: "🌼",
    growthStages: [
      "Seedling & Emergence",
      "Rosette & Vegetative",
      "Bolting & Flowering",
      "Pod Formation & Filling",
      "Maturity & Harvesting"
    ],
    symptoms: [
      { id: "m1", label: "Mustard Aphid Attack (Dense Green Colonies on Flowers)", hindiLabel: "सरसों का चेपा / माहू (Aphid)", icon: "🪰", category: "Insect/Pest" },
      { id: "m2", label: "Alternaria Blight (Concentric Ring Spots on Pods)", hindiLabel: "अल्टरनेरिया झुलसा", icon: "🟤", category: "Fungal/Bacterial" },
      { id: "m3", label: "White Rust / Blister (White Pustules & Staghead)", hindiLabel: "सफेद रोली (White Rust)", icon: "❄️", category: "Fungal/Bacterial" },
      { id: "m4", label: "Downy Mildew (Grey Velvety Leaf Mold)", hindiLabel: "तुलसिता (डाउनी मिलड्यू)", icon: "🌫️", category: "Fungal/Bacterial" }
    ]
  },
  "Maize / Corn": {
    name: "Maize / Corn",
    hindiName: "मक्का (Maize)",
    category: "Cereal",
    icon: "🌽",
    growthStages: [
      "Seedling & Knee High Stage",
      "Tasseling & Silking Stage",
      "Cob Development & Grain Filling",
      "Grain Hardening & Harvest"
    ],
    symptoms: [
      { id: "mz1", label: "Fall Armyworm (Ragged Leaf Whorl Damage & Frass)", hindiLabel: "फॉल्स आर्मीवर्म (FAW)", icon: "🐛", category: "Insect/Pest" },
      { id: "mz2", label: "Turcicum Leaf Blight (Cigar-Shaped Tan Lesions)", hindiLabel: "टर्सिकम लीफ ब्लाइट", icon: "🚬", category: "Fungal/Bacterial" },
      { id: "mz3", label: "Zinc Deficiency (Broad White/Yellow Leaf Stripes)", hindiLabel: "जिंक की कमी (सफेद पट्टी)", icon: "⚪", category: "Nutrient Deficiency" }
    ]
  },
  "Groundnut": {
    name: "Groundnut",
    hindiName: "मूंगफली (Groundnut)",
    category: "Oilseed & Pulse",
    icon: "🥜",
    growthStages: [
      "Emergence & Seedling",
      "Vegetative & Flowering",
      "Pegging & Pod Initiation",
      "Pod Bulking & Maturation"
    ],
    symptoms: [
      { id: "gn1", label: "Tikka Leaf Spot (Dark Brown Spots with Yellow Halos)", hindiLabel: "टिक्का रोग (Tikka Disease)", icon: "🟡", category: "Fungal/Bacterial" },
      { id: "gn2", label: "Rust (Powdery Brown Leaf Pustules)", hindiLabel: "मूंगफली का गेरुई (Rust)", icon: "🟤", category: "Fungal/Bacterial" },
      { id: "gn3", label: "Collar Rot (Rotting at Soil Surface)", hindiLabel: "कॉलर रॉट (कॉलर सड़न)", icon: "🪵", category: "Fungal/Bacterial" }
    ]
  },
  "Onion": {
    name: "Onion",
    hindiName: "प्याज (Onion)",
    category: "Vegetable",
    icon: "🧅",
    growthStages: [
      "Seedling & Transplanting",
      "Vegetative Foliage Growth",
      "Bulb Initiation & Development",
      "Bulb Maturation & Harvest"
    ],
    symptoms: [
      { id: "on1", label: "Purple Blotch (Sunken Purple Lesions on Leaves)", hindiLabel: "बैंगनी धब्बा रोग (Purple Blotch)", icon: "🟣", category: "Fungal/Bacterial" },
      { id: "on2", label: "Thrips Infestation (Silvery White Leaf Streaks)", hindiLabel: "प्याज का थ्रिप्स (Thrips)", icon: "⚡", category: "Insect/Pest" },
      { id: "on3", label: "Downy Mildew (Yellowing & Grey Mold)", hindiLabel: "डाउनी मिलड्यू", icon: "🌫️", category: "Fungal/Bacterial" }
    ]
  },
  "Pulse Crops (Chana / Arhar)": {
    name: "Pulse Crops (Chana / Arhar)",
    hindiName: "दलहन - चना / अरहर (Pulses)",
    category: "Oilseed & Pulse",
    icon: "🫘",
    growthStages: [
      "Germination & Seedling",
      "Vegetative Branching",
      "Flowering & Podding",
      "Maturity & Harvest"
    ],
    symptoms: [
      { id: "pl1", label: "Fusarium Wilt (Sudden Field Wilting & Root Browning)", hindiLabel: "उकठा रोग (Fusarium Wilt)", icon: "🥀", category: "Fungal/Bacterial" },
      { id: "pl2", label: "Gram Pod Borer / Helicoverpa (Holes in Pods)", hindiLabel: "फली छेदक (Pod Borer)", icon: "🐛", category: "Insect/Pest" },
      { id: "pl3", label: "Dry Root Rot (Bark Shredding at Root Collar)", hindiLabel: "सूखी जड़ सड़न", icon: "🪵", category: "Fungal/Bacterial" }
    ]
  }
};

// Array of crops for selector
export const CROPS_LIST = Object.values(INDIAN_CROP_MATRIX).map(c => ({
  name: c.name,
  hindiName: c.hindiName,
  icon: c.icon,
  category: c.category
}));

// Fallback growth stages
export const DEFAULT_GROWTH_STAGES = [
  "Seedling / Nursery",
  "Vegetative Growth",
  "Tillering / Branching",
  "Flowering & Booting",
  "Fruiting & Grain Filling",
  "Maturity & Harvest"
];

// Helper to get growth stages per crop
export const getGrowthStagesForCrop = (cropName: string): string[] => {
  return INDIAN_CROP_MATRIX[cropName]?.growthStages || DEFAULT_GROWTH_STAGES;
};

// Helper to get symptoms per crop
export const getSymptomsForCrop = (cropName: string): SymptomItem[] => {
  if (INDIAN_CROP_MATRIX[cropName]) {
    return INDIAN_CROP_MATRIX[cropName].symptoms;
  }
  return [
    { id: "s1", label: "Yellowing Leaves (Chlorosis)", icon: "🍋", category: "Nutrient Deficiency" },
    { id: "s2", label: "Brown / Black Spots", icon: "🟤", category: "Fungal/Bacterial" },
    { id: "s3", label: "Wilting / Drooping Plants", icon: "🥀", category: "Fungal/Bacterial" },
    { id: "s4", label: "Stunted Growth / Dwarf Plants", icon: "📉", category: "Viral/Abiotic" },
    { id: "s5", label: "Curled or Deformed Leaves", icon: "🌀", category: "Insect/Pest" },
    { id: "s6", label: "Root Rot or Stem Blackening", icon: "🪵", category: "Fungal/Bacterial" },
    { id: "s7", label: "White Powdery Coating", icon: "❄️", category: "Fungal/Bacterial" },
    { id: "s8", label: "Insect / Worm Holes on Leaves", icon: "🐛", category: "Insect/Pest" }
  ];
};

export const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const INITIAL_PRODUCTS: Product[] = [];

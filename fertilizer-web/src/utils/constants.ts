import { Category, Product } from '../types';

export const CATEGORIES: Category[] = [];

export const CROPS_LIST = [
  { name: "Rice / Paddy", icon: "🌾" },
  { name: "Wheat", icon: "🌾" },
  { name: "Tomato", icon: "🍅" },
  { name: "Potato", icon: "🥔" },
  { name: "Cotton", icon: "☁️" },
  { name: "Sugarcane", icon: "🎋" },
  { name: "Maize / Corn", icon: "🌽" },
  { name: "Chilli", icon: "🌶️" },
  { name: "Onion", icon: "🧅" },
  { name: "Banana", icon: "🍌" },
  { name: "Mustard", icon: "🌼" },
  { name: "Groundnut", icon: "🥜" },
];

export const GROWTH_STAGES = [
  "Seedling / Nursery",
  "Vegetative Growth",
  "Tillering / Branching",
  "Flowering & Booting",
  "Fruiting & Grain Filling",
  "Maturity & Harvest"
];

export const COMMON_SYMPTOMS = [
  { id: "s1", label: "Yellowing Leaves (Chlorosis)", icon: "🍋" },
  { id: "s2", label: "Brown / Black Spots", icon: "🟤" },
  { id: "s3", label: "Wilting / Drooping Plants", icon: "🥀" },
  { id: "s4", label: "Stunted Growth / Dwarf Plants", icon: "📉" },
  { id: "s5", label: "Curled or Deformed Leaves", icon: "🌀" },
  { id: "s6", label: "Root Rot or Stem Blackening", icon: "🪵" },
  { id: "s7", label: "White Powdery Coating", icon: "❄️" },
  { id: "s8", label: "Insect / Worm Holes on Leaves", icon: "🐛" },
  { id: "s9", label: "Flower or Fruit Drop", icon: "🌸" },
];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const INITIAL_PRODUCTS: Product[] = [];

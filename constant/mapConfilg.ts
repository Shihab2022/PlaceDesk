export interface LayerConfig {
  name: string;
  id: string;
  color: string; // Hex color (useful for UI components/legends)
  rgb: [number, number, number]; // RGB array for Deck.gl
  targetPath: string;
}

export const mapLayerDetailConfig: LayerConfig[] = [
  {
    name: "Malls",
    id: "delhi_malls_data",
    color: "#E63946",
    rgb: [230, 57, 70], // Crimson
    targetPath: "site_analysis_delhi/Malls.json",
  },
  {
    name: "Furniture",
    id: "delhi_furniture_data",
    color: "#D97706",
    rgb: [217, 119, 6], // Amber Brown
    targetPath: "site_analysis_delhi/Furniture.json",
  },
  {
    name: "Electronics",
    id: "delhi_electronics_data",
    color: "#06B6D4",
    rgb: [6, 182, 212], // Cyan
    targetPath: "site_analysis_delhi/Electronics.json",
  },
  {
    name: "Leisure",
    id: "delhi_leisure_data",
    color: "#8B5CF6",
    rgb: [139, 92, 246], // Violet / Purple
    targetPath: "site_analysis_delhi/Leisure.json",
  },
  {
    name: "Medical",
    id: "delhi_medical_data",
    color: "#EF4444",
    rgb: [239, 68, 68], // Red
    targetPath: "site_analysis_delhi/Medical.json",
  },
  {
    name: "Transport",
    id: "delhi_transport_data",
    color: "#10B981",
    rgb: [16, 185, 129], // Emerald Green
    targetPath: "site_analysis_delhi/Transport.json",
  },
  {
    name: "Companies",
    id: "delhi_companies_data",
    color: "#3B82F6",
    rgb: [59, 130, 246], // Blue
    targetPath: "site_analysis_delhi/companeis.json",
  },
  {
    name: "Education",
    id: "delhi_education_data",
    color: "#6366F1",
    rgb: [99, 102, 241], // Indigo
    targetPath: "site_analysis_delhi/edication.json",
  },
  {
    name: "Fashion",
    id: "delhi_fashion_data",
    color: "#EC4899",
    rgb: [236, 72, 153], // Hot Pink
    targetPath: "site_analysis_delhi/fashion.json",
  },
  {
    name: "Fitness",
    id: "delhi_fitness_data",
    color: "#84CC16",
    rgb: [132, 204, 22], // Lime Green
    targetPath: "site_analysis_delhi/fitness.json",
  },
  {
    name: "Food",
    id: "delhi_food_data",
    color: "#F97316",
    rgb: [249, 115, 22], // Orange
    targetPath: "site_analysis_delhi/food.json",
  },
  {
    name: "Others",
    id: "delhi_others_data",
    color: "#6B7280",
    rgb: [107, 114, 128], // Slate Gray
    targetPath: "site_analysis_delhi/others.json",
  },
  {
    name: "Supermarket",
    id: "delhi_supermarket_data",
    color: "#14B8A6",
    rgb: [20, 184, 166], // Teal
    targetPath: "site_analysis_delhi/supermarket.json",
  },
];

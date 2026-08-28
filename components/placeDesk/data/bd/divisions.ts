import type { CategoryKey, LocationData } from "../types";
import { mulberry32 } from "../types";

/* ================================================================== */
/* Bangladesh divisions registry                                       */
/* ================================================================== */

export interface DivisionSeed {
  id: string;          // matches CityDef.id
  name: string;        // human label
  division: string;    // division grouping label
  center: { lat: number; lng: number };
  zoom: number;
  pincodePrefix: string;
  pincodeLength: number;
  roads: string[];
  /** Major cities / towns inside the division with realistic coordinates. */
  towns: { name: string; lat: number; lng: number }[];
  /** Weight per category 0..1 — higher means more records. */
  distribution: Partial<Record<CategoryKey, number>>;
}

export const BANGLADESH_DIVISIONS: DivisionSeed[] = [
  {
    id: "bd-dhaka",
    name: "Dhaka Division",
    division: "Dhaka",
    center: { lat: 23.8103, lng: 90.4125 },
    zoom: 7.4,
    pincodePrefix: "1",
    pincodeLength: 5,
    roads: [
      "Indira Road",
      "Elephant Road",
      "Mirpur Road",
      "Shahbagh Road",
      "Old Hanif Road",
    ],
    towns: [
      { name: "Dhaka", lat: 23.8103, lng: 90.4125 },
      { name: "Gazipur", lat: 24.0095, lng: 90.3891 },
      { name: "Narayanganj", lat: 23.612, lng: 90.5084 },
      { name: "Savar", lat: 23.8388, lng: 90.2493 },
      { name: "Tangail", lat: 24.2519, lng: 89.9214 },
      { name: "Kishoreganj", lat: 24.3739, lng: 90.7176 },
      { name: "Manikganj", lat: 23.8376, lng: 89.9857 },
      { name: "Munshiganj", lat: 23.5226, lng: 90.4041 },
      { name: "Rajbari", lat: 23.2609, lng: 89.6613 },
      { name: "Madaripur", lat: 22.7451, lng: 90.3365 },
      { name: "Shariatpur", lat: 23.1751, lng: 90.1388 },
      { name: "Faridpur", lat: 23.5424, lng: 89.6306 },
      { name: "Gopalganj", lat: 23.0057, lng: 89.8266 },
    ],
    distribution: {
      malls: 0.85,
      furniture: 0.75,
      electronics: 0.95,
      leisure: 0.8,
      medical: 0.9,
      transport: 0.9,
      companies: 0.95,
      education: 0.95,
      fashion: 0.85,
      fitness: 0.85,
      food: 0.95,
      others: 0.7,
      supermarket: 0.85,
    },
  },
  {
    id: "bd-chattogram",
    name: "Chattogram Division",
    division: "Chattogram",
    center: { lat: 22.3414, lng: 91.8244 },
    zoom: 7.2,
    pincodePrefix: "4",
    pincodeLength: 5,
    roads: ["Agrabad", "GEC Moor", "Avenue Road", "Kotwali Road", "Station Road"],
    towns: [
      { name: "Chattogram", lat: 22.3414, lng: 91.8244 },
      { name: "Cox's Bazar", lat: 21.4272, lng: 91.9764 },
      { name: "Cumilla", lat: 23.4536, lng: 91.1489 },
      { name: "Feni", lat: 23.0439, lng: 91.4279 },
      { name: "Noakhali", lat: 22.8712, lng: 91.0971 },
      { name: "Lakshmipur", lat: 22.9445, lng: 90.8412 },
      { name: "Khagrachhari", lat: 23.2523, lng: 91.7137 },
      { name: "Rangamati", lat: 22.2707, lng: 92.2988 },
      { name: "Bandarban", lat: 22.2407, lng: 92.4234 },
      { name: "Brahmanbaria", lat: 23.9571, lng: 91.1116 },
      { name: "Chandpur", lat: 23.2333, lng: 90.6714 },
    ],
    distribution: {
      malls: 0.65,
      furniture: 0.7,
      electronics: 0.75,
      leisure: 0.9,
      medical: 0.7,
      transport: 0.95,
      companies: 0.8,
      education: 0.75,
      fashion: 0.7,
      fitness: 0.65,
      food: 0.85,
      others: 0.65,
      supermarket: 0.7,
    },
  },
  {
    id: "bd-rajshahi",
    name: "Rajshahi Division",
    division: "Rajshahi",
    center: { lat: 24.3744, lng: 88.6044 },
    zoom: 7.4,
    pincodePrefix: "6",
    pincodeLength: 5,
    roads: ["Sadar Road", "New Market Road", "Shaheed Minar Road", "College Road"],
    towns: [
      { name: "Rajshahi", lat: 24.3744, lng: 88.6044 },
      { name: "Bogura", lat: 24.8492, lng: 89.3672 },
      { name: "Pabna", lat: 24.0095, lng: 89.2311 },
      { name: "Natore", lat: 24.2006, lng: 88.9281 },
      { name: "Naogaon", lat: 24.8759, lng: 89.2893 },
      { name: "Joypurhat", lat: 25.0149, lng: 89.0415 },
      { name: "Chapai Nawabganj", lat: 24.6269, lng: 88.2568 },
      { name: "Sirajganj", lat: 24.4533, lng: 89.7006 },
    ],
    distribution: {
      malls: 0.45,
      furniture: 0.55,
      electronics: 0.55,
      leisure: 0.55,
      medical: 0.7,
      transport: 0.6,
      companies: 0.5,
      education: 0.95,
      fashion: 0.5,
      fitness: 0.5,
      food: 0.8,
      others: 0.55,
      supermarket: 0.75,
    },
  },
  {
    id: "bd-khulna",
    name: "Khulna Division",
    division: "Khulna",
    center: { lat: 22.9062, lng: 89.0935 },
    zoom: 7.4,
    pincodePrefix: "9",
    pincodeLength: 5,
    roads: ["Khan Jahan Ali Road", "College Road", "Railway Station Road"],
    towns: [
      { name: "Khulna", lat: 22.9062, lng: 89.0935 },
      { name: "Jessore", lat: 23.1667, lng: 89.2167 },
      { name: "Kushtia", lat: 23.9014, lng: 88.8189 },
      { name: "Satkhira", lat: 22.7056, lng: 89.0561 },
      { name: "Bagerhat", lat: 22.8325, lng: 89.6822 },
      { name: "Jhenaidah", lat: 23.3124, lng: 88.7011 },
      { name: "Magura", lat: 23.7762, lng: 89.3948 },
      { name: "Narail", lat: 22.9019, lng: 89.5302 },
      { name: "Chuadanga", lat: 23.6442, lng: 88.8221 },
      { name: "Meherpur", lat: 23.7415, lng: 88.6927 },
    ],
    distribution: {
      malls: 0.4,
      furniture: 0.5,
      electronics: 0.5,
      leisure: 0.55,
      medical: 0.7,
      transport: 0.7,
      companies: 0.45,
      education: 0.8,
      fashion: 0.45,
      fitness: 0.45,
      food: 0.75,
      others: 0.55,
      supermarket: 0.7,
    },
  },
  {
    id: "bd-barishal",
    name: "Barishal Division",
    division: "Barishal",
    center: { lat: 22.7019, lng: 90.3866 },
    zoom: 7.6,
    pincodePrefix: "8",
    pincodeLength: 5,
    roads: ["Sadar Road", "College Road", "Market Road"],
    towns: [
      { name: "Barishal", lat: 22.7019, lng: 90.3866 },
      { name: "Bhola", lat: 22.6853, lng: 90.6482 },
      { name: "Pirojpur", lat: 22.7352, lng: 90.2852 },
      { name: "Jhalokathi", lat: 22.6785, lng: 90.0528 },
      { name: "Barguna", lat: 22.8635, lng: 90.5124 },
      { name: "Patuakhali", lat: 22.3084, lng: 90.3175 },
      { name: "Patuakhali Sadar", lat: 22.3517, lng: 90.3389 },
    ],
    distribution: {
      malls: 0.3,
      furniture: 0.45,
      electronics: 0.4,
      leisure: 0.45,
      medical: 0.65,
      transport: 0.65,
      companies: 0.35,
      education: 0.7,
      fashion: 0.4,
      fitness: 0.35,
      food: 0.7,
      others: 0.5,
      supermarket: 0.55,
    },
  },
  {
    id: "bd-sylhet",
    name: "Sylhet Division",
    division: "Sylhet",
    center: { lat: 24.2669, lng: 91.6729 },
    zoom: 7.6,
    pincodePrefix: "3",
    pincodeLength: 5,
    roads: ["Zindabazar Road", "Shahjalal Road", "Airport Road"],
    towns: [
      { name: "Sylhet", lat: 24.2669, lng: 91.6729 },
      { name: "Moulvibazar", lat: 24.4876, lng: 91.7513 },
      { name: "Sunamganj", lat: 24.7294, lng: 91.7614 },
      { name: "Habiganj", lat: 24.3744, lng: 91.7362 },
      { name: "Srimangal", lat: 24.3069, lng: 91.7426 },
      { name: "Jaflong", lat: 24.4444, lng: 91.9767 },
      { name: "Chhatak", lat: 24.7452, lng: 91.8133 },
    ],
    distribution: {
      malls: 0.4,
      furniture: 0.5,
      electronics: 0.5,
      leisure: 0.7,
      medical: 0.7,
      transport: 0.55,
      companies: 0.45,
      education: 0.8,
      fashion: 0.55,
      fitness: 0.45,
      food: 0.75,
      others: 0.5,
      supermarket: 0.6,
    },
  },
  {
    id: "bd-rangpur",
    name: "Rangpur Division",
    division: "Rangpur",
    center: { lat: 25.7547, lng: 89.2537 },
    zoom: 7.6,
    pincodePrefix: "5",
    pincodeLength: 5,
    roads: ["Sadar Road", "College Road", "BSCIC Road"],
    towns: [
      { name: "Rangpur", lat: 25.7547, lng: 89.2537 },
      { name: "Dinajpur", lat: 25.7462, lng: 89.2833 },
      { name: "Gaibandha", lat: 25.8583, lng: 89.8586 },
      { name: "Kurigram", lat: 25.8368, lng: 89.7333 },
      { name: "Lalmonirhat", lat: 25.9319, lng: 89.5705 },
      { name: "Nilphamari", lat: 25.9312, lng: 88.8561 },
      { name: "Panchagarh", lat: 26.1422, lng: 88.9505 },
      { name: "Thakurgaon", lat: 26.0427, lng: 88.9031 },
    ],
    distribution: {
      malls: 0.35,
      furniture: 0.45,
      electronics: 0.45,
      leisure: 0.5,
      medical: 0.7,
      transport: 0.55,
      companies: 0.4,
      education: 0.85,
      fashion: 0.4,
      fitness: 0.4,
      food: 0.75,
      others: 0.5,
      supermarket: 0.65,
    },
  },
  {
    id: "bd-mymensingh",
    name: "Mymensingh Division",
    division: "Mymensingh",
    center: { lat: 24.7271, lng: 90.4083 },
    zoom: 7.6,
    pincodePrefix: "2",
    pincodeLength: 5,
    roads: ["Sadar Road", "College Road", "BSCIC Road"],
    towns: [
      { name: "Mymensingh", lat: 24.7271, lng: 90.4083 },
      { name: "Jamalpur", lat: 25.0056, lng: 90.4798 },
      { name: "Sherpur", lat: 24.9131, lng: 90.0091 },
      { name: "Netrokona", lat: 24.8492, lng: 90.7776 },
      { name: "Fulbaria", lat: 24.5639, lng: 90.1291 },
      { name: "Gafargaon", lat: 24.5607, lng: 90.2513 },
      { name: "Bhaluka", lat: 24.6456, lng: 90.2989 },
    ],
    distribution: {
      malls: 0.35,
      furniture: 0.45,
      electronics: 0.45,
      leisure: 0.5,
      medical: 0.65,
      transport: 0.55,
      companies: 0.4,
      education: 0.8,
      fashion: 0.4,
      fitness: 0.4,
      food: 0.7,
      others: 0.5,
      supermarket: 0.6,
    },
  },
];

export function getDivisionByCityId(cityId: string): DivisionSeed | undefined {
  return BANGLADESH_DIVISIONS.find((d) => d.id === cityId);
}

export function isBangladeshDivisionCity(cityId: string): boolean {
  return cityId.startsWith("bd-");
}

/* ================================================================== */
/* Bangladesh POI generator (deterministic, schema-identical to Delhi) */
/* ================================================================== */

const ROOTS: Record<CategoryKey, string[]> = {
  malls: [
    "Bashundhara City",
    "Jamuna Future Park",
    "Yunus Center",
    "Pickaboo Square",
    "Shimanto Square",
    "City Centre",
    "Eastern Plaza",
    "Mascot Plaza",
    "Level 3",
    "Polo Market",
  ],
  furniture: [
    "Hatil",
    "Otobi",
    "Navana Furniture",
    "Gazi Furniture",
    "Partex Furniture",
    "RFL Furniture",
    "Amin Fashion",
    "Brothers Furniture",
    "Akhtar Furniture",
    "Wood Art",
  ],
  electronics: [
    "TechWorld",
    "Ryans Computers",
    "Star Tech",
    "Computer Source",
    "Smart Electronics",
    "Galaxy Mobile",
    "Singer Plus",
    "Electro Mart",
    "Digital Hub",
    "Mega Byte",
  ],
  leisure: [
    "Star Cineplex",
    "Blockbuster Cinemas",
    "Momo Inn",
    "Fun Factory",
    "Smaaash BD",
    "Sky Zone",
    "Royal Bowling",
    "Time Zone BD",
    "Playhouse",
    "Wonderland Park",
  ],
  medical: [
    "Apollo Hospital",
    "Square Hospital",
    "United Hospital",
    "Labaid Hospital",
    "Popular Diagnostic",
    "Ibn Sina",
    "Medinova",
    "Green Life Medical",
    "BSMMU",
    "Bangabandhu Sheikh Mujib Medical",
  ],
  transport: [
    "Uber Hub",
    "Pathao Zone",
    "Obhai Point",
    "Shohagh Bus Counter",
    "Green Line",
    "Hanif Enterprise",
    "Soudia Coach",
    "BRTC Counter",
    "Dhaka Metro Station",
    "Airport Rail Station",
  ],
  companies: [
    "BRAC",
    "Grameenphone HQ",
    "bKash Tower",
    "Walton HQ",
    "Beximco",
    "PRAN-RFL",
    "Square Group",
    "ACI Limited",
    "Grameen Bank",
    "City Bank Tower",
  ],
  education: [
    "BUET",
    "Dhaka University",
    "North South University",
    "BRAC University",
    "IUT Gazipur",
    "AUST",
    "Jahangirnagar University",
    "Chittagong University",
    "Rajshahi University",
    "Khulna University",
  ],
  fashion: [
    "Yellow",
    "Le Reve",
    "Cats Eye",
    "Westecs",
    "Sailor",
    "Aarong",
    "Ecstasy",
    "Plus Point",
    "Sewell",
    "Menzclub",
  ],
  fitness: [
    "Arena Fitness",
    "Gold's Gym BD",
    "Fitness 21",
    "Power House Gym",
    "Hercules Gym",
    "Pulse Fitness",
    "Energize",
    "Yoga Studio BD",
    "Flex Gym",
    "Titan Fitness",
  ],
  food: [
    "Sultan Dine",
    "Kacchi Bhai",
    "Haji Biriyani",
    "Star Kabab",
    "Chillox",
    "Pizza Hut BD",
    "KFC Bangladesh",
    "BFC",
    "Takeout",
    "Madchef",
  ],
  others: [
    "City Salon",
    "Fresh Laundry",
    "Studio 6",
    "Gift Gallery",
    "Pet Care",
    "Quick Fix",
    "Print Shop",
    "Tailor Hub",
    "CleanPro",
    "Decor Den",
  ],
  supermarket: [
    "Shwapno",
    "Agora",
    "Meena Bazar",
    "Daily Shopping",
    "Unimart",
    "Spencer's BD",
    "Prince Bazar",
    "Sultana Mart",
    "Family Mart",
    "Lalmatia Super",
  ],
};

const BRANDS: Record<CategoryKey, string[]> = {
  malls: ["Bashundhara Group", "Navana", "S Alam"],
  furniture: ["Hatil", "Otobi", "RFL", "Partex"],
  food: ["KFC", "Pizza Hut", "Chillox", "BFC", "Madchef"],
  fashion: ["Yellow", "Aarong", "Ecstasy", "Sailor"],
  fitness: ["Gold's Gym", "Pulse Fitness"],
  electronics: ["Samsung", "Xiaomi", "Walton", "Singer", "LG"],
  supermarket: ["Shwapno", "Agora", "Meena Bazar"],
  others: ["Amazon", "Daraz", "Evaly"],
  leisure: ["Star Cineplex", "Blockbuster"],
  medical: ["Square", "Apollo", "Labaid"],
  transport: ["Uber", "Pathao", "Obhai", "BRTC"],
  companies: ["BRAC", "bKash", "Grameenphone", "Walton"],
  education: ["BUET", "DU", "NSU", "BRAC University"],
};

const SUB_CATS: Record<CategoryKey, string[]> = {
  malls: ["Fashion Mall", "Family Mall", "Luxury Mall", "Outlet Centre"],
  furniture: ["Sofa", "Bedroom Set", "Dining Set", "Office Furniture", "Mattress"],
  electronics: ["Mobiles", "TV & Audio", "Computers", "Home Appliances"],
  leisure: ["Cinema", "Gaming Arcade", "Bowling", "Family Zone"],
  medical: ["General Clinic", "Pharmacy", "Diagnostics", "Hospital", "Dental"],
  transport: ["Taxi Hub", "Metro", "Bus Counter", "Car Rental", "Parking"],
  companies: ["IT Services", "Banking", "Telecom", "FMCG", "Pharma"],
  education: ["University", "Coaching", "School", "College", "Skill Centre"],
  fashion: ["Men", "Women", "Kids", "Footwear", "Ethnic"],
  fitness: ["Gym", "Yoga", "CrossFit", "Dance Studio"],
  food: ["Bangladeshi", "Indian", "Chinese", "Fast Food", "Cafe", "Bakery"],
  others: ["Salon", "Laundry", "Photography", "Repair Shop"],
  supermarket: ["Grocery", "Fresh Produce", "Household", "Bakery"],
};

const TYPES: Record<CategoryKey, string[]> = {
  malls: ["shopping_mall", "retail_centre"],
  furniture: ["furniture_store", "home_decor_store"],
  electronics: ["electronics_store", "mobile_shop", "appliance_store"],
  leisure: ["cinema", "amusement_centre"],
  medical: ["clinic", "pharmacy", "hospital"],
  transport: ["transport_hub", "metro_station", "bus_counter"],
  companies: ["corporate_office", "bpo", "headquarters"],
  education: ["university", "coaching_centre", "school"],
  fashion: ["clothing_store", "fashion_store", "footwear_store"],
  fitness: ["gym", "fitness_centre", "yoga_studio"],
  food: ["restaurant", "cafe", "fast_food", "bakery"],
  others: ["service", "retail"],
  supermarket: ["supermarket", "grocery_store"],
};

const SERVICES: Record<CategoryKey, string[]> = {
  malls: ["Parking", "Food Court", "Free Wi-Fi", "Wheelchair Access"],
  furniture: ["In-store Shopping", "Delivery", "Assembly", "Financing"],
  electronics: ["In-store Shopping", "Delivery", "Installation", "EMI"],
  leisure: ["Online Booking", "Group Tickets", "Food Court", "Parking"],
  medical: ["Appointments", "Walk-ins", "Pharmacy", "Insurance"],
  transport: ["24/7", "Online Booking", "Card Payment"],
  companies: ["Visitor Parking", "Cafeteria", "24/7 Security"],
  education: ["Admissions Open", "Scholarships", "Transport", "Hostel"],
  fashion: ["In-store Shopping", "Home Delivery", "Alterations"],
  fitness: ["Membership", "Personal Training", "Group Classes", "Lockers"],
  food: ["Dine-in", "Takeaway", "Delivery", "Outdoor Seating"],
  others: ["Same-day Service", "Walk-ins", "Card Payment"],
  supermarket: ["In-store", "Delivery", "Self Checkout", "Fresh Stock"],
};

const COST: Record<CategoryKey, [number, number]> = {
  malls: [400, 3500],
  furniture: [4000, 60000],
  electronics: [1500, 90000],
  leisure: [200, 2000],
  medical: [100, 4000],
  transport: [20, 400],
  companies: [800, 15000],
  education: [1000, 12000],
  fashion: [250, 5000],
  fitness: [400, 10000],
  food: [80, 1000],
  others: [80, 2500],
  supermarket: [40, 1500],
};

const pick = <T,>(arr: T[], r: () => number) =>
  arr[Math.floor(r() * arr.length)];

const bracket = (arr: string[], r: () => number): string => {
  const n = 1 + Math.floor(r() * Math.min(2, arr.length));
  const chosen: string[] = [];
  const used = new Set<number>();
  while (chosen.length < n) {
    const i = Math.floor(r() * arr.length);
    if (!used.has(i)) {
      used.add(i);
      chosen.push(arr[i]);
    }
  }
  return `[${chosen.map((c) => `[${c}]`).join(",")}]`;
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makePincode(prefix: string, length: number, rng: () => number): string {
  const digits = Math.max(0, length - prefix.length);
  let suffix = "";
  for (let i = 0; i < digits; i++) suffix += Math.floor(rng() * 10);
  return prefix + suffix;
}

function genForDivision(
  div: DivisionSeed,
  category: CategoryKey,
  rng: () => number,
): LocationData[] {
  const roots = ROOTS[category];
  const brands = BRANDS[category];
  const subs = SUB_CATS[category];
  const types = TYPES[category];
  const services = SERVICES[category];
  const [cMin, cMax] = COST[category];
  // record count scales with category weight 0..1 -> 30..160
  const baseCount = 30 + Math.round((div.distribution[category] ?? 0.5) * 130);

  return Array.from({ length: baseCount }, (_, i) => {
    const town = pick(div.towns, rng);
    const jitter = 0.018;
    const lat = town.lat + (rng() - 0.5) * jitter * 5;
    const lng = town.lng + (rng() - 0.5) * jitter * 5;
    const name = `${pick(roots, rng)} \u2014 ${town.name}`;
    const pin = makePincode(div.pincodePrefix, div.pincodeLength, rng);
    return {
      id: `${div.id}:${category}:${i}`,
      name,
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      category,
      sub_categories: bracket(subs, rng),
      pincode: pin,
      type: pick(types, rng),
      address: `${name}, ${pick(div.roads, rng)}, ${town.name}, ${div.name}, ${pin}`,
      town_name: town.name.toLowerCase(),
      brand_name: brands.length && rng() > 0.45 ? pick(brands, rng) : "N_A",
      number_of_votes: Math.floor(rng() * 1200),
      service_options: bracket(services, rng),
      cost_for_two: Math.round(cMin + rng() * (cMax - cMin)),
    };
  });
}

export interface BangladeshGenerationInput {
  divisionId?: string | null;
  category: CategoryKey;
}

/** Generate deterministic LocationData[] for Bangladesh divisions. */
export function generateBangladeshLocations(
  cityId: string,
  category: CategoryKey,
): LocationData[] {
  const div = getDivisionByCityId(cityId);
  if (!div) return [];
  const rng = mulberry32(hash(`${div.id}:${category}`));
  return genForDivision(div, category, rng);
}

/** Generate all data for a division across all categories (used for analytics/seed). */
export function generateAllBangladeshLocations(cityId: string): LocationData[] {
  const div = getDivisionByCityId(cityId);
  if (!div) return [];
  const all: LocationData[] = [];
  const cats: CategoryKey[] = [
    "malls",
    "furniture",
    "electronics",
    "leisure",
    "medical",
    "transport",
    "companies",
    "education",
    "fashion",
    "fitness",
    "food",
    "others",
    "supermarket",
  ];
  for (const c of cats) {
    const rng = mulberry32(hash(`${div.id}:${c}`));
    all.push(...genForDivision(div, c, rng));
  }
  return all;
}

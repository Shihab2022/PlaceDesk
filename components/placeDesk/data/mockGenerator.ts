import type {
  CategoryConfig,
  CategoryKey,
  CityDef,
  LocationData,
} from "./types";
import { mulberry32 } from "./types";

const SUFFIX = ["Store", "Outlet", "Plus", "Square", "Zone", "House"];

const ROOTS: Record<CategoryKey, string[]> = {
  malls: ["Select Citywalk","Phoenix Marketcity","Ambience Mall","DLF Emporio","Inorbit Mall","Lulu Mall","Viviana Mall","Quest Mall","Nexus Mall","Pacific Mall"],
  furniture: ["Urban Ladder","Pepperfry","Nilkamal","Durian","HomeTown","Wooden Street","Wakefit","Mint Tree","Spacewood","Livspace"],
  electronics: ["Croma","Reliance Digital","Vijay Sales","Poorvika","iStore","Volt Edge","Circuit City","Nova Gadgets","Amplify","TechSpot"],
  leisure: ["PVR Cinemas","INOX","Fun City","Smaaash","Miraj Cinemas","Play Arena","Skyborne Trampoline","Bowling Co.","TimeZone","Adlabs"],
  medical: ["Apollo Clinic","Max Healthcare","Fortis","MedPlus","Netmeds","Aster Prime","Care Point","Medanta","Lifeline","City Hospital"],
  transport: ["Uber Hub","Ola Zone","RedBus Office","Metro Connects","Rapido Base","BluSmart Station","MyChoize Rental","Savaari Desk","CityCab Hub","Zoomcar Zone"],
  companies: ["Cognizant","Infosys","TCS","Wipro","Accenture","Deloitte","Capgemini","IBM","Microsoft","Amazon"],
  education: ["FIITJEE","BYJU'S Centre","VidyaMandir","Sri Chaitanya","Narayana","Aakash","Pathshala","EduBridge","Sage Path","Meridian"],
  fashion: ["Zudio","Pantaloons","Fabindia","Max Fashion","Global Desi","Anokhi","Lifestyle","Trends","Manyavar","Soch"],
  fitness: ["Cult.fit","Gold's Gym","Fitness First","Talwalkars","Multifit","Anytime Fitness","Sweat Studio","Pulse Active","BodyZone","Yoga Roots"],
  food: ["Domino's","KFC","McDonald's","Barbeque Nation","Chai Point","Dunkin'","Saravana Bhavan","Wow! Momo","Biryani Blues","Pizza Bay"],
  others: ["City Salon","Sparkle Dryclean","U Photo Studio","Gift Galaxy","Pet Paw Spa","Event Hub","Repair Zone","Key Maker","FreshnClean","Decor Den"],
  supermarket: ["D Mart","Big Bazaar","Reliance Smart","More","Spencer's","Star Bazaar","Heritage Fresh","FairPrice","Shoprite","Nature's Basket"],
};

const BRANDS: Record<CategoryKey, string[]> = {
  electronics: ["Samsung","LG","Sony","Xiaomi","Apple","Bose","Whirlpool","Panasonic"],
  furniture: ["IKEA","Godrej Interio","Sleepwell","HomeTown"],
  food: ["Pizza Hut","Burger King","Taco Bell","Starbucks"],
  fashion: ["Levi's","H&M","Tommy Hilfiger","Adidas","Nike"],
  fitness: ["Nike","Puma","Decathlon"],
  others: ["Amazon","Flipkart"],
  supermarket: ["Tata","Hindustan Unilever","ITC"],
  malls: [], leisure: [], medical: [], transport: [], companies: [], education: [],
};

const SUB_CATS: Record<CategoryKey, string[]> = {
  malls: ["Fashion Mall","Family Mall","Luxury Mall","Outlet Centre","Entertainment Centre"],
  furniture: ["Sofa","Bedroom Set","Dining Set","Office Furniture","Mattress","Home Decor"],
  electronics: ["Mobiles & Accessories","TV & Audio","Computers","Home Appliances","Cameras"],
  leisure: ["Cinema","Gaming Arcade","Bowling","Amusement","Family Zone"],
  medical: ["General Clinic","Pharmacy","Diagnostics","Dental","Eye Care","Dermatology"],
  transport: ["Taxi Hub","Metro Access Point","Bus Depot","Car Rental","Parking","Service Station"],
  companies: ["IT Services","Consulting","BPO","Product Company","Finance","Logistics"],
  education: ["Coaching Centre","Play School","Higher Secondary","Degree College","Language School","Skill Centre"],
  fashion: ["Men's Wear","Women's Wear","Kids Wear","Footwear","Accessories","Ethnic Wear"],
  fitness: ["Gym","Yoga Studio","CrossFit","Dance Studio","MMA","Zumba"],
  food: ["North Indian","South Indian","Chinese","Fast Food","Cafe","Bakery","Biryani","Street Food"],
  others: ["Salon","Laundry","Photography","Gifting","Pet Care","Repair Shop"],
  supermarket: ["Grocery","Fresh Produce","Household","Personal Care","Beverages","Bakery"],
};

const TYPES: Record<CategoryKey, string[]> = {
  malls: ["shopping_mall","retail_centre"],
  furniture: ["furniture_store","home_decor_store"],
  electronics: ["electronics_store","mobile_phone_store","appliance_store"],
  leisure: ["multiplex","amusement_centre","entertainment"],
  medical: ["clinic","pharmacy","hospital"],
  transport: ["transport_services","taxi_stand","metro_station"],
  companies: ["corporate_office","bpo","startup"],
  education: ["coaching_center","school","college"],
  fashion: ["clothing_store","fashion_store","footwear_store"],
  fitness: ["gym","fitness_center","yoga_studio"],
  food: ["restaurant","cafe","fast_food","bakery"],
  others: ["service","retail"],
  supermarket: ["supermarket","grocery_store"],
};

const SERVICES: Record<CategoryKey, string[]> = {
  malls: ["Parking","Food Court","Wheelchair Access","Free Wi-Fi"],
  furniture: ["In-store Shopping","Delivery","Assembly","Financing"],
  electronics: ["In-store Shopping","Delivery","Installation","Repair Services","Curbside Pickup"],
  leisure: ["Online Booking","Group Tickets","Food & Beverage","Parking"],
  medical: ["Appointments","Walk-ins","Pharmacy","Online Consultation","Insurance"],
  transport: ["24/7","Online Booking","Card Payment","Hailing Available"],
  companies: ["On-site Parking","Visitor Parking","24/7 Security","Cafeteria"],
  education: ["Weekend Classes","Admissions Open","Scholarships","Transport"],
  fashion: ["In-store Shopping","Home Delivery","Alterations","Try-on","Click & Collect"],
  fitness: ["Membership","Personal Training","Group Classes","Lockers","Free Trial"],
  food: ["Dine-in","Takeaway","Delivery","Outdoor Seating","Reservations"],
  others: ["Same-day Service","Membership","Walk-ins","Cash & Card"],
  supermarket: ["In-store","Delivery","Self Checkout","Fresh Stock","Home Delivery"],
};

const COST: Record<CategoryKey, [number, number]> = {
  malls: [500, 4000],
  furniture: [5000, 80000],
  electronics: [2000, 120000],
  leisure: [200, 2500],
  medical: [100, 5000],
  transport: [20, 500],
  companies: [1000, 20000],
  education: [1000, 15000],
  fashion: [300, 6000],
  fitness: [500, 12000],
  food: [100, 1200],
  others: [100, 3000],
  supermarket: [50, 2000],
};

const pick = <T,>(arr: T[], r: () => number) => arr[Math.floor(r() * arr.length)];

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

/* ------------------------------------------------------------------ */
/* Deterministic generator — mirrors the Delhi API record schema       */
/* ------------------------------------------------------------------ */

export function generateMockLocations(
  city: CityDef,
  category: CategoryConfig,
): LocationData[] {
  const rng = mulberry32(hash(`${city.id}:${category.key}`));
  const roots = ROOTS[category.key];
  const brands = BRANDS[category.key];
  const subs = SUB_CATS[category.key];
  const types = TYPES[category.key];
  const services = SERVICES[category.key];
  const [costMin, costMax] = COST[category.key];
  const count = category.mockCount;

  return Array.from({ length: count }, (_, i) => {
    const area = pick(city.districts, rng);
    const jitter = 0.012;
    const lat = area.lat + (rng() - 0.5) * jitter * 5;
    const lng = area.lng + (rng() - 0.5) * jitter * 5;
    const name = `${pick(roots, rng)}${rng() < 0.45 ? ` ${pick(SUFFIX, rng)}` : ""}`;
    const pin = makePincode(city, rng);
    return {
      id: `${city.id}:${category.key}:${i}`,
      name,
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      category: category.key,
      sub_categories: bracket(subs, rng),
      pincode: pin,
      type: pick(types, rng),
      address: `${name}, ${pick(city.roads, rng)}, ${area.name}, ${city.label}, ${pin}`,
      town_name: area.name.toLowerCase(),
      brand_name: brands.length && rng() > 0.5 ? pick(brands, rng) : "N_A",
      number_of_votes: Math.floor(rng() * 1200),
      service_options: bracket(services, rng),
      cost_for_two: Math.round(costMin + rng() * (costMax - costMin)),
    };
  });
}

function makePincode(city: CityDef, rng: () => number): string {
  const digits = city.pincodeLength - city.pincode.length;
  let suffix = "";
  for (let i = 0; i < digits; i++) suffix += Math.floor(rng() * 10);
  return city.pincode + suffix;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
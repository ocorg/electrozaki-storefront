// Fact sheets of the phone models that get an offer page (/offres/<slug>).
// Manufacturers' official specifications, written once in a neutral
// technical form (numbers, units, product names) that reads the same in
// every language; the row names are translated (lib/offers/copy).
//
// A model with promo units but no sheet here still gets its page, just
// without the "why" and "specifications" sections. Facts that vary by
// country version (SIM tray, Samsung's chip) are only stated when they are
// known for the shop's units.

export type ModelFacts = {
  /** shown as the page title, e.g. "iPhone 14 Pro" */
  name: string;
  /** iPhones measure their own battery health (Settings > Battery) */
  batteryHealth: boolean;
  /** charging port, for the add-ons (cables, chargers) */
  port: "lightning" | "usb-c";
  // Highlights (the "why" cards): short titles.
  chip: string;
  displayTitle: string;
  cameraTitle: string;
  /** hours of video playback when new (Apple's figure), if published */
  videoHours?: number;
  durabilityTitle: string;
  extra?: string;
  // The specifications table.
  specs: {
    display: string;
    chip: string;
    rearCameras: string;
    frontCamera: string;
    battery: string;
    charging: string;
    durability: string;
    network: string;
    sim?: string;
    size: string;
  };
};

/** Keyed by the offer page's slug (lib/offers/phone-offers.ts → offerSlug). */
export const MODEL_FACTS: Record<string, ModelFacts> = {
  "iphone-13": {
    name: "iPhone 13",
    batteryHealth: true,
    port: "lightning",
    chip: "A15 Bionic",
    displayTitle: "6.1″ Super Retina XDR",
    cameraTitle: "12 MP + 12 MP",
    videoHours: 19,
    durabilityTitle: "IP68 · Ceramic Shield",
    extra: "5G · MagSafe · Face ID",
    specs: {
      display: "6.1″ Super Retina XDR OLED · 2532 × 1170 · 60 Hz · 1200 nits HDR",
      chip: "A15 Bionic · CPU 6-core · GPU 4-core",
      rearCameras: "12 MP wide ƒ/1.6 (sensor-shift) + 12 MP ultra-wide · 4K 60 fps · Cinematic",
      frontCamera: "12 MP TrueDepth · Face ID",
      battery: "3227 mAh · 19 h video",
      charging: "Lightning · 20W (50 % / 30 min) · MagSafe 15W · Qi",
      durability: "IP68 (6 m, 30 min) · Ceramic Shield",
      network: "5G · Wi-Fi 6 · Bluetooth 5.0 · NFC",
      sim: "Nano-SIM + eSIM",
      size: "146.7 × 71.5 × 7.65 mm · 173 g",
    },
  },
  "iphone-13-pro": {
    name: "iPhone 13 Pro",
    batteryHealth: true,
    port: "lightning",
    chip: "A15 Bionic",
    displayTitle: "6.1″ ProMotion 120 Hz",
    cameraTitle: "12 MP × 3 · Zoom 3×",
    videoHours: 22,
    durabilityTitle: "IP68 · Ceramic Shield",
    extra: "5G · LiDAR · MagSafe",
    specs: {
      display: "6.1″ Super Retina XDR OLED · ProMotion 10–120 Hz · 2532 × 1170 · 1200 nits HDR",
      chip: "A15 Bionic · CPU 6-core · GPU 5-core",
      rearCameras: "12 MP wide ƒ/1.5 + 12 MP ultra-wide (macro) + 12 MP telephoto 3× · LiDAR · ProRAW · ProRes",
      frontCamera: "12 MP TrueDepth · Face ID",
      battery: "3095 mAh · 22 h video",
      charging: "Lightning · 20W (50 % / 30 min) · MagSafe 15W · Qi",
      durability: "IP68 (6 m, 30 min) · Ceramic Shield · stainless steel",
      network: "5G · Wi-Fi 6 · Bluetooth 5.0 · NFC",
      sim: "Nano-SIM + eSIM",
      size: "146.7 × 71.5 × 7.65 mm · 203 g",
    },
  },
  "iphone-13-pro-max": {
    name: "iPhone 13 Pro Max",
    batteryHealth: true,
    port: "lightning",
    chip: "A15 Bionic",
    displayTitle: "6.7″ ProMotion 120 Hz",
    cameraTitle: "12 MP × 3 · Zoom 3×",
    videoHours: 28,
    durabilityTitle: "IP68 · Ceramic Shield",
    extra: "5G · LiDAR · MagSafe",
    specs: {
      display: "6.7″ Super Retina XDR OLED · ProMotion 10–120 Hz · 2778 × 1284 · 1200 nits HDR",
      chip: "A15 Bionic · CPU 6-core · GPU 5-core",
      rearCameras: "12 MP wide ƒ/1.5 + 12 MP ultra-wide (macro) + 12 MP telephoto 3× · LiDAR · ProRAW · ProRes",
      frontCamera: "12 MP TrueDepth · Face ID",
      battery: "4352 mAh · 28 h video",
      charging: "Lightning · 20W (50 % / 35 min) · MagSafe 15W · Qi",
      durability: "IP68 (6 m, 30 min) · Ceramic Shield · stainless steel",
      network: "5G · Wi-Fi 6 · Bluetooth 5.0 · NFC",
      sim: "Nano-SIM + eSIM",
      size: "160.8 × 78.1 × 7.65 mm · 238 g",
    },
  },
  "iphone-14": {
    name: "iPhone 14",
    batteryHealth: true,
    port: "lightning",
    chip: "A15 Bionic",
    displayTitle: "6.1″ Super Retina XDR",
    cameraTitle: "12 MP + 12 MP",
    videoHours: 20,
    durabilityTitle: "IP68 · Ceramic Shield",
    extra: "5G · MagSafe · Face ID",
    specs: {
      display: "6.1″ Super Retina XDR OLED · 2532 × 1170 · 60 Hz · 1200 nits HDR",
      chip: "A15 Bionic · CPU 6-core · GPU 5-core",
      rearCameras: "12 MP main ƒ/1.5 (sensor-shift) + 12 MP ultra-wide · Action mode · 4K 60 fps",
      frontCamera: "12 MP TrueDepth autofocus · Face ID",
      battery: "3279 mAh · 20 h video",
      charging: "Lightning · 20W (50 % / 30 min) · MagSafe 15W · Qi",
      durability: "IP68 (6 m, 30 min) · Ceramic Shield",
      network: "5G · Wi-Fi 6 · Bluetooth 5.3 · NFC",
      size: "146.7 × 71.5 × 7.80 mm · 172 g",
    },
  },
  "iphone-14-pro": {
    name: "iPhone 14 Pro",
    batteryHealth: true,
    port: "lightning",
    chip: "A16 Bionic",
    displayTitle: "6.1″ ProMotion · Dynamic Island",
    cameraTitle: "48 MP · Zoom 3×",
    videoHours: 23,
    durabilityTitle: "IP68 · Ceramic Shield",
    extra: "Always-On · LiDAR · MagSafe",
    specs: {
      display: "6.1″ Super Retina XDR OLED · ProMotion 1–120 Hz · Always-On · Dynamic Island · 2000 nits outdoors",
      chip: "A16 Bionic · CPU 6-core · GPU 5-core",
      rearCameras: "48 MP main ƒ/1.78 + 12 MP ultra-wide + 12 MP telephoto 3× · LiDAR · ProRAW · 4K 60 fps",
      frontCamera: "12 MP TrueDepth autofocus · Face ID",
      battery: "3200 mAh · 23 h video",
      charging: "Lightning · 20W (50 % / 30 min) · MagSafe 15W · Qi",
      durability: "IP68 (6 m, 30 min) · Ceramic Shield · stainless steel",
      network: "5G · Wi-Fi 6 · Bluetooth 5.3 · NFC",
      size: "147.5 × 71.5 × 7.85 mm · 206 g",
    },
  },
  "iphone-14-pro-max": {
    name: "iPhone 14 Pro Max",
    batteryHealth: true,
    port: "lightning",
    chip: "A16 Bionic",
    displayTitle: "6.7″ ProMotion · Dynamic Island",
    cameraTitle: "48 MP · Zoom 3×",
    videoHours: 29,
    durabilityTitle: "IP68 · Ceramic Shield",
    extra: "Always-On · LiDAR · MagSafe",
    specs: {
      display: "6.7″ Super Retina XDR OLED · ProMotion 1–120 Hz · Always-On · Dynamic Island · 2000 nits outdoors",
      chip: "A16 Bionic · CPU 6-core · GPU 5-core",
      rearCameras: "48 MP main ƒ/1.78 + 12 MP ultra-wide + 12 MP telephoto 3× · LiDAR · ProRAW · 4K 60 fps",
      frontCamera: "12 MP TrueDepth autofocus · Face ID",
      battery: "4323 mAh · 29 h video",
      charging: "Lightning · 20W (50 % / 35 min) · MagSafe 15W · Qi",
      durability: "IP68 (6 m, 30 min) · Ceramic Shield · stainless steel",
      network: "5G · Wi-Fi 6 · Bluetooth 5.3 · NFC",
      size: "160.7 × 77.6 × 7.85 mm · 240 g",
    },
  },
  "galaxy-s23": {
    name: "Galaxy S23",
    batteryHealth: false,
    port: "usb-c",
    chip: "Snapdragon 8 Gen 2 for Galaxy",
    displayTitle: "6.1″ AMOLED 120 Hz",
    cameraTitle: "50 MP · Zoom 3×",
    durabilityTitle: "IP68 · Gorilla Glass Victus 2",
    extra: "5G · Wi-Fi 6E · NFC",
    specs: {
      display: "6.1″ Dynamic AMOLED 2X · FHD+ 2340 × 1080 · 48–120 Hz",
      chip: "Snapdragon 8 Gen 2 for Galaxy",
      rearCameras: "50 MP wide + 12 MP ultra-wide + 10 MP telephoto 3× · 8K video",
      frontCamera: "12 MP",
      battery: "3900 mAh",
      charging: "USB-C · 25W · wireless · reverse wireless",
      durability: "IP68 (1.5 m, 30 min) · Gorilla Glass Victus 2 · Armor Aluminum",
      network: "5G · Wi-Fi 6E · Bluetooth 5.3 · NFC",
      size: "146.3 × 70.9 × 7.6 mm · 168 g",
    },
  },
  "galaxy-s24": {
    name: "Galaxy S24",
    batteryHealth: false,
    port: "usb-c",
    chip: "Galaxy AI",
    displayTitle: "6.2″ AMOLED 1–120 Hz",
    cameraTitle: "50 MP · Zoom 3×",
    durabilityTitle: "IP68 · Gorilla Glass Victus 2",
    extra: "5G · Wi-Fi 6E · NFC",
    specs: {
      display: "6.2″ Dynamic AMOLED 2X · FHD+ 2340 × 1080 · 1–120 Hz · 2600 nits",
      chip: "Exynos 2400 / Snapdragon 8 Gen 3 for Galaxy · Galaxy AI",
      rearCameras: "50 MP wide + 12 MP ultra-wide + 10 MP telephoto 3× · 8K video",
      frontCamera: "12 MP",
      battery: "4000 mAh",
      charging: "USB-C · 25W · wireless · reverse wireless",
      durability: "IP68 (1.5 m, 30 min) · Gorilla Glass Victus 2 · Armor Aluminum",
      network: "5G · Wi-Fi 6E · Bluetooth 5.3 · NFC",
      size: "147 × 70.6 × 7.6 mm · 167 g",
    },
  },
  "galaxy-s24-ultra": {
    name: "Galaxy S24 Ultra",
    batteryHealth: false,
    port: "usb-c",
    chip: "Snapdragon 8 Gen 3 for Galaxy",
    displayTitle: "6.8″ QHD+ 1–120 Hz",
    cameraTitle: "200 MP · Zoom 5×",
    durabilityTitle: "IP68 · Titanium · Gorilla Armor",
    extra: "S Pen · Galaxy AI · 5G",
    specs: {
      display: "6.8″ Dynamic AMOLED 2X · QHD+ 3120 × 1440 · 1–120 Hz · 2600 nits",
      chip: "Snapdragon 8 Gen 3 for Galaxy · Galaxy AI",
      rearCameras: "200 MP wide + 12 MP ultra-wide + 10 MP telephoto 3× + 50 MP telephoto 5× · 8K video",
      frontCamera: "12 MP",
      battery: "5000 mAh",
      charging: "USB-C · 45W · wireless 15W · reverse wireless",
      durability: "IP68 (1.5 m, 30 min) · titanium frame · Corning Gorilla Armor",
      network: "5G · Wi-Fi 7 · Bluetooth 5.3 · NFC · S Pen",
      sim: "1 nano-SIM + eSIM",
      size: "162.3 × 79 × 8.6 mm · 232 g",
    },
  },
};

import type { GuidesText } from "./types";

// Buying guides, English.
export const en: GuidesText = {
  indexTitle: "Buying guides",
  indexMetaTitle: "Guides: buying a used iPhone in Morocco",
  indexMetaDescription: "Checking a used iPhone, understanding replaced parts, reading battery health: our guides to buy without bad surprises.",
  indexIntro: "The questions people ask us before buying a used phone, with clear answers and what we do in the shop.",
  eyebrow: "Buying guide",
  read: "Read the guide",
  updated: "Updated October 2026",
  others: "Other guides",
  priceExample: (model, replaced, original) => `For example, an ${model} starts at ${replaced} with "Replaced parts", against ${original} in "Very good condition".`,
  guides: {
    "verifier-iphone-occasion": {
      title: "How to check a used iPhone before buying it",
      metaTitle: "Check a used iPhone before buying: 10 points",
      metaDescription: "iCloud, IMEI, battery, replaced parts, screen, Face ID: the 10 checks to make before buying a used iPhone, in order.",
      intro:
        "A used iPhone can be a great deal, as long as you know what you're buying. Here are the checks to make, in order, whether you buy it from us, on Avito or from a friend. Allow about fifteen minutes.",
      sections: [
        {
          title: "1. The iCloud account: the one that can't be fixed",
          paragraphs: [
            "An iPhone still linked to its previous owner's account can't be used: that's Activation Lock. Before paying, the phone must be erased, removed from the previous owner's account, and show the \"Hello\" welcome screen. If it shows \"iPhone Locked to Owner\" or asks for an Apple ID that isn't yours, don't buy it.",
          ],
        },
        {
          title: "2. The IMEI",
          paragraphs: [
            "Dial [[*#06#]] or open [[Settings › General › About]]. The number must match the box and the invoice. A mismatch needs an explanation. Also check it isn't blocked (a phone reported lost or stolen).",
          ],
        },
        {
          title: "3. The battery",
          paragraphs: [
            "[[Settings › Battery › Battery Health]] shows the maximum capacity. At 80% and above, the battery is healthy. Below that, it lasts less through the day and the price should reflect it. Our battery guide explains everything.",
          ],
        },
        {
          title: "4. Replaced parts",
          paragraphs: [
            "Since iOS 15.2, [[Settings › General › About]] can show a \"Parts and Service History\" section if the iPhone has been repaired. It says \"Genuine Apple Part\" or \"Unknown Part\" for the screen, battery or camera. That isn't necessarily a defect, but you should know before buying: our guide on replaced parts explains what changes.",
          ],
        },
        {
          title: "5. The screen",
          list: [
            "Touch everywhere: drag an icon from one corner of the screen to the other.",
            "Dead pixels and spots: show an all-white image, then an all-black one.",
            "Burn-in (OLED screens): on a plain grey background, no shadow of the keyboard or top bar should show.",
            "Brightness and colours: turn brightness to maximum; colours should stay natural.",
          ],
        },
        {
          title: "6. Face ID or Touch ID",
          paragraphs: ["Set up your face or fingerprint and unlock several times. A Face ID that no longer works is rarely repairable outside Apple: check it without fail."],
        },
        {
          title: "7. The cameras",
          paragraphs: ["Test each lens (wide, ultra wide, zoom) and the front camera, and film a few seconds while walking: the image should stay steady and sharp, with no shaking or clicking."],
        },
        {
          title: "8. Sound, microphones and calls",
          paragraphs: ["Play a video on the speaker, record a voice memo and make a test call: you should hear well and be heard well."],
        },
        {
          title: "9. The network",
          paragraphs: ["In [[Settings › General › About]], \"No SIM restrictions\" means the iPhone is unlocked. Insert your SIM card, then check the network, Wi-Fi and Bluetooth."],
        },
        {
          title: "10. Buttons, charging and speed",
          paragraphs: ["Volume and power buttons, vibration, charging through the cable: everything should respond, and the iPhone should stay smooth when opening several apps."],
        },
      ],
      shopTitle: "At Electro Zaki",
      shop:
        "Every used phone goes through our 25-point Electro Zaki check before sale, and the result is shown on its page: battery health, replaced parts, condition. iCloud and Google accounts are removed, the IMEI is checked, the phone is updated and comes with a 3-month warranty. On delivery, you can check it with us on a video call, or in the shop in Meknes, and refuse the parcel if anything doesn't match its page.",
    },
    "pieces-origine-ou-remplacees": {
      title: "Original or replaced parts: what changes",
      metaTitle: "iPhone with original or replaced parts: what changes",
      metaDescription: "\"Genuine Apple Part\", \"Unknown Part\", \"Used\": what an iPhone shows after a repair, and what a replaced part really changes.",
      intro:
        "On our site, every used phone is graded \"Very good condition\", \"Good condition\" or \"Replaced parts\". The first two have only original parts. The third has had at least one part changed, and its page says which: screen, battery, camera… Here's what that means in practice.",
      sections: [
        {
          title: "How the iPhone shows it",
          paragraphs: ["Since iOS 15.2, when a part has been replaced, [[Settings › General › About]] shows a \"Parts and Service History\" section. According to Apple:"],
          list: [
            "**\"Genuine Apple Part\"**: an Apple part, installed following Apple's process.",
            "**\"Unknown Part\"**: the part isn't original, or Apple didn't complete its installation, or it came from another iPhone.",
            "**\"Used\"** (iPhone 15 and later, iOS 18): an original part that was already used in another iPhone.",
          ],
        },
        {
          title: "What Apple says",
          paragraphs: ["These messages don't stop you from using the iPhone, its battery, screen or camera. They can't be removed from Settings: they stay as a history."],
        },
        {
          title: "What changes, part by part",
          list: [
            "**Screen**: depending on the phone, the replacement screen is either original or compatible. A compatible screen can differ slightly in colours, peak brightness or smoothness. Ask us: we'll tell you which before you order.",
            "**Battery**: a new battery restores a recent phone's battery life, and after a replacement with us, battery health is still shown in Settings.",
            "**Camera**: quality depends on the part. We test every lens before sale.",
            "**Face ID**: it can't be replaced outside Apple. On our phones, it's tested and shown on the page.",
          ],
        },
        {
          title: "Why choose a \"Replaced parts\" phone",
          paragraphs: [
            "Same model, tested the same way and with the same 3-month warranty as the others, but cheaper. {prices} For everyday use, it's often the best value. To resell later or as a gift, prefer original parts.",
          ],
        },
      ],
      shopTitle: "At Electro Zaki",
      shop: "Nothing is hidden: every replaced part is written on the phone's page before you order. On request, we send you a screenshot of its \"Parts and Service History\" on WhatsApp.",
    },
    "sante-batterie-iphone": {
      title: "iPhone battery health: is 80% good?",
      metaTitle: "iPhone battery health: is 80% good?",
      metaDescription: "Where to see an iPhone's battery health, what 90%, 85% or 80% mean day to day, and when to replace it. With Apple's rule.",
      intro: "On a used iPhone, battery health is the first number people look at. Here's how to read it, and what it changes day to day.",
      sections: [
        {
          title: "Where to see it",
          paragraphs: ["[[Settings › Battery › Battery Health]] (or \"Battery Health & Charging\"). \"Maximum Capacity\" compares the battery with when it was new: 90% means it holds 90% of its original charge."],
        },
        {
          title: "Which number is good?",
          list: [
            "**90 to 100%**: like new, original battery life or close to it.",
            "**80 to 89%**: healthy. Normal wear for an iPhone used for a year or two; it lasts a normal day.",
            "**Below 80%**: Apple considers the battery worn. Battery life drops noticeably and the iPhone may recommend a replacement.",
          ],
          after: [
            "Apple says an iPhone battery is designed to keep 80% of its capacity after 500 full charge cycles (1,000 cycles for iPhone 15 and later). That's why, with us, a battery at 80% or more is graded \"good\", and a phone below 80% is sold for less.",
          ],
        },
        {
          title: "What about Samsung?",
          paragraphs: ["Galaxy phones don't show a percentage in Settings. Our technicians test the battery with the built-in diagnostics of the Samsung Members app, and watch its consumption, before sale. The condition is shown on the page."],
        },
        {
          title: "Making your battery last",
          list: [
            "Avoid heat: don't leave the phone in the sun or in a closed car.",
            "Turn on \"Optimised Battery Charging\" (and, on iPhone 15 and later, the 80% charge limit).",
            "Use a good-quality charger.",
          ],
        },
      ],
      shopTitle: "At Electro Zaki",
      shop: "Every iPhone's battery health is measured and shown on its page before sale. And if yours is tired, we replace batteries in the shop in Meknes, from 150 DH depending on the model.",
    },
  },
};

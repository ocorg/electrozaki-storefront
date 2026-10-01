import type { RepairTopicsText } from "./types";

// Repair topics — English.
export const en: RepairTopicsText = {
  ecran: {
    title: "Cracked or broken screen",
    shortTitle: "Broken screen",
    cardDescription: "Screen replacement for every brand, quality parts.",
    intro:
      "A smartphone screen is really two bonded layers: the glass (the protective cover) and the panel (LCD/OLED) with its touch digitizer. A crack that “only” reaches the glass can look cosmetic, but moisture and dust quickly seep in through the micro-cracks and end up reaching the panel.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "Touch still works despite the crack — should I still replace it?",
            answer:
              "Yes, it's recommended. Cracked glass keeps weakening every time you handle it, shards can cut, and moisture getting in through the crack can damage the panel underneath — a much more expensive repair than a simple glass replacement.",
          },
          {
            question: "Does Face ID still work after a screen replacement?",
            answer:
              "Yes. Face ID relies on the TrueDepth camera module in the notch, not on the screen itself. As long as that module isn't damaged separately (a drop on the top edge, for example), it keeps working normally after a screen change.",
          },
          {
            question: "Why do auto-brightness or True Tone seem different after the repair?",
            answer:
              "On some models, the brightness/True Tone sensor is paired in software with the original screen. A quality part that is properly recalibrated fixes this — which is why the choice of part and technician makes the difference.",
          },
        ],
      },
      {
        brand: "Samsung",
        entries: [
          {
            question: "I have dark spots or lines on the screen, but no visible break on the surface — what now?",
            answer:
              "It's a sign that the panel itself is damaged, not just the glass — common after a knock even with no visible crack. On most Galaxy phones the glass and panel form one block, so the whole module has to be replaced.",
          },
          {
            question: "Touch no longer responds in some areas although the glass looks intact?",
            answer:
              "A knock can damage the digitizer (the touch layer) without breaking the glass on the surface. It's a common fault that is easy to identify during the diagnosis before repair.",
          },
          {
            question: "Is there a way to test the screen before deciding on a repair?",
            answer:
              "Yes — Samsung's hidden diagnostic menu (dial *#0*# in the phone app) lets you test multitouch, dead pixels and vibration, useful to confirm how far the problem goes before a repair.",
          },
        ],
      },
      {
        brand: "Xiaomi",
        entries: [
          {
            question: "After a repair elsewhere, I get “ghost” touches that happen on their own?",
            answer:
              "That usually points to a badly reconnected touch ribbon or poor-quality adhesive during a previous replacement — an installation problem, not a problem with the part itself.",
          },
          {
            question: "MIUI shows “non-original part detected” after a screen change — is that serious?",
            answer:
              "No, it's an informational software notice on some Xiaomi models when the screen isn't the exact factory part — it doesn't stop normal use with an equivalent quality part.",
          },
        ],
      },
      {
        brand: "Huawei",
        entries: [
          {
            question: "My phone vibrates and rings when a call comes in, but the screen stays black after a drop?",
            answer:
              "It's often the screen connector (a ribbon knocked loose) or the backlight, not the motherboard — a fairly reassuring sign that points to a simple repair.",
          },
        ],
      },
      {
        brand: "Other brands",
        entries: [
          {
            question: "Do all brands use the same kind of screen?",
            answer:
              "No — LCD, AMOLED and their variants have different costs and sensitivities. The diagnosis tells whether only the outer glass or the whole module needs replacing, which has a big effect on the price.",
          },
        ],
      },
    ],
  },

  batterie: {
    title: "Battery that no longer holds a charge",
    shortTitle: "Battery",
    cardDescription: "Battery no longer holding a charge? We replace it.",
    intro:
      "Every lithium-ion battery naturally loses capacity over time — wear usually becomes noticeable after about 500 full charge cycles, a little sooner with frequent heat or constant charging to 100%. It isn't a defect, it's chemistry — but it's easy to replace.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "At what percentage does Apple recommend replacing the battery?",
            answer:
              "Apple considers a battery under 80% of maximum capacity (shown in Settings > Battery > Battery Health) to have reached the normal end of its life, and a replacement would bring back the original battery life and performance.",
          },
          {
            question: "My iPhone shuts off suddenly at 20–30% battery shown — why?",
            answer:
              "An ageing battery loses its ability to deliver a big burst of current (flash photo, gaming). The iPhone then protects itself and shuts down earlier than the percentage suggests.",
          },
          {
            question: "The “non-genuine battery” message appears after a replacement — is that a problem?",
            answer:
              "The iPhone checks the battery's authenticity through a dedicated chip. A quality battery that isn't officially paired can trigger this purely informational message without stopping the phone from working normally.",
          },
        ],
      },
      {
        brand: "Samsung",
        entries: [
          {
            question: "The battery percentage drops suddenly (e.g. 40% to 15%) — is that serious?",
            answer:
              "It's a classic symptom of a worn battery whose real capacity no longer matches the software's estimate. A replacement brings back a reliable reading and consistent battery life.",
          },
          {
            question: "My Galaxy gets very hot while charging — is the battery to blame?",
            answer:
              "Often it comes from using the phone while it charges (gaming, GPS, streaming), which works the processor and battery at the same time. An ageing battery can make the heat worse — worth checking in a diagnosis if it's new.",
          },
        ],
      },
      {
        brand: "Xiaomi",
        entries: [
          {
            question: "MIUI restricts apps in the background — is that linked to the physical battery?",
            answer:
              "No, it's a MIUI power-saving software feature, independent of the battery's real condition — it can delay notifications even with a brand-new battery.",
          },
          {
            question: "Does fast charging wear the battery out faster?",
            answer:
              "Used with the original or a certified charger, fast charging is designed to handle the heat it produces. It's mostly non-certified chargers, with incorrect voltage negotiation, that speed up wear.",
          },
        ],
      },
      {
        brand: "Huawei",
        entries: [
          {
            question: "My battery drains fast even though I barely use the phone?",
            answer:
              "Before concluding it's a hardware problem, check the background apps that keep restarting — sometimes seen on models without Google services. If the drain continues after a software check, a battery diagnosis is worth it.",
          },
        ],
      },
      {
        brand: "Other brands",
        entries: [
          {
            question: "How can I tell it's really the battery and not something else?",
            answer:
              "Sudden shutdowns, a visibly swollen back, battery life collapsing within a few weeks, or unusual overheating are the most reliable signs. A quick diagnosis confirms it before any replacement.",
          },
        ],
      },
    ],
  },

  connecteur: {
    title: "Charging port that won't charge or charges badly",
    shortTitle: "Charging port",
    cardDescription: "Phone won't charge or charges badly — quick repair.",
    intro:
      "The most common cause of a temperamental charging port isn't an electronic fault but a mechanical blockage: dust, pocket lint or oxidation from moisture stop the pins from making proper contact with the cable.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "“Liquid detected” stops charging — what should I do?",
            answer:
              "It's a software protection that deliberately blocks charging to avoid a short circuit. Let the port dry completely in open air (never with a heat source) before trying again — forcing a charge during the alert can make the damage worse.",
          },
          {
            question: "The phone charges, but much more slowly than before — is the port to blame?",
            answer:
              "Usually not — a non-certified or worn cable or charger is the first cause of slow charging. Testing with a different certified cable and adapter isolates the real problem before suspecting the port.",
          },
        ],
      },
      {
        brand: "Samsung, Xiaomi, Huawei (USB-C)",
        entries: [
          {
            question: "The cable sits loosely or wobbles in the port — is that normal?",
            answer:
              "No — a USB-C connector in good condition holds the cable firmly. Play or unusual movement signals mechanical wear of the pins that's best dealt with before it gets worse and damages the cable too.",
          },
          {
            question: "The phone only charges with the cable held in one exact position?",
            answer:
              "That's almost always a partly damaged or dirty connector rather than a faulty cable — a professional port cleaning solves most of these cases.",
          },
        ],
      },
      {
        brand: "Other brands",
        entries: [
          {
            question: "Can I clean the port myself?",
            answer:
              "A puff of dry air and great care can help, but avoid any metal object that could bend a pin or cause a short circuit. When in doubt, a professional cleaning is safer than a home attempt.",
          },
        ],
      },
    ],
  },

  camera: {
    title: "Blurry or broken camera",
    shortTitle: "Camera",
    cardDescription: "Blurry photos or a dead camera — diagnosis and repair.",
    intro:
      "Before suspecting the hardware, a simple restart or force-closing the app solves a good share of camera problems — the rest comes from a physical module knocked out of alignment or dirty after a drop.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "“Cannot activate camera” — what should I check before a repair?",
            answer:
              "This message can come from a third-party app blocking camera access or, after a drop, from a camera module that has come loose from its connector. A restart rules out the first cause before moving to a hardware diagnosis.",
          },
          {
            question: "The lens is clean but photos are still blurry — why?",
            answer:
              "It can point to an autofocus or optical stabilisation (OIS) problem after a knock, which needs the camera module replaced rather than just cleaned.",
          },
        ],
      },
      {
        brand: "Samsung",
        entries: [
          {
            question: "The same spot appears on all my photos, even after cleaning the lens?",
            answer:
              "That's dust that has got inside the module, between the lenses — invisible and impossible to clean from outside. A technician has to open the module.",
          },
          {
            question: "The camera closes on its own (crashes) when I open it?",
            answer:
              "Start by clearing the camera app's cache and checking for system updates — most crashes of this kind are software, not hardware.",
          },
        ],
      },
      {
        brand: "Xiaomi, Huawei",
        entries: [
          {
            question: "Night or portrait mode disappeared or stopped working after an update?",
            answer:
              "That's usually down to the software update (MIUI/EMUI) rather than the sensor itself. Check the release notes or reset the camera app's settings before considering a hardware diagnosis.",
          },
        ],
      },
      {
        brand: "Other brands",
        entries: [
          {
            question: "How can I tell whether it's software or hardware?",
            answer:
              "Test the built-in camera app after a restart, and try a third-party camera app if you can. If the problem shows up everywhere and survives a restart, that's a good sign a hardware diagnosis is needed.",
          },
        ],
      },
    ],
  },

  son: {
    title: "Faulty speaker or microphone",
    shortTitle: "Sound / Mic",
    cardDescription: "Faulty speaker or mic, brought back to life.",
    intro:
      "A smartphone actually has several separate microphones and speakers (call earpiece, media speaker, noise-cancelling mics) — finding which one is at fault changes the diagnosis a lot. Dust built up in the grilles is the most common cause, and the easiest to fix.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "Sound is muffled only during calls, not with music?",
            answer:
              "That means the call earpiece (the top speaker, separate from the bottom media speaker) is dirty or damaged, rather than a general sound problem.",
          },
          {
            question: "The other person hears me badly while I hear them fine?",
            answer:
              "The problem is probably one of the microphones, not the speaker. Several mics take part in noise cancelling, so a single faulty one can blur the voice you send without affecting what you hear.",
          },
        ],
      },
      {
        brand: "Samsung",
        entries: [
          {
            question: "How can I find which audio part is at fault before a repair?",
            answer:
              "The hidden diagnostic menu (*#0*#) tests the speaker, the earpiece and the microphone(s) separately, which avoids replacing a part that actually works fine.",
          },
        ],
      },
      {
        brand: "Xiaomi, Huawei",
        entries: [
          {
            question: "The sound crackles only at high volume?",
            answer:
              "That's a classic sign of a damaged or dirty speaker membrane — a professional cleaning is sometimes enough, otherwise the part needs replacing.",
          },
        ],
      },
      {
        brand: "Other brands",
        entries: [
          {
            question: "Can water exposure cause this kind of fault, even on a “water-resistant” phone?",
            answer:
              "Yes — water-resistance certification (IP) wears down with time and knocks, and speaker grilles are a classic entry point for leftover moisture that affects the sound afterwards.",
          },
        ],
      },
    ],
  },

  reseau: {
    title: "Network unlocking",
    shortTitle: "Network unlock",
    cardDescription: "Network unlock so you can use your phone anywhere.",
    intro:
      "A network lock (SIM lock) is a software restriction set by a carrier and tied to the device's IMEI — often in exchange for a subsidised price. It's very different from a blacklisted IMEI (a phone reported stolen or unpaid), a status no unlock can lift since it isn't the same problem.",
    brands: [
      {
        brand: "All devices",
        entries: [
          {
            question: "How do I know if my phone is locked to a carrier?",
            answer:
              "Insert a SIM card from another carrier: if the phone asks for a “network unlock code”, it's locked. With no such message and the network showing normally, the device is already unlocked.",
          },
          {
            question: "What's the difference between a network unlock and a blacklisted IMEI?",
            answer:
              "A network unlock removes a software restriction set by the original carrier. A blacklisted IMEI means the device was reported stolen or with an unpaid balance to the carriers — a completely different problem that no unlock can legally solve.",
          },
          {
            question: "After the unlock, my phone shows “not registered on network” with the new SIM?",
            answer:
              "Very often it's just a missing or wrong APN setting for the new carrier, not a failed unlock — something we check every time after an unlock.",
          },
        ],
      },
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "Can an iPhone financed by a carrier be unlocked before it's paid off?",
            answer:
              "Generally not — the financing lock stays active until the carrier's conditions are met, whatever third-party unlock service is used.",
          },
        ],
      },
    ],
  },

  "logiciel-bloque": {
    title: "Phone stuck, slow or in a boot loop",
    shortTitle: "Stuck, slow or boot loop",
    cardDescription: "Phone frozen on the logo, very slow, crashing or restarting non-stop.",
    intro:
      "Most of these faults are software: an interrupted update, full storage, a misbehaving app or a corrupted system. They're often fixed without changing any part — but a boot loop can also come from a worn battery, which we check first.",
    brands: [
      {
        brand: "All devices",
        entries: [
          {
            question: "My phone stays stuck on the logo at startup — is it serious?",
            answer:
              "Most often the system can't load (interrupted update, corrupted files). Reinstalling the system usually fixes it; we always try to keep your data before going that far.",
          },
          {
            question: "Why has my phone become so slow?",
            answer:
              "Nearly full storage, apps running in the background or a tired battery (the system then lowers performance) are the most common causes. A diagnosis shows whether a clean-up is enough or the battery needs changing.",
          },
          {
            question: "Will I lose my data?",
            answer:
              "Not necessarily. We first try a repair without wiping; if a reset can't be avoided, we tell you beforehand and offer a backup when the device allows it.",
          },
        ],
      },
    ],
  },

  "mise-a-jour": {
    title: "System update and reinstall",
    shortTitle: "Update / reinstall",
    cardDescription: "Failed update, factory reset, reinstalling the original software.",
    intro:
      "We install official updates, reset a device before it's resold, or reinstall the manufacturer's original software when the system is damaged. We only use the manufacturers' official versions.",
    brands: [
      {
        brand: "All devices",
        entries: [
          {
            question: "The update fails or gets stuck — what should I do?",
            answer:
              "It's often a lack of storage space or a battery that's too low during the install. If the phone no longer starts after an interrupted update, reinstalling the system is usually needed.",
          },
          {
            question: "Should I reset a phone before selling it?",
            answer:
              "Yes: back up your data, sign out of your accounts (Google, Apple), then reset. Without signing out, the new owner will stay blocked at activation.",
          },
        ],
      },
    ],
  },

  donnees: {
    title: "Data recovery and transfer",
    shortTitle: "Data: recovery & transfer",
    cardDescription: "Photos, contacts, WhatsApp: backup, recovery and transfer to a new phone.",
    intro:
      "We move your photos, contacts and chats to a new phone and help recover data from a device that still works. On a badly damaged phone recovery isn't always possible: we tell you before doing anything.",
    brands: [
      {
        brand: "All devices",
        entries: [
          {
            question: "Can you transfer my data to my new phone?",
            answer:
              "Yes: contacts, photos, apps and, depending on the case, WhatsApp history. Moving from Android to iPhone (or the other way) is possible but some data doesn't follow; we explain what will be transferred.",
          },
          {
            question: "My phone won't turn on anymore — are my photos lost?",
            answer:
              "If the device can be brought back to life (screen, battery, connector), the data is often intact. If it was backed up to the cloud (Google Photos, iCloud), it shows up on another device with the same account.",
          },
        ],
      },
    ],
  },

  "compte-configuration": {
    title: "Account and setup",
    shortTitle: "Account & setup",
    cardDescription: "Creating and recovering Google / Apple accounts, settings, apps.",
    intro:
      "We set up your phone (Google or Apple account, messaging, apps, backups) and help you get back into your own account. For a forgotten account we ask for proof of purchase: we never unlock a device whose ownership isn't proven.",
    brands: [
      {
        brand: "All devices",
        entries: [
          {
            question: "I forgot my Google or Apple account password — what can I do?",
            answer:
              "Recovery goes through Google's or Apple's official procedures (recovery phone or email, questions, security delay). We guide you through them, on showing the invoice or the box with the device's IMEI.",
          },
          {
            question: "Can you remove an account from a phone bought second-hand?",
            answer:
              "Only if the previous owner removes it themselves or you prove you bought the device. A phone locked to someone else's account may be stolen: we don't get around these protections.",
          },
        ],
      },
    ],
  },

  "consultation-en-ligne": {
    title: "Online consultation",
    shortTitle: "Online consultation",
    cardDescription: "Advice or a first diagnosis over WhatsApp (call or video), without coming in.",
    intro:
      "A technician calls you back on WhatsApp at a time that suits you to understand the problem, guide you step by step or advise you before a purchase. Simple advice is free; if work is needed, you're told the price before it starts.",
    brands: [
      {
        brand: "How it works",
        entries: [
          {
            question: "How does an online consultation work?",
            answer:
              "You describe your question and a time that suits you; we call you on WhatsApp (audio or video). If the problem can't be fixed remotely, we offer you a quote for a repair in the shop.",
          },
          {
            question: "Does it cost anything?",
            answer:
              "A first chat and simple advice are free. Longer help (full setup, guided transfer…) may be charged: the price is always given and agreed beforehand.",
          },
        ],
      },
    ],
  },
};

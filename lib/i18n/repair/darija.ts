import type { RepairTopicsText } from "./types";

// Repair topics — Darija (Latin letters + numbers, see dictionaries/darija.ts).
export const darija: RepairTopicsText = {
  ecran: {
    title: "L'écran mhrres wla mcheqqeq",
    shortTitle: "L'écran mhrres",
    cardDescription: "Kanbeddlo l'écran l ga3 les marques, b pièces mzyanin.",
    intro:
      "L'écran dyal smartphone f l7a9i9a joj couches mlsou9in: l vitre (zzaj li kay7mi) w la dalle (LCD/OLED) m3a l tactile. Chi cheqqa li kat9ess « ghir » zzaj t9der tban ghir chkel, walakin rtouba w l ghbra kaydkhlo dghya mn les micro-fissures w kaywslo l la dalle.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "L tactile mazal khddam wakha l'écran mcheqqeq, wach khass nbeddlo?",
            answer:
              "Ah, mzyan tbeddlo. Zzaj l mcheqqeq kaydh3af kol mra katchedd téléphone, t9der tjre7 b chi 9t3a, w rtouba li katdkhel mn cheqqa t9der tkhsser la dalle li ta7tha - w hadak tasli7 ghali bzzaf 3la tbdil dyal vitre.",
          },
          {
            question: "Wach Face ID kaybqa khddam men b3d ma nbeddlo l'écran?",
            answer:
              "Ah. Face ID khddam b module dyal caméra TrueDepth li f l'encoche, machi b l'écran. Ila had l module ma tkhssrch bou7do (tay7a 3la jenb l fou9 matalan), kaybqa khddam 3adi men b3d tbdil l'écran.",
          },
          {
            question: "3lach luminosité automatique wla True Tone kaybanou mbeddlin men b3d tasli7?",
            answer:
              "F chi modèles, capteur dyal luminosité/True Tone mrbout b logiciel m3a l'écran d'origine. Pièce mzyana w m3ayra mzyan katsl7 had l mouchkil - w hadchi 3lach khtiyar l pièce w technicien kaydir lfer9.",
          },
        ],
      },
      {
        brand: "Samsung",
        entries: [
          {
            question: "3ndi taches k7lin wla khtout f l'écran, bla ma ybano 7ta cheqqa: chno ndir?",
            answer:
              "Hadi 3alama belli la dalle nit hiya li tkhssrat, machi ghir zzaj - kaywe9e3 bzzaf men b3d chi darba 7ta bla cheqqa bayna. F ktar les Galaxy, zzaj w la dalle bloc wa7ed, donc khass ytbeddel l module kamel.",
          },
          {
            question: "L tactile ma bqach kayjawb f chi blayes wakha zzaj bayn salem?",
            answer:
              "Chi darba t9der tkhsser l digitizer (couche tactile) bla ma tkherrej zzaj. Hadi panne kayna bzzaf w kat3ref dghya f diagnostic 9bel tasli7.",
          },
          {
            question: "Kayna chi tari9a ntesti biha l'écran 9bel ma nqerrer ndir tasli7?",
            answer:
              "Ah - menu diagnostic mkhbi dyal Samsung (dreb *#0*# f l'app dyal téléphone) kaykhllik ttesti multitouch, pixels mytin w vibration, mzyan bach t3ref ch7al kbir l mouchkil 9bel tasli7.",
          },
        ],
      },
      {
        brand: "Xiaomi",
        entries: [
          {
            question: "Men b3d tasli7 f blasa khra, kaytl3o lia touches « fantômes » bou7dhom?",
            answer:
              "Ghaliban hadi 3alama 3la nappe tactile ma trbtatch mzyan wla colle 9lilat l jawda f tbdil li fat - mouchkil f tarkib, machi f l pièce nit.",
          },
          {
            question: "MIUI katban « pièce non originale détectée » men b3d tbdil l'écran, wach khatar?",
            answer:
              "La, ghir notification dyal logiciel kat3lmek f chi modèles Xiaomi mnin l'écran machi nit l pièce dyal l'usine - ma katmne3ch l'usage l 3adi m3a pièce mzyana b7alha.",
          },
        ],
      },
      {
        brand: "Huawei",
        entries: [
          {
            question: "Téléphone kayrjef w kayrenn mnin kayjini appel, walakin l'écran kaybqa k7el men b3d ma ta7?",
            answer:
              "Bzzaf dyal l merrat kayna l connectique dyal l'écran (nappe t9at3at b darba) wla rétroéclairage, machi carte mère - 3alama mzyana kat9oul belli tasli7 sahel.",
          },
        ],
      },
      {
        brand: "Marques khrin",
        entries: [
          {
            question: "Wach ga3 les marques kaysta3mlo nfs no3 dyal l'écran?",
            answer:
              "La - LCD, AMOLED w les variantes dyalhom 3ndhom prix w 7ssasiya mkhtalfa. Diagnostic kaybyyen wach ghir zzaj lberrani wla l module kamel li khasso ytbeddel, w hadchi kay2tter bzzaf f l prix.",
          },
        ],
      },
    ],
  },

  batterie: {
    title: "Batterie ma bqatch katchedd charge",
    shortTitle: "Batterie",
    cardDescription: "Batterie ma bqatch katchedd charge? Kanbeddlouha lik.",
    intro:
      "Kol batterie lithium-ion kat2ekhed mn capacité dyalha b tabi3a m3a l wa9t - ghaliban katban men b3d chi 500 cycle dyal charge kamla, w 9bel chwiya ila kanet sskhana bzzaf wla charge dima 7tal 100%. Machi 3ib, hadi kimya - walakin kattbeddel b sahoula.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "Mn ch7al d pourcentage Apple katgoul khass tbeddel batterie?",
            answer:
              "Apple kat3tabar belli batterie ta7t 80% dyal capacité maximale (bayna f Réglages > Batterie > État de la batterie) wslat l nihayat 3omrha l 3adi, w tbdilha kayrjje3 l'autonomie w performance d'origine.",
          },
          {
            question: "iPhone dyali kaytfa fjat mnin batterie katbayen 20-30%, 3lach?",
            answer:
              "Batterie 9dima katfe9ed l 9odra bach t3ti courant 9wi f d9i9a (tswira b flash, jeux). iPhone kaydkhol f protection w kaytfa 9bel ma kaybayen l pourcentage.",
          },
          {
            question: "Message « batterie non authentique » kayban men b3d tbdil, wach mouchkil?",
            answer:
              "iPhone kaychouf wach batterie originale b puce khassa. Batterie mzyana walakin ma mrboutach officiellement t9der tkhrrej had l message li ghir kay3lmek, bla ma tmne3 téléphone ykhdem 3adi.",
          },
        ],
      },
      {
        brand: "Samsung",
        entries: [
          {
            question: "Pourcentage dyal batterie kaytay7 fjat (bhal 40% l 15%): wach khatar?",
            answer:
              "Hadi 3alama classique dyal batterie mst3mla bzzaf w capacité dyalha l7a9i9iya ma bqatch katsawi l 7ssab dyal logiciel. Tbdilha kayrjje3 9raya s7i7a w autonomie mzyana.",
          },
          {
            question: "Galaxy dyali kaysakhen bzzaf f charge, wach batterie hiya sbab?",
            answer:
              "Ghaliban 7it katsta3mel téléphone w howa f charge (jeux, GPS, streaming), w hadchi kaytqqel 3la processeur w batterie f nfs l wa9t. Batterie 9dima t9der tzid f sskhana - chouf f diagnostic ila kan had chi jdid.",
          },
        ],
      },
      {
        brand: "Xiaomi",
        entries: [
          {
            question: "MIUI katssedd 3la les apps f arrière-plan, wach 3ndha 3ela9a b batterie?",
            answer:
              "La, hadi fonction dyal logiciel dyal MIUI bach twffer l'énergie, ma 3ndha 7ta 3ela9a b 7alt batterie l7a9i9iya - t9der t2khkher les notifications 7ta m3a batterie jdida.",
          },
          {
            question: "Wach charge rapide katkhsser batterie dghya?",
            answer:
              "Ila sta3meltiha m3a chargeur d'origine wla certifié, charge rapide msnou3a bach tsiyer sskhana. Ktar 7aja katkhsser batterie hiya chargeurs machi certifiés li ma kayfahmouch m3a téléphone f tension.",
          },
        ],
      },
      {
        brand: "Huawei",
        entries: [
          {
            question: "Batterie dyali katkhwa dghya wakha ma kansta3melch téléphone bzzaf?",
            answer:
              "9bel ma tgoul mouchkil matériel, chouf les apps li f arrière-plan w kay3awdo ybdaw bou7dhom - 7aja katban f modèles bla services Google. Ila bqa kaykhwa men b3d ma chefti logiciel, diagnostic dyal batterie mzyan.",
          },
        ],
      },
      {
        brand: "Marques khrin",
        entries: [
          {
            question: "Kifach n3ref belli batterie hiya l mouchkil machi chi 7aja khra?",
            answer:
              "Téléphone kaytfa fjat, dhar dyalo ntfekh w bayn, autonomie kattay7 f chi simanat, wla sskhana ktar mn l3ada - hado huma l 3alamat li kayt9o bihom. Diagnostic dghya kayakkd 9bel ay tbdil.",
          },
        ],
      },
    ],
  },

  connecteur: {
    title: "Port de charge ma kaychargich wla kaychargi 3iyan",
    shortTitle: "Port de charge",
    cardDescription: "Téléphone ma kaychargich wla kaychargi b s3ouba - tasli7 dghya.",
    intro:
      "Ktar sbab kaykhlli port de charge ykhdem mrra w mrra la machi panne électronique, walakin blocage mécanique: l ghbra, zghb dyal jib wla oxydation mn rtouba kaymn3o l contact mzyan bin les broches w l câble.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "« Alerte liquide détectée » katmne3 charge, chno ndir?",
            answer:
              "Hadi protection dyal logiciel katmne3 charge b l3ani bach ma ykounch court-circuit. Khlli l port ynchef mzyan f l hwa (bla ta chi sskhana) 9bel ma t3awed - ila forciti charge f wa9t l'alerte t9der tzid f l'dégât.",
          },
          {
            question: "Téléphone kaychargi walakin b chwiya bzzaf 3la 9bel: wach l port?",
            answer:
              "Ghaliban la - câble wla chargeur machi certifié wla mst3mel bzzaf howa awel sbab dyal charge b chwiya. Jreb b câble w adaptateur certifiés khrin bach t3ref l mouchkil l7a9i9i 9bel ma tchekk f l port.",
          },
        ],
      },
      {
        brand: "Samsung, Xiaomi, Huawei (USB-C)",
        entries: [
          {
            question: "L câble ma chaddch mzyan wla kaytt7errek f l port, wach normal?",
            answer:
              "La - connecteur USB-C salem kaychedd l câble mzyan. Ila kan kaytt7errek ktar mn l3ada, rah les broches tkelsso, w mzyan tsl7ha 9bel ma tzid w tkhsser 7ta l câble.",
          },
          {
            question: "Téléphone ma kaychargi ghir f wa7ed l position dyal l câble?",
            answer:
              "Hadi t9riban dima 3alama 3la connecteur mkhsser chwiya wla m3ammer b l wsakh, machi l câble - nettoyage professionnel dyal l port kaysl7 ktar had l 7alat.",
          },
        ],
      },
      {
        brand: "Marques khrin",
        entries: [
          {
            question: "Wach n9der nneqqi l port b yeddi?",
            answer:
              "Chwiya d l hwa nachef m3a l7dar t9der t3awn, walakin b3d mn ay 7aja dyal l7did t9der t3wwej broche wla tdir court-circuit. Ila kan 3ndek chekk, nettoyage professionnel a7ssen mn tjriba f dar.",
          },
        ],
      },
    ],
  },

  camera: {
    title: "Caméra katsawer mdbbba wla ma khddamach",
    shortTitle: "Caméra",
    cardDescription: "Tsawer mdbbbin wla caméra ma khddamach, diagnostic w tasli7.",
    intro:
      "9bel ma tchekk f l matériel, redémarrage sahel wla tseddi l'app b l'force kaysl7 bzzaf dyal machakil l caméra - w lba9i kayji mn module tzeg mn blasto wla twssekh men b3d chi darba.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "« Impossible d'activer l'appareil photo », chno nchouf 9bel tasli7?",
            answer:
              "Had l message yemken yji mn chi app khra katmne3 l caméra, wla men b3d tay7a mn module caméra tfekk mn l connectique dyalo. Redémarrage kay7iyed l sbab lowl 9bel ma ndowzo l diagnostic matériel.",
          },
          {
            question: "L'objectif n9i walakin tsawer mazal mdbbbin, 3lach?",
            answer:
              "Yemken ykoun mouchkil f mise au point automatique wla stabilisation optique (OIS) men b3d chi darba, w hadchi khasso ytbeddel module caméra machi ghir ytneqqa.",
          },
        ],
      },
      {
        brand: "Samsung",
        entries: [
          {
            question: "Nfs tache katban f ga3 tsawer dyali, 7ta men b3d ma n9it l'objectif?",
            answer:
              "Hadi 3alama 3la ghbra dkhlat l dakhel l module, bin les lentilles - ma katbanch w ma kat9derch tneqqiha mn berra. Khass technicien y7el l module.",
          },
          {
            question: "Caméra katsedd bou7dha (crash) mnin kan7elha?",
            answer:
              "Bda b tmsse7 l cache dyal l'app caméra w chouf wach kayna mise à jour dyal système - ktar had l crashs logiciel, machi matériel.",
          },
        ],
      },
      {
        brand: "Xiaomi, Huawei",
        entries: [
          {
            question: "Mode nuit wla portrait ghabou wla ma bqawch khddamin men b3d mise à jour?",
            answer:
              "Ghaliban 3ndha 3ela9a b mise à jour dyal logiciel (MIUI/EMUI) machi b capteur. Chouf notes de version wla réinitialiser paramètres dyal l'app caméra 9bel ma tfker f diagnostic matériel.",
          },
        ],
      },
      {
        brand: "Marques khrin",
        entries: [
          {
            question: "Kifach n3ref wach logiciel wla matériel?",
            answer:
              "Testi l'app caméra dyal téléphone men b3d redémarrage, w jreb chi app khra dyal tsawer ila t9der. Ila bqa l mouchkil f kolchi w men b3d redémarrage, rah 3alama belli khass diagnostic matériel.",
          },
        ],
      },
    ],
  },

  son: {
    title: "Haut-parleur wla micro fih mouchkil",
    shortTitle: "Sout / Micro",
    cardDescription: "Haut-parleur wla micro fih mouchkil, kanrjj3ouh ykhdem.",
    intro:
      "Smartphone f l7a9i9a fih bzzaf d micros w haut-parleurs mfar9in (écouteur dyal appels, haut-parleur dyal multimédia, micros dyal réduction de bruit) - t3ref chmen wa7ed fih l mouchkil kaybeddel diagnostic bzzaf. L ghbra li kattjme3 f les grilles hiya ktar sbab, w hiya sahla f tasli7.",
    brands: [
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "Sout mkhnou9 ghir f appels, machi f musique?",
            answer:
              "Ya3ni écouteur dyal appels (haut-parleur li l fou9, mfar9 3la haut-parleur multimédia li lta7t) m3ammer wla mkhsser, machi mouchkil f sout kaml.",
          },
          {
            question: "Li kanhder m3ah ma kaysm3nich mzyan, w ana kansm3o mzyan?",
            answer:
              "Ghaliban l mouchkil f wa7ed mn les micros, machi f haut-parleur. 7it bzzaf d micros kaykhdmo f réduction de bruit, wa7ed ghir ila kan fih mouchkil y9der ykhsser wodou7 sout li katsifet bla ma y2tter f li katsm3.",
          },
        ],
      },
      {
        brand: "Samsung",
        entries: [
          {
            question: "Kifach n3ref chmen pièce dyal sout fiha l mouchkil 9bel tasli7?",
            answer:
              "Menu diagnostic mkhbi (*#0*#) kaykhllik ttesti haut-parleur, écouteur w l micro(s) kol wa7ed bou7do, bach ma tbeddelch pièce li f l7a9i9a khddama mzyan.",
          },
        ],
      },
      {
        brand: "Xiaomi, Huawei",
        entries: [
          {
            question: "Sout kayweshwesh ghir mnin kanteli3 l volume?",
            answer:
              "Hadi 3alama classique dyal membrane dyal haut-parleur mkhssra wla m3ammra - mrrat nettoyage professionnel kaykfi, w ila la khass tbdil l pièce.",
          },
        ],
      },
      {
        brand: "Marques khrin",
        entries: [
          {
            question: "Wach l ma y9der ydir had l panne 7ta f téléphone « résistant à l'eau »?",
            answer:
              "Ah - certification dyal résistance à l'eau (IP) katdh3af m3a l wa9t w d-drabi, w grilles dyal haut-parleur blasa classique fin katdkhel rtouba li kat2tter f sout men b3d.",
          },
        ],
      },
    ],
  },

  reseau: {
    title: "Débloquer réseau",
    shortTitle: "Débloquer réseau",
    cardDescription: "Débloquer réseau bach tsta3mel téléphone dyalek m3a ay opérateur.",
    intro:
      "Verrouillage réseau (SIM lock) howa restriction dyal logiciel kaydirha opérateur, mrbouta b l'IMEI dyal l'appareil - ghaliban 7it tba3 lik b prix mnaqqes. Hadchi mkhtalef bzzaf 3la IMEI blacklisté (téléphone mdeclari m3ahu mesrou9 wla ma mkhllesch), w hadik 7ala ta déblocage ma y9der y7iyedha 7it machi nfs l mouchkil.",
    brands: [
      {
        brand: "Ga3 les appareils",
        entries: [
          {
            question: "Kifach n3ref wach téléphone dyali msdoud 3la opérateur?",
            answer:
              "Dkhel carte SIM dyal opérateur akhor: ila téléphone tleb « code de déverrouillage réseau », rah msdoud. Ila ma tla3ch had l message w réseau bayn 3adi, rah l'appareil déjà me7loul.",
          },
          {
            question: "Chno lfer9 bin déblocage réseau w IMEI blacklisté?",
            answer:
              "Déblocage réseau kay7iyed restriction dyal logiciel dayrha opérateur lowl. IMEI blacklisté ya3ni l'appareil tsjjel belli mesrou9 wla fih flous ma tkhllsouch 3nd les opérateurs - mouchkil akhor kamel, ta déblocage ma y9der ysl7o b l9anoun.",
          },
          {
            question: "Men b3d déblocage, téléphone kaybayen « réseau non enregistré » m3a SIM jdida?",
            answer:
              "Bzzaf dyal l merrat ghir réglage APN na9es wla ghalat l opérateur jdid, machi déblocage li ma nje7ch - w hadchi kanchoufouh dima men b3d kol déblocage.",
          },
        ],
      },
      {
        brand: "Apple (iPhone)",
        entries: [
          {
            question: "iPhone chrito b crédit mn 3nd opérateur, wach y9der ytdebloqua 9bel ma nkhlles kolchi?",
            answer:
              "Ghaliban la - verrouillage dyal crédit kaybqa khddam 7tal tkmmel les conditions dyal opérateur, w ma kayhemmch ay service dyal déblocage mn berra.",
          },
        ],
      },
    ],
  },

  "logiciel-bloque": {
    title: "Téléphone bloqué, t9il wla kay3awed ybda bou7do",
    shortTitle: "Bloqué, t9il wla kay3awed",
    cardDescription: "Téléphone wa9ef f logo, t9il bzzaf, kayplanta wla kay3awed ybda bla ma y7bes.",
    intro:
      "Ktar had l pannes logiciel: mise à jour t9at3at, mémoire 3amra, application fiha mouchkil wla système mkhsser. Bzzaf dyal l merrat katsl7 bla ma nbeddlo ta pièce - walakin redémarrage bla ma y7bes y9der yji 7ta mn batterie mst3mla, w hiya li kanchoufo lowla.",
    brands: [
      {
        brand: "Ga3 les appareils",
        entries: [
          {
            question: "Téléphone dyali kaybqa wa9ef f logo f démarrage: wach khatar?",
            answer:
              "Ghaliban système ma 9derch ytcharga (mise à jour t9at3at, fichiers mkhssrin). Réinstallation dyal système kattsl7 ghaliban; w dima kanjerbo n7afdo 3la les données dyalek 9bel ma nwslo l hadchi.",
          },
          {
            question: "3lach téléphone dyali wella t9il bzzaf?",
            answer:
              "Mémoire t9riban 3amra, applications khddamin f arrière-plan wla batterie 3yana (système kayn9ess l performance) - hado huma ktar l asbab. Diagnostic kaybyyen wach nettoyage kaykfi wla khass tbdil batterie.",
          },
          {
            question: "Wach ghadi ntlef les données dyali?",
            answer:
              "Machi darouri. Kanjerbo lowl tasli7 bla ma nmss7o; ila réinitialisation ma kaynch mnha hrouba, kan3lmouk 9bel w kan9tar7o sauvegarde ila l'appareil khlla.",
          },
        ],
      },
    ],
  },

  "mise-a-jour": {
    title: "Mise à jour w réinstallation dyal système",
    shortTitle: "Mise à jour / réinstallation",
    cardDescription: "Mise à jour ma katkmmelch, réinitialisation, réinstallation dyal logiciel d'origine.",
    intro:
      "Kanst7tto les mises à jour officielles, kandiro réinitialisation l l'appareil 9bel ma yt3awed ytba3, wla kan3awdo nst7tto logiciel d'origine dyal fabricant mnin système ykoun mkhsser. Kansta3mlo ghir les versions officielles dyal les fabricants.",
    brands: [
      {
        brand: "Ga3 les appareils",
        entries: [
          {
            question: "Mise à jour ma katkmmelch wla katb9a wa9fa, chno ndir?",
            answer:
              "Ghaliban blasa f stockage ma kafyach wla batterie na9sa bzzaf f wa9t l'installation. Ila téléphone ma bqach kaybda men b3d mise à jour t9at3at, ghaliban khass réinstallation dyal système.",
          },
          {
            question: "Wach khass ndir réinitialisation l téléphone 9bel ma nbi3o?",
            answer:
              "Ah: dir sauvegarde l les données dyalek, khrej mn les comptes dyalek (Google, Apple), w men b3d dir réinitialisation. Ila ma khrejtich mn compte, mol téléphone jdid ghadi ybqa bloqué f l'activation.",
          },
        ],
      },
    ],
  },

  donnees: {
    title: "Rj3an w nqal dyal les données",
    shortTitle: "Données: rj3an w nqal",
    cardDescription: "Tsawer, contacts, WhatsApp: sauvegarde, rj3an w nqal l téléphone jdid.",
    intro:
      "Kanneqlo tsawer, contacts w les messageries dyalek l téléphone jdid w kan3awnouk trjje3 les données mn appareil mazal khddam. F téléphone mkhsser bzzaf, rj3an machi dima mumkin: kan9oulo lik 9bel ma nbdaw.",
    brands: [
      {
        brand: "Ga3 les appareils",
        entries: [
          {
            question: "Wach t9dro tneqlo les données dyali l téléphone jdid?",
            answer:
              "Ah: contacts, tsawer, applications w, 3la 7sab l 7ala, historique dyal WhatsApp. Mn Android l iPhone (wla l3aks) mumkin walakin chi données ma kayteb3ouch; kanchr7o lik chno ghadi ytne9el.",
          },
          {
            question: "Téléphone dyali ma bqach kaycha3el, wach tsawer dyali mchaw?",
            answer:
              "Ila l'appareil t9der yrje3 ykhdem (l'écran, batterie, connecteur), les données ghaliban salmin. W ila kanu msjjlin f cloud (Google Photos, iCloud), katl9ahom f appareil akhor b nfs l compte.",
          },
        ],
      },
    ],
  },

  "compte-configuration": {
    title: "Compte w configuration",
    shortTitle: "Compte w configuration",
    cardDescription: "Création w rj3an dyal compte Google / Apple, réglages, applications.",
    intro:
      "Kanconfiguriw téléphone dyalek (compte Google wla Apple, messagerie, applications, sauvegardes) w kan3awnouk trjje3 l compte dyalek nta. L compte mnsi, kantelbo preuve d'achat: 3emmerna ma kan7ellou appareil ma tbtatch belli dyalek.",
    brands: [
      {
        brand: "Ga3 les appareils",
        entries: [
          {
            question: "Nsit mot de passe dyal compte Google wla Apple, chno ndir?",
            answer:
              "Rj3an kaydouz mn les procédures officielles dyal Google wla Apple (numéro wla email de secours, questions, délai de sécurité). Kanmchiw m3ak f had l khotwat, mnin tjib facture wla la boîte li fiha l'IMEI dyal l'appareil.",
          },
          {
            question: "Wach t9dro t7iydo compte mn téléphone chrito mosta3mel?",
            answer:
              "Ghir ila mol téléphone l 9dim 7iydo b rasso wla ila btti belli chriti l'appareil. Téléphone msdoud 3la compte dyal chi wa7ed akhor y9der ykoun mesrou9: ma kandourouch 3la had l protections.",
          },
        ],
      },
    ],
  },

  "consultation-en-ligne": {
    title: "Consultation 3la b3d",
    shortTitle: "Consultation 3la b3d",
    cardDescription: "Nasi7a wla diagnostic lowl f WhatsApp (appel wla vidéo), bla ma tjii.",
    intro:
      "Technicien kay3ayet lik f WhatsApp f lw9t li kaynasbek bach yfhem l mouchkil, ywerrik khotwa b khotwa wla ynse7ek 9bel ma tchri. Nasa2i7 sahla fabor; ila khass chi khedma, kan9oulo lik l prix 9bel ma nbdaw.",
    brands: [
      {
        brand: "Kifach kankhdmo",
        entries: [
          {
            question: "Kifach katdouz consultation 3la b3d?",
            answer:
              "Katgoul lina so2al dyalek w lw9t li kaynasbek; kan3ayto lik f WhatsApp (audio wla vidéo). Ila l mouchkil ma y9derch ytsl7 3la b3d, kan9tar7o 3lik devis dyal tasli7 f l7anout.",
          },
          {
            question: "Wach b flous?",
            answer:
              "Awel hdra w nasa2i7 sahla fabor. Mou3awana ktar (configuration kamla, nqal m3a tawjih…) t9der tkoun b flous: l prix dima kan9oulouh lik w katwafe9 3lih 9bel.",
          },
        ],
      },
    ],
  },
};

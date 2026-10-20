import type { GuidesText } from "./types";

// Buying guides, Darija (Latin script, like the rest of the Darija site).
// Settings paths in French: most phones here are set to French.
export const darija: GuidesText = {
  indexTitle: "Guides dyal chra",
  indexMetaTitle: "Guides: kifach tchri iPhone mosta3mal f lmghrib",
  indexMetaDescription: "Kifach tchouf iPhone mosta3mal, chno kat3ni les pièces mbdlin, w kifach t9ra s-sa7a dyal l batterie: guides bach tchri bla mfaja2at.",
  indexIntro: "Les questions li kaysewlouna 9bel ma ychriw téléphone mosta3mal, b ajwiba wadh7in w chno kandirou f l7anout.",
  eyebrow: "Guide dyal chra",
  read: "9ra l guide",
  updated: "Mjdded f octobre 2026",
  others: "Guides khrin",
  priceExample: (model, replaced, original) => `Mathalan, ${model} kaybda men ${replaced} f « Pièces mbdlin », w ${original} f « 7ala mzyana bzaf ».`,
  guides: {
    "verifier-iphone-occasion": {
      title: "Kifach tchouf iPhone mosta3mal 9bel ma tchrih",
      metaTitle: "Chouf iPhone mosta3mal 9bel ma tchrih: 10 dyal les points",
      metaDescription: "iCloud, IMEI, batterie, pièces mbdlin, écran, Face ID: 10 dyal l7wayj li khassek tchoufhom 9bel ma tchri iPhone mosta3mal.",
      intro:
        "iPhone mosta3mal ymken ykoun affaire mzyana, ila 3refti chno katchri. Hadi l7wayj li khassek tchoufhom b tartib, wakha tchrih mennna, men Avito wla men chi sa7bek. 7sb chi rob3 sa3a.",
      sections: [
        {
          title: "1. Compte iCloud: l7aja li ma kayn3ndha 7el",
          paragraphs: [
            "iPhone ba9i mrboto b compte dyal mol dyalo l9dim ma ytsta3melch: hada howa verrouillage d'activation. 9bel ma tkhless, khass t-téléphone ykoun tmsa7, t7ayed men compte dyal mol dyalo, w ybayn l'écran « Bonjour ». Ila bayn « iPhone verrouillé par le propriétaire » wla tlb identifiant Apple machi dyalek, ma tchrihch.",
          ],
        },
        {
          title: "2. L'IMEI",
          paragraphs: ["Dir [[*#06#]] wla 7ell [[Réglages › Général › Informations]]. Khass n-nmra tkoun hiya hiya li f l'boîte w l facture. Ila ma kantch b7al b7al, khass chi tfsir. W chouf 7ta ila ma blokiyach (téléphone tsre9 wla tdre3)."],
        },
        {
          title: "3. L batterie",
          paragraphs: ["[[Réglages › Batterie › État de la batterie]] kaybayn la capacité maximale. Men 80 % w fo9, l batterie mzyana. T7t menha, katsmed 9al f n-nhar w t-taman khasso ykoun 9al. L guide dyalna 3la l batterie kaychre7 kolchi."],
        },
        {
          title: "4. Les pièces mbdlin",
          paragraphs: [
            "Men iOS 15.2, [[Réglages › Général › Informations]] ymken ybayn « Historique des pièces et des réparations » ila t-téléphone tsla7. Kayguel « Pièce d'origine » wla « Pièce inconnue » l l'écran, l batterie wla l caméra. Machi daroriyan 3ayb, walakin khassek t3rfo 9bel ma tchri: l guide dyalna 3la les pièces kaychre7 chno kaytbdel.",
          ],
        },
        {
          title: "5. L'écran",
          list: [
            "Tactile f kolla blasa: 7errek icône men zawya l zawya.",
            "Pixels morts w tbe3: 7ell tswira bayda kamla, w men b3d k7la kamla.",
            "Marquage (écrans OLED): f fond gris, ma khass ybayn 7ta dell dyal l clavier wla l barre l fo9aniya.",
            "Luminosité w l alwan: tl3 l luminosité l max, l alwan khasshom yb9aw tabi3iyin.",
          ],
        },
        {
          title: "6. Face ID wla Touch ID",
          paragraphs: ["Sjjel wjhek wla l bsma dyalek w 7ell b7al chi mrrat. Face ID ila t7ayed nadir ma ytsla7 berra Apple: hadi khassek tchoufha bla mat9iss."],
        },
        {
          title: "7. Les caméras",
          paragraphs: ["Jerreb kol objectif (grand-angle, ultra grand-angle, zoom), l caméra l9damiya, w sowwer chi thwani w nta ghadi: t-tswira khassha tb9a tabta w wadha, bla tr3ach wla tktktik."],
        },
        {
          title: "8. S-sout, micro w les appels",
          paragraphs: ["Ch3el vidéo f haut-parleur, sjjel mémo vocal, w dir appel test: khassek tsme3 mzyan w ysm3ok mzyan."],
        },
        {
          title: "9. Réseau",
          paragraphs: ["F [[Réglages › Général › Informations]], « Aucune restriction de SIM » kat3ni iPhone débloqué. Dkhel la puce dyalek, w chouf réseau, Wi-Fi w Bluetooth."],
        },
        {
          title: "10. Les boutons, charge w fluidité",
          paragraphs: ["Boutons dyal volume w marche, vibreur, charge b l câble: kolchi khasso yjaweb, w l iPhone khasso yb9a khfif mli t7ell bzaf dyal les applications."],
        },
      ],
      shopTitle: "3nd Electro Zaki",
      shop:
        "Kol téléphone mosta3mal kaydouz men Contrôle Electro Zaki dyal 25 point 9bel l bi3, w n-natija bayna f l page dyalo: s-sa7a dyal l batterie, les pièces mbdlin, l7ala. Les comptes iCloud w Google m7ydin, l'IMEI mchouf, t-téléphone mise à jour w fih garantie 3 chhour. Mli twslek, t9der tchoufo m3ana f appel vidéo wla f l7anout f Mknas, w trfed l colis ila chi 7aja ma tab9atch l page dyalo.",
    },
    "pieces-origine-ou-remplacees": {
      title: "Pièces d'origine wla pièces mbdlin: chno kaytbdel",
      metaTitle: "iPhone b pièces d'origine wla mbdlin: chno kaytbdel",
      metaDescription: "« Pièce d'origine », « Pièce inconnue », « Réutilisé »: chno kaybayn l iPhone mn b3d tasli7, w chno katbdel pièce mbdla b s7i7.",
      intro:
        "F site dyalna, kol téléphone mosta3mal msnnef « 7ala mzyana bzaf », « 7ala mzyana » wla « Pièces mbdlin ». Jouj louwlin fihom ghir pièces d'origine. T-talt tbdlat fih 3la l a9al pièce wa7da, w l page dyalo katguel chmen wa7da: écran, batterie, caméra… Hada chno kay3ni f l wa9i3.",
      sections: [
        {
          title: "Kifach kaybaynha l iPhone",
          paragraphs: ["Men iOS 15.2, mli kattbdel chi pièce, [[Réglages › Général › Informations]] kaybayn « Historique des pièces et des réparations ». 3la 7sab Apple:"],
          list: [
            "**« Pièce d'origine »**: pièce dyal Apple, mrekba kif katgoul Apple.",
            "**« Pièce inconnue »**: l pièce machi d'origine, wla Apple ma kemlatch tarkib dyalha, wla jat men iPhone akhor.",
            "**« Réutilisé(e) »** (iPhone 15 w fo9, iOS 18): pièce d'origine kanet khddama f iPhone akhor.",
          ],
        },
        {
          title: "Chno katgoul Apple",
          paragraphs: ["Had les messages ma kaymn3och t-ste3mal l iPhone, l batterie dyalo, l'écran wla l caméra. W ma ymkench t7ydhom men Réglages: kayb9aw b7al historique."],
        },
        {
          title: "Chno kaytbdel, pièce b pièce",
          list: [
            "**L'écran**: 3la 7sab t-téléphone, l'écran li tbdel ima d'origine ima compatible. L'écran compatible ymken ykhtalf chwiya f l alwan, l luminosité wla l fluidité. Swelna: ngoulolek chmen wa7ed 9bel ma tcommandi.",
            "**L batterie**: batterie jdida katrj3 l autonomie l téléphone, w mn b3d ma nbdlouha 7na, s-sa7a dyal l batterie katb9a bayna f Réglages.",
            "**L caméra**: l jawda 3la 7sab l pièce. Kanjerrbou kol objectif 9bel l bi3.",
            "**Face ID**: ma kaytbdelch berra Apple. F tilifounat dyalna, mjerreb w mktoub f l page.",
          ],
        },
        {
          title: "3lach tkhtar téléphone « Pièces mbdlin »",
          paragraphs: ["Nfs l modèle, mjerreb b nfs t-tari9a w fih garantie 3 chhour b7al lakhrin, walakin rkhis. {prices} L l isti3mal dyal kol nhar, ghaliban howa a7sen taman. Ila bghiti tbi3o men b3d wla t3tih cadeau, khtar pièces d'origine."],
        },
      ],
      shopTitle: "3nd Electro Zaki",
      shop: "Walo mkhbbi: kol pièce mbdla mktouba f l page dyal t-téléphone 9bel ma tcommandi. Ila bghiti, nsiftolek f WhatsApp capture dyal « Historique des pièces et des réparations » dyalo.",
    },
    "sante-batterie-iphone": {
      title: "S-sa7a dyal batterie iPhone: 80 %, wach mzyana?",
      metaTitle: "S-sa7a dyal batterie iPhone: 80 %, wach mzyana?",
      metaDescription: "Fin tchouf s-sa7a dyal batterie iPhone, chno kat3ni 90 %, 85 % wla 80 % f kol nhar, w imta khassek tbdelha. B l9a3ida dyal Apple.",
      intro: "F iPhone mosta3mal, s-sa7a dyal l batterie hiya awel ra9m kanchoufoh. Hada kifach t9raha, w chno katbdel f kol nhar.",
      sections: [
        {
          title: "Fin tchoufha",
          paragraphs: ["[[Réglages › Batterie › État de la batterie]] (wla « État de la batterie et charge »). « Capacité maximale » katqaren l batterie m3a kifach kanet jdida: 90 % kat3ni katkhzen 90 % men charge l asliya."],
        },
        {
          title: "Chmen ra9m mzyan?",
          list: [
            "**Men 90 l 100 %**: b7al jdida, autonomie asliya wla 9rib.",
            "**Men 80 l 89 %**: mzyana. Hada l isti3mal l 3adi dyal iPhone tste3mel 3am wla 3amayn; katsmed nhar 3adi.",
            "**T7t 80 %**: Apple katchoufha batterie mst3mla bzaf. L autonomie katn9es b zzaf w l iPhone ymken ygoulek tbdelha.",
          ],
          after: ["Apple katgoul batterie dyal iPhone msawba bach t7afed 3la 80 % mn capacité dyalha mn b3d 500 cycle dyal charge kamla (1000 cycle l iPhone 15 w fo9). 3la hadchi, 3ndna, batterie men 80 % w fo9 msnnfa « mzyana », w téléphone t7t 80 % kaytba3 b taman 9al."],
        },
        {
          title: "W Samsung?",
          paragraphs: ["Galaxy ma kaybaynch pourcentage f Réglages. Les techniciens dyalna kayjerrbou l batterie b test li f l'application Samsung Members, w kaychoufou l istihlak dyalha, 9bel l bi3. L7ala mktouba f l page."],
        },
        {
          title: "Bach tdoum l batterie dyalek",
          list: [
            "Tb3ed men s-skhana: ma tkhllich t-téléphone f chems wla f tomobil msdouda.",
            "Ch3el « Recharge optimisée » (w f iPhone 15 w fo9, limite dyal charge f 80 %).",
            "Ste3mel chargeur mzyan.",
          ],
        },
      ],
      shopTitle: "3nd Electro Zaki",
      shop: "S-sa7a dyal batterie kol iPhone m9yassa w bayna f l page dyalo 9bel l bi3. W ila l batterie dyalek t3yat, kanbdlou les batteries f l7anout f Mknas, men 150 DH 3la 7sab l modèle.",
    },
  },
};

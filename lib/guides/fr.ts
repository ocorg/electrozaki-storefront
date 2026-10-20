import type { GuidesText } from "./types";

// Buying guides, French (source). Sources: Apple support (used iPhone,
// genuine displays and the parts history), checked with the shop's owner
// (October 2026) for what the shop does.
export const fr: GuidesText = {
  indexTitle: "Guides d'achat",
  indexMetaTitle: "Guides : acheter un iPhone d'occasion au Maroc",
  indexMetaDescription:
    "Vérifier un iPhone d'occasion, comprendre les pièces remplacées, lire la santé de la batterie : nos guides pour acheter sans mauvaise surprise.",
  indexIntro: "Les questions qu'on nous pose avant d'acheter un téléphone d'occasion, avec des réponses claires et ce que nous faisons en boutique.",
  eyebrow: "Guide d'achat",
  read: "Lire le guide",
  updated: "Mis à jour en octobre 2026",
  others: "Autres guides",
  priceExample: (model, replaced, original) =>
    `Par exemple, un ${model} est à partir de ${replaced} en « Pièces remplacées », contre ${original} en « Très bon état ».`,
  guides: {
    "verifier-iphone-occasion": {
      title: "Comment vérifier un iPhone d'occasion avant de l'acheter",
      metaTitle: "Vérifier un iPhone d'occasion avant l'achat : 10 points",
      metaDescription:
        "iCloud, IMEI, batterie, pièces remplacées, écran, Face ID : les 10 vérifications à faire avant d'acheter un iPhone d'occasion, dans l'ordre.",
      intro:
        "Un iPhone d'occasion peut être une très bonne affaire, à condition de savoir ce qu'on achète. Voici les vérifications à faire, dans l'ordre, que vous l'achetiez chez nous, sur Avito ou à un ami. Comptez une quinzaine de minutes.",
      sections: [
        {
          title: "1. Le compte iCloud : le point qui ne pardonne pas",
          paragraphs: [
            "Un iPhone encore lié au compte de l'ancien propriétaire est inutilisable : c'est le verrouillage d'activation. Avant de payer, le téléphone doit être effacé, retiré du compte de l'ancien propriétaire et afficher l'écran de bienvenue « Bonjour ». S'il affiche « iPhone verrouillé par le propriétaire » ou demande un identifiant Apple qui n'est pas le vôtre, n'achetez pas.",
          ],
        },
        {
          title: "2. L'IMEI",
          paragraphs: [
            "Composez [[*#06#]] ou ouvrez [[Réglages › Général › Informations]]. Le numéro doit être le même que sur la boîte et la facture. Un IMEI qui ne correspond pas doit être expliqué. Vérifiez aussi qu'il n'est pas bloqué (téléphone déclaré perdu ou volé).",
          ],
        },
        {
          title: "3. La batterie",
          paragraphs: [
            "[[Réglages › Batterie › État de la batterie]] affiche la capacité maximale. À 80 % et plus, la batterie est en bonne santé. En dessous, elle tient moins la journée et le prix doit en tenir compte. Notre guide sur la batterie explique tout.",
          ],
        },
        {
          title: "4. Les pièces remplacées",
          paragraphs: [
            "Depuis iOS 15.2, [[Réglages › Général › Informations]] peut afficher une section « Historique des pièces et des réparations » si l'iPhone a été réparé. Elle indique « Pièce d'origine » ou « Pièce inconnue » pour l'écran, la batterie ou la caméra. Ce n'est pas forcément un défaut, mais vous devez le savoir avant d'acheter : notre guide sur les pièces remplacées détaille ce que ça change.",
          ],
        },
        {
          title: "5. L'écran",
          list: [
            "Le tactile partout : déplacez une icône d'un coin à l'autre de l'écran.",
            "Pixels morts et taches : affichez une image toute blanche, puis toute noire.",
            "Marquage (écrans OLED) : sur un fond gris uni, aucune ombre du clavier ou de la barre du haut ne doit apparaître.",
            "Luminosité et couleurs : poussez la luminosité au maximum, les couleurs doivent rester naturelles.",
          ],
        },
        {
          title: "6. Face ID ou Touch ID",
          paragraphs: [
            "Enregistrez votre visage ou votre empreinte et déverrouillez plusieurs fois. Un Face ID qui ne fonctionne plus est rarement réparable en dehors d'Apple : c'est un point à vérifier absolument.",
          ],
        },
        {
          title: "7. Les caméras",
          paragraphs: [
            "Testez chaque objectif (grand-angle, ultra grand-angle, zoom), la caméra avant, et filmez quelques secondes en marchant : l'image doit rester stable et nette, sans vibration ni cliquetis.",
          ],
        },
        {
          title: "8. Son, micros et appels",
          paragraphs: ["Écoutez une vidéo sur le haut-parleur, enregistrez un mémo vocal, et passez un appel test : vous devez bien entendre et être bien entendu."],
        },
        {
          title: "9. Le réseau",
          paragraphs: [
            "Dans [[Réglages › Général › Informations]], « Aucune restriction de SIM » indique un iPhone débloqué. Insérez votre carte SIM, puis vérifiez le réseau, le Wi-Fi et le Bluetooth.",
          ],
        },
        {
          title: "10. Boutons, charge et fluidité",
          paragraphs: ["Boutons de volume et de marche, vibreur, charge par le câble : tout doit répondre, et l'iPhone doit rester fluide en ouvrant plusieurs applications."],
        },
      ],
      shopTitle: "Chez Electro Zaki",
      shop:
        "Chaque téléphone d'occasion passe notre Contrôle Electro Zaki de 25 points avant la vente, et le résultat est affiché sur sa fiche : santé de la batterie, pièces remplacées, état. Les comptes iCloud et Google sont retirés, l'IMEI est vérifié, le téléphone est mis à jour et garanti 3 mois. À la réception, vous pouvez le vérifier avec nous en appel vidéo, ou en boutique à Meknès, et refuser le colis si un point ne correspond pas à sa fiche.",
    },
    "pieces-origine-ou-remplacees": {
      title: "Pièces d'origine ou pièces remplacées : ce que ça change",
      metaTitle: "iPhone pièces d'origine ou remplacées : ce que ça change",
      metaDescription:
        "« Pièce d'origine », « Pièce inconnue », « Réutilisé » : ce que l'iPhone affiche après une réparation, et ce qu'une pièce remplacée change vraiment.",
      intro:
        "Sur notre site, chaque téléphone d'occasion est classé « Très bon état », « Bon état » ou « Pièces remplacées ». Les deux premiers n'ont que des pièces d'origine. Le troisième a eu au moins une pièce changée, et sa fiche dit lesquelles : écran, batterie, caméra… Voici ce que ça signifie concrètement.",
      sections: [
        {
          title: "Comment l'iPhone le montre",
          paragraphs: [
            "Depuis iOS 15.2, quand une pièce a été remplacée, [[Réglages › Général › Informations]] affiche une section « Historique des pièces et des réparations ». Selon Apple :",
          ],
          list: [
            "**« Pièce d'origine »** : une pièce Apple, installée selon la procédure d'Apple.",
            "**« Pièce inconnue »** : la pièce n'est pas d'origine, ou son installation n'a pas été finalisée par Apple, ou elle vient d'un autre iPhone.",
            "**« Réutilisé(e) »** (iPhone 15 et plus récents, iOS 18) : une pièce d'origine qui a déjà servi dans un autre iPhone.",
          ],
        },
        {
          title: "Ce que dit Apple",
          paragraphs: [
            "Ces messages n'empêchent pas d'utiliser l'iPhone, sa batterie, son écran ou son appareil photo. Ils ne peuvent pas être effacés des réglages : ils restent comme un historique.",
          ],
        },
        {
          title: "Ce que ça change, pièce par pièce",
          list: [
            "**Écran** : selon le téléphone, l'écran de remplacement est un écran d'origine ou un écran compatible. Un écran compatible peut différer légèrement en couleurs, luminosité maximale ou fluidité. Demandez-nous : on vous dit lequel avant la commande.",
            "**Batterie** : une batterie neuve rend l'autonomie d'un téléphone récent, et après un remplacement chez nous, la santé de la batterie reste affichée dans les réglages.",
            "**Caméra** : la qualité dépend de la pièce. Nous testons chaque objectif avant la vente.",
            "**Face ID** : il ne se remplace pas en dehors d'Apple. Sur nos téléphones, il est testé et indiqué sur la fiche.",
          ],
        },
        {
          title: "Pourquoi choisir un téléphone « Pièces remplacées »",
          paragraphs: [
            "C'est le même modèle, testé de la même façon et garanti 3 mois comme les autres, mais moins cher. {prices} Pour un usage quotidien, c'est souvent le meilleur rapport qualité-prix. Pour revendre plus tard ou pour offrir, préférez des pièces d'origine.",
          ],
        },
      ],
      shopTitle: "Chez Electro Zaki",
      shop:
        "Rien n'est caché : chaque pièce remplacée est écrite sur la fiche du téléphone, avant que vous commandiez. Sur demande, nous vous envoyons sur WhatsApp la capture de son « Historique des pièces et des réparations ».",
    },
    "sante-batterie-iphone": {
      title: "Santé de la batterie d'un iPhone : 80 %, c'est bien ?",
      metaTitle: "Santé de la batterie iPhone : 80 %, c'est bien ?",
      metaDescription:
        "Où voir la santé de la batterie d'un iPhone, ce que 90 %, 85 % ou 80 % veulent dire au quotidien, et quand la changer. Avec la règle d'Apple.",
      intro: "Sur un iPhone d'occasion, la santé de la batterie est le premier chiffre que l'on regarde. Voici comment la lire, et ce qu'elle change au quotidien.",
      sections: [
        {
          title: "Où la voir",
          paragraphs: [
            "[[Réglages › Batterie › État de la batterie]] (ou « État de la batterie et charge »). La « Capacité maximale » compare la batterie à ce qu'elle était neuve : 90 % veut dire qu'elle stocke 90 % de sa charge d'origine.",
          ],
        },
        {
          title: "Quel chiffre est bon ?",
          list: [
            "**90 à 100 %** : comme neuve, autonomie d'origine ou presque.",
            "**80 à 89 %** : en bonne santé. C'est l'usure normale d'un iPhone utilisé un ou deux ans ; il tient une journée normale.",
            "**Moins de 80 %** : Apple considère la batterie usée. L'autonomie baisse nettement et l'iPhone peut recommander son remplacement.",
          ],
          after: [
            "Apple indique qu'une batterie d'iPhone est conçue pour garder 80 % de sa capacité après 500 cycles de charge complets (1 000 cycles pour les iPhone 15 et plus récents). C'est pourquoi, chez nous, une batterie à 80 % ou plus est classée « bonne », et un téléphone sous 80 % est vendu moins cher.",
          ],
        },
        {
          title: "Et sur Samsung ?",
          paragraphs: [
            "Les Galaxy n'affichent pas de pourcentage dans les réglages. Nos techniciens testent la batterie avec le diagnostic intégré de l'application Samsung Members, et observent sa consommation, avant la vente. L'état est indiqué sur la fiche.",
          ],
        },
        {
          title: "Faire durer sa batterie",
          list: [
            "Évitez la chaleur : ne laissez pas le téléphone au soleil ou dans une voiture fermée.",
            "Activez la « Recharge optimisée » (et, sur iPhone 15 et plus récents, la limite de charge à 80 %).",
            "Utilisez un chargeur de qualité.",
          ],
        },
      ],
      shopTitle: "Chez Electro Zaki",
      shop:
        "La santé de la batterie de chaque iPhone est mesurée et affichée sur sa fiche avant la vente. Et si la vôtre est fatiguée, nous changeons les batteries en boutique à Meknès, à partir de 150 DH selon le modèle.",
    },
  },
};

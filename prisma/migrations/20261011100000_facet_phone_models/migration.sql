-- "Which phone is it for" is part of the pochette checklist too: a pochette
-- line is sold for phones the shop doesn't necessarily stock, so the models
-- can't come from ProductCompatibility (which links to phones on sale).
-- Staff add Samsung, Xiaomi… models in the ERP as they need them.
INSERT INTO "FacetGroup" ("id", "key", "name", "question", "multi", "display", "sortOrder", "updatedAt") VALUES
  ('fg_modele', 'modele', 'Modèle', 'Votre téléphone ?', true, 'CHIPS', 0, CURRENT_TIMESTAMP);

INSERT INTO "FacetOption" ("id", "groupId", "key", "name", "sortOrder", "updatedAt")
SELECT 'fo_mo_' || replace(lower(m.name), ' ', '_'), 'fg_modele', replace(lower(m.name), ' ', '-'), m.name, m.n, CURRENT_TIMESTAMP
FROM (VALUES
  ('iPhone 17 Pro Max', 1), ('iPhone 17 Pro', 2), ('iPhone 17', 3),
  ('iPhone 16 Pro Max', 4), ('iPhone 16 Pro', 5), ('iPhone 16 Plus', 6), ('iPhone 16', 7),
  ('iPhone 15 Pro Max', 8), ('iPhone 15 Pro', 9), ('iPhone 15 Plus', 10), ('iPhone 15', 11),
  ('iPhone 14 Pro Max', 12), ('iPhone 14 Pro', 13), ('iPhone 14 Plus', 14), ('iPhone 14', 15),
  ('iPhone 13 Pro Max', 16), ('iPhone 13 Pro', 17), ('iPhone 13', 18),
  ('iPhone 12 Pro Max', 19), ('iPhone 12 Pro', 20), ('iPhone 12', 21),
  ('iPhone 11 Pro Max', 22), ('iPhone 11 Pro', 23), ('iPhone 11', 24)
) AS m(name, n);

INSERT INTO "FacetGroupCategory" ("groupId", "categoryId")
SELECT 'fg_modele', c."id" FROM "Category" c WHERE c."slug" = 'pochettes';

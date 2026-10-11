-- Attribute checklist: groups ("Style"), their options ("Fleuri") and the
-- ticks staff put on each product in the ERP. The pochette aisle builds its
-- guided choice from these rows.
CREATE TYPE "FacetDisplay" AS ENUM ('CHIPS', 'TILES', 'METER');

CREATE TABLE "FacetGroup" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "question" TEXT,
    "multi" BOOLEAN NOT NULL DEFAULT true,
    "display" "FacetDisplay" NOT NULL DEFAULT 'CHIPS',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacetGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FacetOption" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacetOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FacetGroupCategory" (
    "groupId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "FacetGroupCategory_pkey" PRIMARY KEY ("groupId","categoryId")
);

CREATE TABLE "ProductFacet" (
    "productId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "ProductFacet_pkey" PRIMARY KEY ("productId","optionId")
);

CREATE UNIQUE INDEX "FacetGroup_key_key" ON "FacetGroup"("key");
CREATE UNIQUE INDEX "FacetOption_groupId_key_key" ON "FacetOption"("groupId", "key");
CREATE INDEX "FacetGroupCategory_categoryId_idx" ON "FacetGroupCategory"("categoryId");
CREATE INDEX "ProductFacet_optionId_idx" ON "ProductFacet"("optionId");

ALTER TABLE "FacetOption" ADD CONSTRAINT "FacetOption_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FacetGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FacetGroupCategory" ADD CONSTRAINT "FacetGroupCategory_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FacetGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FacetGroupCategory" ADD CONSTRAINT "FacetGroupCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductFacet" ADD CONSTRAINT "ProductFacet_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductFacet" ADD CONSTRAINT "ProductFacet_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "FacetOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The starting checklist for pochettes. Staff adjust it in the ERP afterwards.
INSERT INTO "FacetGroup" ("id", "key", "name", "question", "multi", "display", "sortOrder", "updatedAt") VALUES
  ('fg_pour_qui',   'pour',       'Pour qui',   'C''est pour qui ?',         true,  'CHIPS', 1, CURRENT_TIMESTAMP),
  ('fg_style',      'style',      'Style',      'Votre style ?',               true,  'TILES', 2, CURRENT_TIMESTAMP),
  ('fg_protection', 'protection', 'Protection', 'Quelle protection ?', false, 'METER', 3, CURRENT_TIMESTAMP),
  ('fg_matiere',    'matiere',    'Matière',    NULL,                        false, 'CHIPS', 4, CURRENT_TIMESTAMP),
  ('fg_extras',     'extras',     'Extras',     NULL,                        true,  'CHIPS', 5, CURRENT_TIMESTAMP);

INSERT INTO "FacetOption" ("id", "groupId", "key", "name", "level", "sortOrder", "updatedAt") VALUES
  ('fo_pour_elle',     'fg_pour_qui',   'elle',         'Elle',            NULL, 1, CURRENT_TIMESTAMP),
  ('fo_pour_lui',      'fg_pour_qui',   'lui',          'Lui',             NULL, 2, CURRENT_TIMESTAMP),
  ('fo_pour_tous',     'fg_pour_qui',   'tous',         'Tous',            NULL, 3, CURRENT_TIMESTAMP),
  ('fo_pour_enfant',   'fg_pour_qui',   'enfant',       'Enfant',          NULL, 4, CURRENT_TIMESTAMP),
  ('fo_st_transp',     'fg_style',      'transparent',  'Transparent',     NULL, 1, CURRENT_TIMESTAMP),
  ('fo_st_uni',        'fg_style',      'uni',          'Uni',             NULL, 2, CURRENT_TIMESTAMP),
  ('fo_st_fleuri',     'fg_style',      'fleuri',       'Fleuri',          NULL, 3, CURRENT_TIMESTAMP),
  ('fo_st_minimal',    'fg_style',      'minimal',      'Minimal',         NULL, 4, CURRENT_TIMESTAMP),
  ('fo_st_luxe',       'fg_style',      'luxe',         'Luxe',            NULL, 5, CURRENT_TIMESTAMP),
  ('fo_st_foot',       'fg_style',      'foot',         'Foot',            NULL, 6, CURRENT_TIMESTAMP),
  ('fo_st_anime',      'fg_style',      'anime',        'Anime / cartoon', NULL, 7, CURRENT_TIMESTAMP),
  ('fo_st_calli',      'fg_style',      'calligraphie', 'Calligraphie',    NULL, 8, CURRENT_TIMESTAMP),
  ('fo_pr_fine',       'fg_protection', 'fine',         'Fine',            1,    1, CURRENT_TIMESTAMP),
  ('fo_pr_quotidien',  'fg_protection', 'quotidien',    'Quotidien',       2,    2, CURRENT_TIMESTAMP),
  ('fo_pr_antichoc',   'fg_protection', 'antichoc',     'Antichoc',        3,    3, CURRENT_TIMESTAMP),
  ('fo_ma_silicone',   'fg_matiere',    'silicone',     'Silicone',        NULL, 1, CURRENT_TIMESTAMP),
  ('fo_ma_rigide',     'fg_matiere',    'rigide',       'Rigide',          NULL, 2, CURRENT_TIMESTAMP),
  ('fo_ma_cuir',       'fg_matiere',    'cuir',         'Cuir',            NULL, 3, CURRENT_TIMESTAMP),
  ('fo_ma_portef',     'fg_matiere',    'portefeuille', 'Portefeuille',    NULL, 4, CURRENT_TIMESTAMP),
  ('fo_ex_magsafe',    'fg_extras',     'magsafe',      'MagSafe',         NULL, 1, CURRENT_TIMESTAMP),
  ('fo_ex_cartes',     'fg_extras',     'porte-cartes', 'Porte-cartes',    NULL, 2, CURRENT_TIMESTAMP),
  ('fo_ex_bequille',   'fg_extras',     'bequille',     'Béquille',        NULL, 3, CURRENT_TIMESTAMP),
  ('fo_ex_cordon',     'fg_extras',     'cordon',       'Cordon',          NULL, 4, CURRENT_TIMESTAMP);

-- They describe the pochette aisle (nothing is linked if it doesn't exist yet).
INSERT INTO "FacetGroupCategory" ("groupId", "categoryId")
SELECT g."id", c."id" FROM "FacetGroup" g CROSS JOIN "Category" c WHERE c."slug" = 'pochettes';

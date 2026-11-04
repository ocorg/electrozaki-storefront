-- A photo's colour must be one of the list (owner, 2026-11-04); renaming a
-- colour in the ERP renames it on every photo. NOT VALID: checked for every
-- new or changed photo now; the photos typed before the list are matched to it
-- by a one-time update, which then validates the link.
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_colorName_fkey"
  FOREIGN KEY ("colorName") REFERENCES "Color"("name") ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;

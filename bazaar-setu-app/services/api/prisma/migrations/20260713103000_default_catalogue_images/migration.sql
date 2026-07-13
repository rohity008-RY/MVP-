UPDATE "ProductMaster"
SET "imageUrl" = '/api/catalogue/images/products/' || "id" || '.svg'
WHERE "imageUrl" IS NULL
   OR "imageUrl" = ''
   OR "imageUrl" LIKE 'demo://bazaar-setu/products/%';


# Migration `20200830140040-default`

This migration has been generated by Valeri Mladenov at 8/30/2020, 2:00:40 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" DROP COLUMN "thumbURL";
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200830132604-default..20200830140040-default
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 enum AuthType {
@@ -19,9 +19,8 @@
   id          String      @default(cuid()) @id
   email       String      @unique
   password    String
   name        String?
-  thumbURL    String?
   photoURL    String?
   createdAt   DateTime    @default(now())
   updatedAt   DateTime    @default(now())
   deletedAt   DateTime?
```



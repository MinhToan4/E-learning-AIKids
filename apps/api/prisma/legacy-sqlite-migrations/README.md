# Legacy SQLite migrations

These files are retained for historical reference only. They target the former
SQLite schema (`DATETIME`, PascalCase table names) and must not be executed
against the current PostgreSQL/Supabase database.

The executable PostgreSQL history starts at
`prisma/migrations/20260721160000_baseline`. The production database was
baselined with `prisma migrate resolve`, then subsequent migrations were
applied normally with `prisma migrate deploy`.

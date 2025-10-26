# 🎯 RLS Policy Cheatsheet - Quick Reference

## ⚠️ CRITICAL: You're Using the ANON Key!

```typescript
// Your current setup (no authentication)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**This means:** ALL RLS policies MUST allow the `anon` role or they will FAIL.

---

## ✅ The Golden Rule

**ALWAYS include BOTH `anon` AND `authenticated` in your policies:**

```sql
TO anon, authenticated  -- ✅ Always do this
```

---

## 📋 Copy-Paste Templates

### SELECT (Read)
```sql
CREATE POLICY "Anyone can read [table_name]"
  ON public.[table_name]
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

### INSERT (Create)
```sql
CREATE POLICY "Anyone can create [table_name]"
  ON public.[table_name]
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

### UPDATE (Edit)
```sql
CREATE POLICY "Anyone can update [table_name]"
  ON public.[table_name]
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
```

### DELETE (Remove)
```sql
CREATE POLICY "Anyone can delete [table_name]"
  ON public.[table_name]
  FOR DELETE
  TO anon, authenticated
  USING (true);
```

---

## 🔍 Quick Checks

### Check Your Policies
```sql
SELECT tablename, policyname, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Look for:**
- ✅ `{anon,authenticated}` - Good!
- ❌ `{authenticated}` only - Will FAIL!

### Check Permissions
```sql
SELECT table_name, privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon' AND table_schema = 'public';
```

---

## ❌ Common Mistakes

### Mistake 1: Forgetting `anon`
```sql
-- ❌ WRONG - Will fail with anon key
CREATE POLICY "Users can delete"
  ON surveys FOR DELETE
  TO authenticated  -- Missing anon!
  USING (true);
```

**Fix:**
```sql
-- ✅ CORRECT
CREATE POLICY "Anyone can delete surveys"
  ON surveys FOR DELETE
  TO anon, authenticated  -- Include both!
  USING (true);
```

### Mistake 2: Missing WITH CHECK
```sql
-- ❌ WRONG - INSERT/UPDATE need WITH CHECK
CREATE POLICY "Anyone can insert"
  ON surveys FOR INSERT
  TO anon, authenticated
  USING (true);  -- Wrong clause for INSERT!
```

**Fix:**
```sql
-- ✅ CORRECT
CREATE POLICY "Anyone can insert surveys"
  ON surveys FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);  -- Correct for INSERT
```

---

## 🚨 Troubleshooting

### Error: "permission denied for table X"
**Solution:** Add SELECT policy with `anon` role

### Error: "new row violates row-level security"
**Solution:** Add INSERT policy with `WITH CHECK (true)` and `anon` role

### Silent failure: DELETE doesn't work
**Solution:** Add DELETE policy with `anon` role

---

## 📝 New Table Checklist

When creating a new table:

1. ✅ Create the table
2. ✅ Enable RLS: `ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;`
3. ✅ Add SELECT policy (with `anon`)
4. ✅ Add INSERT policy (with `anon`)
5. ✅ Add UPDATE policy (with `anon`)
6. ✅ Add DELETE policy (with `anon`)
7. ✅ Test with your app (uses anon key)

---

## 💡 Pro Tips

### Add Comments
```sql
COMMENT ON POLICY "Anyone can delete surveys" ON surveys
  IS 'Dev policy - allows anon. TODO: Restrict when auth added.';
```

### Grant Permissions Explicitly
```sql
GRANT SELECT, INSERT, UPDATE, DELETE 
ON public.[table] 
TO anon, authenticated;
```

### Check Before You Push
```bash
# Apply migration locally first
npm run db:push

# Test in browser (uses anon key)
# Then check logs for errors
```

---

## 🎓 Full Documentation

For comprehensive guide, see:
- `.cursor/rules/supabase_workflow.mdc` (Authentication Status section)
- `FIXES_SUMMARY.md` (Detailed fixes)
- `DELETION_FIX_SUMMARY.md` (Delete functionality)

---

**Remember:** Until you implement authentication, EVERY policy needs `anon` role! 🔑


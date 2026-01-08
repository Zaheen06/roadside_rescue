# Authentication Troubleshooting Guide

## Common Auth Issues and Solutions

### 1. "Missing Supabase environment variables" Error

**Problem:** Supabase client is not configured properly.

**Solution:**
1. Create a `.env.local` file in the root directory
2. Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Get these values from your Supabase project:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to Settings > API
   - Copy the "Project URL" and "anon public" key

4. Restart your development server:
```bash
npm run dev
```

### 2. "Invalid login credentials" Error

**Possible causes:**
- Wrong email or password
- Email not verified (if email confirmation is enabled)
- Account doesn't exist

**Solutions:**
- Double-check your email and password
- Check your email inbox for verification link (if email confirmation is enabled)
- Try resetting your password
- Make sure you're using the correct account type (user vs technician)

### 3. Email Confirmation Required

**Problem:** Supabase requires email confirmation before login.

**Solutions:**

**Option A: Disable email confirmation (for development)**
1. Go to Supabase Dashboard
2. Navigate to Authentication > Settings
3. Disable "Enable email confirmations"
4. Save changes

**Option B: Use email confirmation**
1. After signup, check your email inbox
2. Click the verification link
3. Then try logging in

### 4. "Access denied" Error (Technician Portal)

**Problem:** Trying to access technician portal with regular user account.

**Solution:**
- Regular users should use `/auth` for login
- Technicians should use `/technician/auth` for login
- Make sure you're registering as a technician if you need technician access

### 5. Session Not Persisting

**Problem:** User gets logged out after page refresh.

**Solution:**
- Check browser cookies/localStorage are enabled
- Clear browser cache and try again
- Make sure Supabase client is configured with `persistSession: true` (already set)

### 6. CORS Errors

**Problem:** Browser blocks requests to Supabase.

**Solution:**
- Make sure your Supabase project URL is correct
- Check Supabase project settings for allowed origins
- Add your localhost URL to allowed origins in Supabase dashboard

### 7. "Network Error" or Connection Issues

**Problem:** Cannot connect to Supabase.

**Solutions:**
- Check your internet connection
- Verify Supabase project is active (not paused)
- Check Supabase status page: https://status.supabase.com
- Verify environment variables are correct

## Debugging Steps

1. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Look for Supabase-related error messages

2. **Check Network Tab:**
   - Open DevTools > Network tab
   - Try logging in
   - Check if requests to Supabase are failing
   - Look at response status codes

3. **Verify Environment Variables:**
```bash
# Check if variables are loaded (in terminal)
echo $NEXT_PUBLIC_SUPABASE_URL
```

4. **Test Supabase Connection:**
   - Go to Supabase Dashboard
   - Try creating a user manually in Authentication > Users
   - Try logging in with that user

## Quick Fix Checklist

- [ ] `.env.local` file exists in root directory
- [ ] Environment variables are correctly named (NEXT_PUBLIC_ prefix)
- [ ] Supabase project URL is correct
- [ ] Supabase anon key is correct
- [ ] Development server restarted after adding env vars
- [ ] Browser cache cleared
- [ ] Email verification completed (if required)
- [ ] Using correct login page (user vs technician)

## Still Having Issues?

1. Check Supabase logs in Dashboard > Logs
2. Check Next.js terminal output for errors
3. Verify database schema is set up correctly (run `sql/supabase_schema.sql`)
4. Make sure Supabase project is not paused or deleted

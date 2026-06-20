# The TYPES OF FILES

1. The Admin Client (Server Only)
   What it is: @supabase/supabase-js + SERVICE_ROLE_KEY.

Use case: Bypassing RLS. Use it in background jobs, webhooks, or when an admin needs to force-delete something securely. Never expose this to the browser.

2. The Authenticated Server Client (Server Only)
   What it is: @supabase/ssr + cookies().

Use case: Fetching private data for Server Components, checking if a user is allowed to view a page, and mutating data securely inside Next.js Server Actions.

3. The Global Cache Client (Server Only)
   What it is: @supabase/supabase-js + ANON_KEY (No cookies).

Use case: Fetching public, global data (like your projects list) inside unstable_cache. It is lightning fast because it ignores user sessions entirely.

4. The Browser Client (Client Only)
   What it is: @supabase/ssr (createBrowserClient).

Use case: Runs in "use client" components. You use this when you need to update UI instantly after a button click, handle OAuth logins, or listen to Real-time database changes.


---

> If you try to use your regular createServerClient inside unstable_cache, Next.js will instantly crash with that runtime error you saw earlier.

Here is exactly why they cannot work together:

### The Problem
createServerClient is hooked up to cookies(). It is constantly looking at the browser to ask: "Who is this specific user?"

unstable_cache is a strict, blind warehouse. It wants to grab data from Supabase once, lock it in a vault, and hand that exact same data to the next 10,000 visitors.

The Clash: The moment unstable_cache sees cookies() being used inside it, it panics. It thinks: "Wait! If I cache this, I might accidentally save User A's private data and show it to User B!" So, it shuts down and throws an error.

The Solution: createPublicServerClient
To fix this, we created createPublicServerClient.

It runs on the server, but it never looks at cookies.

It doesn't care who is logged in. It just uses your public API key to grab your global projects.

Because it has zero cookie logic, unstable_cache says: "Perfect, this data is safe for everyone," and happily caches it.

Summary
Use createServerClient when you need to know who the user is (Auth, Admin checks, Deleting things).

Use createPublicServerClient when you want to cache global data on the server without Next.js crashing.
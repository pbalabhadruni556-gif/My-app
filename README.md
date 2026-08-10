# Bulk Store App — Setup Guide (No coding experience needed)

This app has a real frontend (what customers see), a real backend (API routes
that handle orders/products), and a real database (Supabase). It's free to
run at your scale (100 products, 100+ customers is nowhere near the free
limits).

Follow these steps in order. Total time: 30–45 minutes the first time.

---

## Step 1: Create your database (Supabase) — 10 min

1. Go to https://supabase.com and click **Start your project**
2. Sign up (free) using Google or email
3. Click **New project**
   - Name: anything, e.g. "bulk-store"
   - Database password: create one and **save it somewhere safe**
   - Region: pick the one closest to India (e.g. Mumbai/Singapore)
4. Wait ~2 minutes for the project to finish setting up
5. On the left sidebar, click **SQL Editor** → **New query**
6. Open the file `supabase-schema.sql` (included in this project), copy
   everything in it, paste into the SQL editor, and click **Run**
   - This creates your `products` and `orders` tables and adds a few
     starter products so the app isn't empty
7. On the left sidebar, click **Project Settings** (gear icon) → **API**
   - Copy the **Project URL** — you'll need this
   - Copy the **service_role key** (NOT the anon key) — you'll need this too
   - Keep this tab open, or paste both into a notes app temporarily

---

## Step 2: Put your project on GitHub — 10 min

(GitHub is where your code lives so Vercel can find it. Free.)

1. Go to https://github.com and create a free account if you don't have one
2. Click the **+** icon (top right) → **New repository**
   - Name it e.g. `bulk-store-app`
   - Keep it Public or Private, either is fine
   - Click **Create repository**
3. On the new repo page, click **uploading an existing file**
4. Drag and drop ALL the files/folders from this project into that upload box
5. Click **Commit changes**

---

## Step 3: Deploy with Vercel (this makes it live) — 10 min

1. Go to https://vercel.com and sign up using your **GitHub account**
2. Click **Add New** → **Project**
3. Find your `bulk-store-app` repo and click **Import**
4. Before clicking Deploy, expand **Environment Variables** and add these
   three (from Step 1 and your own choice):

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | (the Project URL you copied) |
   | `SUPABASE_SERVICE_ROLE_KEY` | (the service_role key you copied) |
   | `OWNER_PIN` | (any 4+ digit PIN you'll remember) |

5. Click **Deploy**
6. Wait ~2 minutes. When it finishes, Vercel gives you a live link like:
   `https://bulk-store-app-yourname.vercel.app`

**That link is your real, working app.** Anyone who opens it can shop.
Adding `/owner` to the end of the link (e.g. `.../owner`) opens your
dashboard, protected by the PIN you set above.

---

## Step 4: Share it

- Send the Vercel link on WhatsApp to your first customers
- Tell them to open it in their phone browser — no install needed
- They can tap "Add to Home Screen" in their browser menu so it sits on
  their phone like a normal app icon
- You manage everything from `yourlink.vercel.app/owner`

---

## Making changes later

- To add/edit/delete products: use the Owner dashboard directly — no code
  needed
- To change how the app looks or add features: edit the code in GitHub (or
  come back and ask for help), then Vercel automatically redeploys within
  a minute of any change

## If something breaks

- Wrong products/orders showing → double check you ran the full
  `supabase-schema.sql` in Step 1
- App shows an error page → double check the 3 environment variables in
  Vercel are spelled exactly right (Vercel → your project → Settings →
  Environment Variables)
- Still stuck → copy the exact error message and ask for help

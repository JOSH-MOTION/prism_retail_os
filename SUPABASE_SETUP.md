# ⚡ Supabase Setup & Integration Guide

Follow these step-by-step instructions to connect **Stitch Prism Retail OS** to your private **Supabase Cloud Database**.

---

## 💻 Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and log in or create a free account.
2. Click **New Project** and choose/create an organization.
3. Configure the following:
   * **Name**: `Stitch Prism Retail OS` (or any name you prefer)
   * **Database Password**: Write this down/secure it.
   * **Region**: Choose the region closest to you or your target audience.
4. Click **Create new project** and wait a few minutes for the database to provision.

---

## 🔑 Step 2: Configure Auth Providers

Next, enable Email/Password authentication for your workspace:

1. In the Supabase sidebar, click on **Authentication** (User icon).
2. Go to **Providers** under the settings section.
3. Locate **Email** and ensure that **Enable Email Signup** and **Enable Email Provider** are set to **ON**.
4. *(Optional)* Turn off **Confirm Email** if you want users to log in immediately without verifying email links.

---

## 🗄️ Step 3: Run Database SQL Scripts

Configure the relational database schemas.

1. Go to the **SQL Editor** tab (terminal icon `>_` in the left sidebar).
2. Click **New Query** to create a blank script.
3. Paste the following schema script and click **Run**:

```sql
-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    cost_price NUMERIC NOT NULL,
    selling_price NUMERIC NOT NULL,
    image TEXT NOT NULL,
    variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies (Restricts queries/mutations to own authenticated user ID)
CREATE POLICY "Users can manage their own products" ON public.products
    FOR ALL USING (auth.uid() = user_id);


-- 2. Create Purchases Table
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    total_quantity INT NOT NULL,
    total_amount NUMERIC NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own purchases" ON public.purchases
    FOR ALL USING (auth.uid() = user_id);


-- 3. Create Sales Table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    product_name TEXT NOT NULL,
    color TEXT NOT NULL,
    size TEXT NOT NULL,
    quantity INT NOT NULL,
    selling_price NUMERIC NOT NULL,
    cost_price NUMERIC NOT NULL,
    customer_name TEXT NOT NULL,
    revenue NUMERIC NOT NULL,
    cost NUMERIC NOT NULL,
    profit NUMERIC NOT NULL
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sales" ON public.sales
    FOR ALL USING (auth.uid() = user_id);


-- 4. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Completed',
    profit NUMERIC,
    cost NUMERIC
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);


-- 5. Create Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    capital_cash NUMERIC NOT NULL DEFAULT 0,
    profit_wallet NUMERIC NOT NULL DEFAULT 0,
    profit_reinvested NUMERIC NOT NULL DEFAULT 0,
    profit_withdrawn NUMERIC NOT NULL DEFAULT 0
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wallet" ON public.wallets
    FOR ALL USING (auth.uid() = user_id);
```

---

## 🔗 Step 4: Configure App Credentials (`.env.local`)

Connect the Next.js app to your new database instance:

1. Open your Supabase Dashboard and click **Project Settings** (gear icon) on the bottom left.
2. Select **API**.
3. Under **Project API Keys**, copy:
   * **Project URL**
   * **anon public** key
4. Open the [`.env.local`](file:///c:/Users/Khodz/Desktop/stitch_prism_retail_os/stitch_prism_retail_os/.env.local) file in the root of this project.
5. Populate the keys as follows:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key
```

6. Save the file.

---

## 🚀 Step 5: Start & Verify Workspace

1. Start your local development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000` (or `http://localhost:3001`).
3. Click **Register your boutique** to create an email-based account.
4. Once authenticated:
   * Your dashboard will load with **$0 balances and 0 inventory** (clean slate).
   * Go to **Wallet** → **Inject Startup Capital** to add funding (e.g. $15,000).
   * Go to **Inventory** → **Create Product** to add items (boxers, bags, waffle shirts, mini fans, etc.).
   * Go to **Bulk Purchase** to restock units using the auto-parsing tool.
5. All operations are written and synchronized dynamically on the cloud! You can view the live rows inside your Supabase project's **Table Editor**.

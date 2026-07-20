# Stitch Prism Retail OS 👕👜🌀

Stitch Prism Retail OS is a modern, high-fidelity business operations and financial ledger engine designed for boutique retail owners selling apparel and accessories (such as waffle shirts, leather bags, mini fans, tumblers, and merino socks).

The application merges the minimal, whitespace-conscious workspace aesthetics of **Notion** with the vibrant visual cues, elevation depths, and glowing dashboard details of the **Stripe Dashboard**. It is designed **mobile-first** with a floating bottom navigation bar and expands into a sidebar navigation console on desktop.

---

## ⚡ Core Architecture & Technology Stack

- **Core Framework:** Next.js (App Router, React 19, TypeScript).
- **Styling:** Tailwind CSS v4 configured with a dynamic design token system in `src/app/globals.css`.
- **Theme Engine:** Integrated Light/Dark modes utilizing Tailwind's class-based utility classes. The color variables transition seamlessly from a crisp white Notion workspace background to a rich slate-charcoal Stripe dark-mode container.
- **State Management:** Fully client-side state machine backed by `localStorage` persistence. The application operates in real-time; recording a sale, reinvesting profit, or pasting a manifest instantly updates balances and listings across all pages without requiring a backend database.
- **Data Visualizations:** Lightweight, highly responsive, interactive **SVG Area Charts** created directly in React. It eliminates heavy dependencies, scales perfectly, and features coordinate hover tooltip tracking.

---

## 📖 Component Breakdown & Module Workflows

The application is structured into **9 core page modules** within a Single Page Application interface:

### 1. Authentication & Workspace Setup
- **Forms:** Allows registration and login by recording username, business name, and email details.
- **Demo Mode:** Features a fast-entry sandbox bypass that pre-seeds the browser storage with a complete historical catalog of transactions, stock levels, sales logs, and wallets. This provides a populated workspace experience out-of-the-box.

### 2. Operations Dashboard
- **3x3 KPI Metrics Grid:**
  - **Business Worth:** *Capital Cash + Profit Wallet + Inventory Valuation*. Highlighted in a gradient card.
  - **Inventory Value:** Valuation of warehouse items calculated dynamically at cost price.
  - **Capital Cash:** Cash reserved for restocking inventory.
  - **Profit Wallet:** Net profit margins accumulated from transactions.
  - **Cash Available:** Liquid cash portfolio (*Capital Cash + Profit Wallet*).
  - **Warehouse Count:** Total number of physical item units in stock.
  - **Life-time Sold:** Cumulative counter of units sold.
  - **Revenue & Profit Today:** Gross revenue and net margin generated in the current calendar day.
- **Activity Feeds:** Lists the 5 most recent sales and restock batches.
- **Stock Warnings:** Triggers low-stock badges automatically if any variant falls to $\le 3$ units.
- **Quick Links:** Buttons to log sales, import manifests, or process bank withdrawals instantly.

### 3. Boutique Inventory
- **Grouped Categories:** Categorizes items into *Clothing*, *Accessories*, *Electronics*, and *Home Goods*.
- **High-Density Table:** Displays stock quantities, costs, sales prices, and total valuations for all inventory.
- **Expandable Matrix:** Clicking any product expands an accordion listing variant stock levels by color and size (e.g., Waffle Knit Long Sleeve Shirt in *Navy Blue / XL* has 6 units left).

### 4. Bulk Manifest Intake
- **Manifest Format:** Pastes raw text manifests from wholesale invoices in a key-value style:
  ```text
  Navy Blue: 4 Large, 6 XL, 3 XXL
  Obsidian Black: 5 Large, 3 XL
  Heather Grey: 2 Medium, 5 Large
  ```
- **Regex Parsing:** Clicking **Parse** processes the lines, Normalizes sizes (e.g., *Large* $\rightarrow$ *L*), and displays a tabular preview with calculated totals.
- **Safety Balance Check:** Compares the total order cost against your *Capital Cash* balance. If you have insufficient capital funds, the submission is blocked. On approval, the engine restocks variants, subtracts capital, logs the purchase batch, and adds a transaction entry.

### 5. Point of Sale (POS) Workflow
- **Validation-Locked Inputs:**
  - **Product Dropdown:** Dynamically updates available colors.
  - **Color Selector:** Dynamically updates available sizes.
  - **Size Selector:** Lists available stock inline (e.g., `L (6 in stock)`) and limits the sale quantity to that ceiling.
- **Real-Time Margin Calculator:** Shows gross sales revenue, cost price, net profit margin, and how the earnings will split across wallets.
- **Financial Allocation Rules:**
  - **Revenue** is split: the **Cost of Goods Sold (COGS)** goes back into **Capital Cash** (to ensure the business can afford to buy replacements).
  - The **Net Profit** is deposited directly into the **Profit Wallet** (to be withdrawn or reinvested).

### 6. Timeline Purchases
- A timeline tracking wholesale restocks. Each entry lists supplier info, invoice amounts, quantities, date, and expandable items logs.

### 7. Analytical Reports
- Interactive charts tracking Revenue, Profit, Stock Valuation, and Capital Growth.
- Features a custom SVG graph with a coordinate tracking cursor.
- Displays monthly statistics comparing sales margins, averages, and best-performing categories (e.g., Clothing vs. Accessories).

### 8. Capital Portfolios (Wallet)
- Displays segregated balances and offers two actions:
  - **Withdraw Profits:** Moves cash out of the *Profit Wallet* into an external bank account (updating `profitWithdrawn`).
  - **Reinvest Capital:** Transfers cash from the *Profit Wallet* to *Capital Cash* to fund larger restocks (updating `profitReinvested`).

### 9. Ledger Transactions
- A chronological audit ledger log of all operations.
- Supported types: *Investments*, *Purchases*, *Sales*, *Restocks*, *Reinvestments*, and *Withdrawals*.
- Filterable by type and searchable by descriptions.

---

## 💻 Running the App Locally

To start the application locally:

1. Clone or access the workspace root.
2. Install the node packages:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. If Port `3000` is already in use by another local process, Next.js will automatically open the app on:
   ```text
   http://localhost:3001
   ```

---

## 📈 Future Architecture Extensions

To expand or integrate this OS with production databases:
1. **API Endpoints:** Replace the client-side state managers in `src/app/page.tsx` with async `fetch` queries hitting Next.js route handlers (`src/app/api/products/route.ts`).
2. **Database Integration:** Connect Prisma or Drizzle ORM to a Postgres or MongoDB instance to replace the browser's `localStorage`.
3. **Authentication Services:** Plug in NextAuth.js or Clerk to replace the simple client-side credential storage.

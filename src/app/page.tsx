"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

// ==========================================
// TYPES
// ==========================================

interface Variant {
  color: string;
  size: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  image: string;
  variants: Variant[];
}

interface PurchaseItem {
  name: string;
  color: string;
  size: string;
  quantity: number;
  costPrice: number;
}

interface PurchaseBatch {
  id: string;
  supplier: string;
  date: string;
  totalQuantity: number;
  totalAmount: number;
  items: PurchaseItem[];
}

interface Transaction {
  id: string;
  date: string;
  type: "Investment" | "Purchase" | "Sale" | "Restock" | "Profit Reinvestment" | "Withdrawal";
  description: string;
  amount: number;
  status: "Completed" | "Pending";
  profit?: number;
  cost?: number;
}

interface Sale {
  id: string;
  date: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
  customerName: string;
  revenue: number;
  cost: number;
  profit: number;
}

// ==========================================
// SEED DATA (USED ONLY FOR DEMO TRiggers)
// ==========================================

const SEED_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Waffle Knit Long Sleeve Shirt",
    category: "Clothing",
    costPrice: 15,
    sellingPrice: 35,
    image: "👕",
    variants: [
      { color: "Navy Blue", size: "L", quantity: 12 },
      { color: "Navy Blue", size: "XL", quantity: 6 },
      { color: "Navy Blue", size: "XXL", quantity: 3 },
      { color: "Black", size: "L", quantity: 15 },
      { color: "Black", size: "XL", quantity: 8 },
      { color: "Black", size: "XXL", quantity: 4 },
      { color: "Heather Grey", size: "M", quantity: 10 },
      { color: "Heather Grey", size: "L", quantity: 12 },
      { color: "Heather Grey", size: "XL", quantity: 5 }
    ]
  },
  {
    id: "p2",
    name: "Premium Leather Tote Bag",
    category: "Accessories",
    costPrice: 45,
    sellingPrice: 110,
    image: "👜",
    variants: [
      { color: "Tan Leather", size: "One Size", quantity: 10 },
      { color: "Midnight Black", size: "One Size", quantity: 8 }
    ]
  },
  {
    id: "p3",
    name: "USB Desk Mini Fan",
    category: "Electronics",
    costPrice: 8,
    sellingPrice: 22,
    image: "🌀",
    variants: [
      { color: "Sage Green", size: "One Size", quantity: 18 },
      { color: "Polar White", size: "One Size", quantity: 25 },
      { color: "Slate Blue", size: "One Size", quantity: 12 }
    ]
  },
  {
    id: "p4",
    name: "Stainless Insulated Tumbler",
    category: "Home Goods",
    costPrice: 10,
    sellingPrice: 28,
    image: "🥤",
    variants: [
      { color: "Matte Black", size: "One Size", quantity: 20 },
      { color: "Cream", size: "One Size", quantity: 15 },
      { color: "Olive Green", size: "One Size", quantity: 12 }
    ]
  },
  {
    id: "p5",
    name: "Cozy Merino Wool Socks",
    category: "Clothing",
    costPrice: 6,
    sellingPrice: 18,
    image: "🧦",
    variants: [
      { color: "Oatmeal", size: "M", quantity: 22 },
      { color: "Oatmeal", size: "L", quantity: 18 },
      { color: "Charcoal", size: "M", quantity: 15 },
      { color: "Charcoal", size: "L", quantity: 20 }
    ]
  }
];

const SEED_PURCHASES: PurchaseBatch[] = [
  {
    id: "pur-1",
    supplier: "Apex Apparel Wholesale Ltd.",
    date: "2026-07-05T10:30:00.000Z",
    totalQuantity: 91,
    totalAmount: 1365,
    items: [
      { name: "Waffle Knit Long Sleeve Shirt", color: "Navy Blue", size: "L", quantity: 12, costPrice: 15 },
      { name: "Waffle Knit Long Sleeve Shirt", color: "Navy Blue", size: "XL", quantity: 6, costPrice: 15 },
      { name: "Waffle Knit Long Sleeve Shirt", color: "Black", size: "L", quantity: 15, costPrice: 15 },
      { name: "Cozy Merino Wool Socks", color: "Oatmeal", size: "M", quantity: 22, costPrice: 6 },
      { name: "Cozy Merino Wool Socks", color: "Charcoal", size: "L", quantity: 20, costPrice: 6 }
    ]
  },
  {
    id: "pur-2",
    supplier: "Pacific Tech & Goods Corp.",
    date: "2026-07-10T14:15:00.000Z",
    totalQuantity: 55,
    totalAmount: 440,
    items: [
      { name: "USB Desk Mini Fan", color: "Sage Green", size: "One Size", quantity: 18, costPrice: 8 },
      { name: "USB Desk Mini Fan", color: "Polar White", size: "One Size", quantity: 25, costPrice: 8 },
      { name: "USB Desk Mini Fan", color: "Slate Blue", size: "One Size", quantity: 12, costPrice: 8 }
    ]
  },
  {
    id: "pur-3",
    supplier: "Starlight Gear Co.",
    date: "2026-07-14T09:00:00.000Z",
    totalQuantity: 47,
    totalAmount: 470,
    items: [
      { name: "Stainless Insulated Tumbler", color: "Matte Black", size: "One Size", quantity: 20, costPrice: 10 },
      { name: "Stainless Insulated Tumbler", color: "Cream", size: "One Size", quantity: 15, costPrice: 10 },
      { name: "Stainless Insulated Tumbler", color: "Olive Green", size: "One Size", quantity: 12, costPrice: 10 }
    ]
  }
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    date: "2026-07-01T08:00:00.000Z",
    type: "Investment",
    description: "Initial Capital Injection",
    amount: 15000,
    status: "Completed"
  },
  {
    id: "tx-2",
    date: "2026-07-05T10:35:00.000Z",
    type: "Purchase",
    description: "Inventory restock batch (Apex Apparel)",
    amount: -1365,
    status: "Completed"
  },
  {
    id: "tx-3",
    date: "2026-07-08T12:30:00.000Z",
    type: "Sale",
    description: "Sold 2 Waffle Knit Long Sleeve (Navy Blue - L) to Sarah Jenkins",
    amount: 70,
    status: "Completed",
    profit: 40,
    cost: 30
  },
  {
    id: "tx-4",
    date: "2026-07-10T14:20:00.000Z",
    type: "Purchase",
    description: "Inventory batch purchase (Pacific Tech)",
    amount: -440,
    status: "Completed"
  },
  {
    id: "tx-5",
    date: "2026-07-11T16:45:00.000Z",
    type: "Sale",
    description: "Sold 1 Premium Leather Tote (Midnight Black - One Size) to Robert Chen",
    amount: 110,
    status: "Completed",
    profit: 65,
    cost: 45
  },
  {
    id: "tx-6",
    date: "2026-07-14T09:10:00.000Z",
    type: "Purchase",
    description: "Inventory batch purchase (Starlight Gear)",
    amount: -470,
    status: "Completed"
  },
  {
    id: "tx-7",
    date: "2026-07-16T11:15:00.000Z",
    type: "Sale",
    description: "Sold 3 USB Desk Mini Fan (Sage Green) to Emma Watson",
    amount: 66,
    status: "Completed",
    profit: 42,
    cost: 24
  },
  {
    id: "tx-8",
    date: "2026-07-18T10:00:00.000Z",
    type: "Profit Reinvestment",
    description: "Transferred profits to Capital Cash",
    amount: 2000,
    status: "Completed"
  },
  {
    id: "tx-9",
    date: "2026-07-19T17:00:00.000Z",
    type: "Withdrawal",
    description: "Profit withdrawal to external bank account",
    amount: -4000,
    status: "Completed"
  }
];

const SEED_SALES: Sale[] = [
  {
    id: "sale-1",
    date: "2026-07-08T12:30:00.000Z",
    productName: "Waffle Knit Long Sleeve Shirt",
    color: "Navy Blue",
    size: "L",
    quantity: 2,
    sellingPrice: 35,
    costPrice: 15,
    customerName: "Sarah Jenkins",
    revenue: 70,
    cost: 30,
    profit: 40
  },
  {
    id: "sale-2",
    date: "2026-07-11T16:45:00.000Z",
    productName: "Premium Leather Tote Bag",
    color: "Midnight Black",
    size: "One Size",
    quantity: 1,
    sellingPrice: 110,
    costPrice: 45,
    customerName: "Robert Chen",
    revenue: 110,
    cost: 45,
    profit: 65
  },
  {
    id: "sale-3",
    date: "2026-07-16T11:15:00.000Z",
    productName: "USB Desk Mini Fan",
    color: "Sage Green",
    size: "One Size",
    quantity: 3,
    sellingPrice: 22,
    costPrice: 8,
    customerName: "Emma Watson",
    revenue: 66,
    cost: 24,
    profit: 42
  }
];

const SEED_WALLET = {
  capitalCash: 14749,
  profitWallet: 2147,
  profitReinvested: 2000,
  profitWithdrawn: 4000
};

// ==========================================
// CLEAN PRODUCTION BASE INITS (0 DUMMY DATA)
// ==========================================

const INITIAL_PRODUCTS: Product[] = [];
const INITIAL_PURCHASES: PurchaseBatch[] = [];
const INITIAL_TRANSACTIONS: Transaction[] = [];
const INITIAL_SALES: Sale[] = [];
const INITIAL_WALLET = {
  capitalCash: 0,
  profitWallet: 0,
  profitReinvested: 0,
  profitWithdrawn: 0
};

// ==========================================
// DATABASE RELATIONAL MAPPING HELPERS
// ==========================================

const mapDBProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  category: p.category,
  costPrice: Number(p.cost_price),
  sellingPrice: Number(p.selling_price),
  image: p.image,
  variants: p.variants
});

const mapDBSale = (s: any): Sale => ({
  id: s.id,
  date: s.date,
  productName: s.product_name,
  color: s.color,
  size: s.size,
  quantity: Number(s.quantity),
  sellingPrice: Number(s.selling_price),
  costPrice: Number(s.cost_price),
  customerName: s.customer_name,
  revenue: Number(s.revenue),
  cost: Number(s.cost),
  profit: Number(s.profit)
});

const mapDBPurchase = (p: any): PurchaseBatch => ({
  id: p.id,
  supplier: p.supplier,
  date: p.date,
  totalQuantity: Number(p.total_quantity),
  totalAmount: Number(p.total_amount),
  items: p.items
});

const mapDBTransaction = (t: any): Transaction => ({
  id: t.id,
  date: t.date,
  type: t.type,
  description: t.description,
  amount: Number(t.amount),
  status: t.status,
  profit: t.profit ? Number(t.profit) : undefined,
  cost: t.cost ? Number(t.cost) : undefined
});

const mapDBWallet = (w: any) => ({
  capitalCash: Number(w.capital_cash),
  profitWallet: Number(w.profit_wallet),
  profitReinvested: Number(w.profit_reinvested),
  profitWithdrawn: Number(w.profit_withdrawn)
});

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register" | "forgot" | "reset-password">("login");
  const [username, setUsername] = useState("Alex Sterling");
  const [businessName, setBusinessName] = useState("Stitch & Prism Co.");
  const [email, setEmail] = useState("alex@stitchprism.com");
  const [password, setPassword] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authAlert, setAuthAlert] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Supabase Database Connection indicators
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isLoadingDB, setIsLoadingDB] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  // App Theme
  const [darkMode, setDarkMode] = useState(false);

  // Tab routing
  const [currentTab, setCurrentTab] = useState("dashboard");

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<PurchaseBatch[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [wallet, setWallet] = useState(INITIAL_WALLET);

  // Add Product Form variables
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Clothing");
  const [newProdCost, setNewProdCost] = useState("");
  const [newProdSelling, setNewProdSelling] = useState("");
  const [newProdImage, setNewProdImage] = useState("📦");
  const [productAddAlert, setProductAddAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Wallet Capital Injection variables
  const [injectAmount, setInjectAmount] = useState("");

  // UI state variables
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [inventoryCategory, setInventoryCategory] = useState("All");
  const [inventorySearch, setInventorySearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bulk Purchase Page variables
  const [bulkProductSelect, setBulkProductSelect] = useState("");
  const [bulkSupplier, setBulkSupplier] = useState("");
  const [bulkIsInitial, setBulkIsInitial] = useState(false);
  const [bulkText, setBulkText] = useState(
    "Navy Blue: 4 Large, 6 XL, 3 XXL\nObsidian Black: 5 Large, 3 XL\nHeather Grey: 2 Medium, 5 Large"
  );
  const [isParsing, setIsParsing] = useState(false);
  const [parsedItems, setParsedItems] = useState<{ color: string; size: string; quantity: number }[]>([]);
  const [parsingAlert, setParsingAlert] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);

  // Sales Page variables
  const [saleProductSelect, setSaleProductSelect] = useState("");
  const [saleColorSelect, setSaleColorSelect] = useState("");
  const [saleSizeSelect, setSaleSizeSelect] = useState("");
  const [saleQtyInput, setSaleQtyInput] = useState(1);
  const [salePriceInput, setSalePriceInput] = useState("");
  const [saleCustomerName, setSaleCustomerName] = useState("");
  const [saleAlert, setSaleAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Wallet Page action variables
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBank, setWithdrawBank] = useState("");
  const [reinvestAmount, setReinvestAmount] = useState("");
  const [walletAlert, setWalletAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Transactions filters
  const [txFilter, setTxFilter] = useState("All");
  const [txSearch, setTxSearch] = useState("");

  // Chart hover tracker state
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [activeReportMetric, setActiveReportMetric] = useState<"revenue" | "profit" | "cogs" | "inventory" | "capital">("revenue");

  // ==========================================
  // INITIALIZATION AND SYNC
  // ==========================================

  useEffect(() => {
    setIsMounted(true);
    
    // Check Dark Mode
    const cachedTheme = localStorage.getItem("sp_dark_mode");
    if (cachedTheme === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    if (supabase) {
      setIsDbConnected(true);
      
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsLoggedIn(true);
          const user = session.user;
          setActiveUserId(user.id);
          setUsername(user.user_metadata?.username || "Boutique Owner");
          setBusinessName(user.user_metadata?.business_name || "Retail Workspace");
          setEmail(user.email || "");
          fetchUserData(user.id);
        } else {
          checkLocalFallback();
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setAuthView("reset-password");
          setIsLoggedIn(false);
        } else if (session?.user) {
          setIsLoggedIn(true);
          const user = session.user;
          setActiveUserId(user.id);
          setUsername(user.user_metadata?.username || "Boutique Owner");
          setBusinessName(user.user_metadata?.business_name || "Retail Workspace");
          setEmail(user.email || "");
          fetchUserData(user.id);
        } else {
          setIsLoggedIn(false);
          setActiveUserId(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setIsDbConnected(false);
      checkLocalFallback();
    }
  }, []);

  const checkLocalFallback = () => {
    const cachedAuth = localStorage.getItem("sp_is_logged_in");
    if (cachedAuth === "true") {
      setIsLoggedIn(true);
      const curEmail = localStorage.getItem("sp_email") || "";
      const cachedUsersRaw = localStorage.getItem("sp_local_users");
      const localUsers = cachedUsersRaw ? JSON.parse(cachedUsersRaw) : [];
      const matchedUser = localUsers.find((u: any) => u.email.toLowerCase() === curEmail.toLowerCase());

      if (matchedUser) {
        setUsername(matchedUser.username);
        setBusinessName(matchedUser.businessName);
        setEmail(matchedUser.email);
        setProducts(matchedUser.products || []);
        setPurchases(matchedUser.purchases || []);
        setTransactions(matchedUser.transactions || []);
        setSales(matchedUser.sales || []);
        setWallet(matchedUser.wallet || INITIAL_WALLET);
        return;
      }

      setUsername(localStorage.getItem("sp_username") || "Alex Sterling");
      setBusinessName(localStorage.getItem("sp_business_name") || "Stitch & Prism Co.");
      setEmail(localStorage.getItem("sp_email") || "alex@stitchprism.com");
    }

    const cachedProducts = localStorage.getItem("sp_products");
    setProducts(cachedProducts ? JSON.parse(cachedProducts) : INITIAL_PRODUCTS);
    const cachedPurchases = localStorage.getItem("sp_purchases");
    setPurchases(cachedPurchases ? JSON.parse(cachedPurchases) : INITIAL_PURCHASES);
    const cachedTransactions = localStorage.getItem("sp_transactions");
    setTransactions(cachedTransactions ? JSON.parse(cachedTransactions) : INITIAL_TRANSACTIONS);
    const cachedSales = localStorage.getItem("sp_sales");
    setSales(cachedSales ? JSON.parse(cachedSales) : INITIAL_SALES);
    const cachedWallet = localStorage.getItem("sp_wallet");
    setWallet(cachedWallet ? JSON.parse(cachedWallet) : INITIAL_WALLET);
  };

  const saveLocalState = (
    newProducts: Product[],
    newPurchases: PurchaseBatch[],
    newTransactions: Transaction[],
    newSales: Sale[],
    newWallet: typeof wallet
  ) => {
    setProducts(newProducts);
    setPurchases(newPurchases);
    setTransactions(newTransactions);
    setSales(newSales);
    setWallet(newWallet);

    localStorage.setItem("sp_products", JSON.stringify(newProducts));
    localStorage.setItem("sp_purchases", JSON.stringify(newPurchases));
    localStorage.setItem("sp_transactions", JSON.stringify(newTransactions));
    localStorage.setItem("sp_sales", JSON.stringify(newSales));
    localStorage.setItem("sp_wallet", JSON.stringify(newWallet));

    // Update in users registry
    const currentUserEmail = localStorage.getItem("sp_email");
    if (currentUserEmail) {
      const cachedUsersRaw = localStorage.getItem("sp_local_users");
      const localUsers = cachedUsersRaw ? JSON.parse(cachedUsersRaw) : [];
      const userIdx = localUsers.findIndex((u: any) => u.email.toLowerCase() === currentUserEmail.toLowerCase());
      if (userIdx > -1) {
        localUsers[userIdx].products = newProducts;
        localUsers[userIdx].purchases = newPurchases;
        localUsers[userIdx].transactions = newTransactions;
        localUsers[userIdx].sales = newSales;
        localUsers[userIdx].wallet = newWallet;
        localStorage.setItem("sp_local_users", JSON.stringify(localUsers));
      }
    }
  };

  // ==========================================
  // SUPABASE DATABASE LOGIC
  // ==========================================

  const fetchUserData = async (userId: string) => {
    if (!supabase) return;
    setIsLoadingDB(true);
    try {
      // 1. Fetch Wallets
      const { data: walletData, error: wErr } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      let currentWallet = INITIAL_WALLET;
      if (wErr) throw wErr;
      if (walletData) {
        currentWallet = mapDBWallet(walletData);
        setWallet(currentWallet);
      } else {
        const { data: newW, error: nwErr } = await supabase
          .from("wallets")
          .insert([
            {
              user_id: userId,
              capital_cash: INITIAL_WALLET.capitalCash,
              profit_wallet: INITIAL_WALLET.profitWallet,
              profit_reinvested: INITIAL_WALLET.profitReinvested,
              profit_withdrawn: INITIAL_WALLET.profitWithdrawn
            }
          ])
          .select()
          .single();
        if (nwErr) throw nwErr;
        if (newW) {
          currentWallet = mapDBWallet(newW);
          setWallet(currentWallet);
        }
      }

      // 2. Fetch Products
      const { data: prodData, error: pErr } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (pErr) throw pErr;
      if (prodData) {
        setProducts(prodData.map(mapDBProduct));
      }

      // 3. Fetch Purchases
      const { data: purData, error: purErr } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      if (purErr) throw purErr;
      if (purData) setPurchases(purData.map(mapDBPurchase));

      // 4. Fetch Sales
      const { data: salesData, error: sErr } = await supabase
        .from("sales")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      if (sErr) throw sErr;
      if (salesData) setSales(salesData.map(mapDBSale));

      // 5. Fetch Transactions
      const { data: txData, error: tErr } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      if (tErr) throw tErr;
      if (txData) setTransactions(txData.map(mapDBTransaction));

    } catch (err: any) {
      console.error("Error loading user data from Supabase:", err);
      checkLocalFallback();
    } finally {
      setIsLoadingDB(false);
    }
  };

  const seedSupabaseUser = async (userId: string) => {
    if (!supabase) return;
    try {
      // Seed initial sample metrics to kick off database values in demo trigger
      const productsToInsert = SEED_PRODUCTS.map((p) => ({
        user_id: userId,
        name: p.name,
        category: p.category,
        cost_price: p.costPrice,
        selling_price: p.sellingPrice,
        image: p.image,
        variants: p.variants
      }));
      const { error: pErr } = await supabase.from("products").insert(productsToInsert);
      if (pErr) throw pErr;

      const purchasesToInsert = SEED_PURCHASES.map((pur) => ({
        user_id: userId,
        supplier: pur.supplier,
        date: pur.date,
        total_quantity: pur.totalQuantity,
        total_amount: pur.totalAmount,
        items: pur.items
      }));
      await supabase.from("purchases").insert(purchasesToInsert);

      const salesToInsert = SEED_SALES.map((sale) => ({
        user_id: userId,
        date: sale.date,
        product_name: sale.productName,
        color: sale.color,
        size: sale.size,
        quantity: sale.quantity,
        selling_price: sale.sellingPrice,
        cost_price: sale.costPrice,
        customer_name: sale.customerName,
        revenue: sale.revenue,
        cost: sale.cost,
        profit: sale.profit
      }));
      await supabase.from("sales").insert(salesToInsert);

      const txsToInsert = SEED_TRANSACTIONS.map((tx) => ({
        user_id: userId,
        date: tx.date,
        type: tx.type,
        description: tx.description,
        amount: tx.amount,
        status: tx.status,
        profit: tx.profit,
        cost: tx.cost
      }));
      await supabase.from("transactions").insert(txsToInsert);

      await supabase.from("wallets")
        .update({
          capital_cash: SEED_WALLET.capitalCash,
          profit_wallet: SEED_WALLET.profitWallet,
          profit_reinvested: SEED_WALLET.profitReinvested,
          profit_withdrawn: SEED_WALLET.profitWithdrawn
        })
        .eq("user_id", userId);

    } catch (err) {
      console.error("Database seeding exception occurred:", err);
    }
  };

  // ==========================================
  // DYNAMIC COMPUTED VALUES
  // ==========================================

  const dynamicInventoryValue = useMemo(() => {
    return products.reduce((acc, prod) => {
      const prodTotalQty = prod.variants.reduce((qAcc, v) => qAcc + v.quantity, 0);
      return acc + prodTotalQty * prod.costPrice;
    }, 0);
  }, [products]);

  const dynamicBusinessWorth = useMemo(() => {
    return wallet.capitalCash + wallet.profitWallet + dynamicInventoryValue;
  }, [wallet.capitalCash, wallet.profitWallet, dynamicInventoryValue]);

  const totalProductsInStock = useMemo(() => {
    return products.reduce((acc, prod) => {
      return acc + prod.variants.reduce((qAcc, v) => qAcc + v.quantity, 0);
    }, 0);
  }, [products]);

  const totalProductsSold = useMemo(() => {
    return sales.reduce((acc, sale) => acc + sale.quantity, 0);
  }, [sales]);

  const totalSalesCost = useMemo(() => {
    return sales.reduce((acc, sale) => acc + (sale.cost || 0), 0);
  }, [sales]);

  const totalSalesRevenue = useMemo(() => {
    return sales.reduce((acc, sale) => acc + (sale.revenue || 0), 0);
  }, [sales]);

  const dailyMetrics = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    let revenueToday = 0;
    let profitToday = 0;

    sales.forEach((sale) => {
      const saleDateStr = new Date(sale.date).toISOString().split("T")[0];
      if (saleDateStr === todayStr) {
        revenueToday += sale.revenue;
        profitToday += sale.profit;
      }
    });

    return { revenueToday, profitToday };
  }, [sales]);

  const selectedProductObj = useMemo(() => {
    return products.find((p) => p.id === saleProductSelect);
  }, [products, saleProductSelect]);

  const availableColorsForSelected = useMemo(() => {
    if (!selectedProductObj) return [];
    const colors = new Set<string>();
    selectedProductObj.variants.forEach((v) => {
      if (v.quantity > 0) colors.add(v.color);
    });
    return Array.from(colors);
  }, [selectedProductObj]);

  const availableSizesForSelectedAndColor = useMemo(() => {
    if (!selectedProductObj || !saleColorSelect) return [];
    return selectedProductObj.variants.filter((v) => v.color === saleColorSelect && v.quantity > 0);
  }, [selectedProductObj, saleColorSelect]);

  const selectedVariantStock = useMemo(() => {
    if (!selectedProductObj || !saleColorSelect || !saleSizeSelect) return 0;
    const match = selectedProductObj.variants.find(
      (v) => v.color === saleColorSelect && v.size === saleSizeSelect
    );
    return match ? match.quantity : 0;
  }, [selectedProductObj, saleColorSelect, saleSizeSelect]);

  // Default selling price when product changes
  useEffect(() => {
    if (selectedProductObj) {
      setSalePriceInput(selectedProductObj.sellingPrice > 0 ? selectedProductObj.sellingPrice.toString() : "");
      setSaleColorSelect("");
      setSaleSizeSelect("");
      setSaleQtyInput(1);
    }
  }, [saleProductSelect, selectedProductObj]);

  // ==========================================
  // ACTIONS / HANDLERS
  // ==========================================

  // Authentication Flow
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthAlert(null);
    setIsAuthenticating(true);

    if (supabase) {
      try {
        if (authView === "login") {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
        } else if (authView === "register") {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
                business_name: businessName
              }
            }
          });
          if (error) throw error;
          
          if (data?.user) {
            setAuthAlert({
              type: "success",
              msg: "Signup successful! Creating your clean production workspace..."
            });
            // We start clean on signup! Wallets init to 0.
            await supabase.from("wallets").insert([
              {
                user_id: data.user.id,
                capital_cash: 0,
                profit_wallet: 0,
                profit_reinvested: 0,
                profit_withdrawn: 0
              }
            ]);
          }
        } else if (authView === "forgot") {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
          });
          if (error) throw error;
          setAuthAlert({
            type: "success",
            msg: "Password reset instructions have been sent to your email!"
          });
        } else if (authView === "reset-password") {
          if (newPasswordInput !== confirmPasswordInput) {
            setAuthAlert({ type: "error", msg: "Passwords do not match." });
            setIsAuthenticating(false);
            return;
          }
          const { error } = await supabase.auth.updateUser({
            password: newPasswordInput
          });
          if (error) throw error;
          setAuthAlert({
            type: "success",
            msg: "Your password has been successfully updated! Redirecting to login..."
          });
          setTimeout(() => {
            setAuthView("login");
            setNewPasswordInput("");
            setConfirmPasswordInput("");
            setAuthAlert(null);
          }, 2000);
        }
      } catch (err: any) {
        setAuthAlert({ type: "error", msg: err.message || "An authentication error occurred." });
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      // Local fallback: Verify local registered users
      setTimeout(() => {
        const cachedUsersRaw = localStorage.getItem("sp_local_users");
        const localUsers = cachedUsersRaw ? JSON.parse(cachedUsersRaw) : [];

        if (authView === "register") {
          const userExists = localUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
          if (userExists) {
            setAuthAlert({ type: "error", msg: "This email address is already registered. Please login instead." });
            setIsAuthenticating(false);
            return;
          }

          const cachedProducts = localStorage.getItem("sp_products");
          const cachedPurchases = localStorage.getItem("sp_purchases");
          const cachedTransactions = localStorage.getItem("sp_transactions");
          const cachedSales = localStorage.getItem("sp_sales");
          const cachedWallet = localStorage.getItem("sp_wallet");

          const startProducts = cachedProducts ? JSON.parse(cachedProducts) : INITIAL_PRODUCTS;
          const startPurchases = cachedPurchases ? JSON.parse(cachedPurchases) : INITIAL_PURCHASES;
          const startTransactions = cachedTransactions ? JSON.parse(cachedTransactions) : INITIAL_TRANSACTIONS;
          const startSales = cachedSales ? JSON.parse(cachedSales) : INITIAL_SALES;
          const startWallet = cachedWallet ? JSON.parse(cachedWallet) : INITIAL_WALLET;

          const newUser = {
            username,
            businessName,
            email,
            password,
            products: startProducts,
            purchases: startPurchases,
            transactions: startTransactions,
            sales: startSales,
            wallet: startWallet
          };

          localUsers.push(newUser);
          localStorage.setItem("sp_local_users", JSON.stringify(localUsers));

          setIsLoggedIn(true);
          localStorage.setItem("sp_is_logged_in", "true");
          localStorage.setItem("sp_username", username);
          localStorage.setItem("sp_business_name", businessName);
          localStorage.setItem("sp_email", email);

          setProducts(startProducts);
          setPurchases(startPurchases);
          setTransactions(startTransactions);
          setSales(startSales);
          setWallet(startWallet);
          
          setAuthAlert({ type: "success", msg: "Registered successfully! Loading workspace..." });
        } else if (authView === "login") {
          const matchedUser = localUsers.find(
            (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
          );

          if (!matchedUser) {
            setAuthAlert({ type: "error", msg: "Invalid email or password. Please verify details or sign up." });
            setIsAuthenticating(false);
            return;
          }

          setIsLoggedIn(true);
          localStorage.setItem("sp_is_logged_in", "true");
          localStorage.setItem("sp_username", matchedUser.username);
          localStorage.setItem("sp_business_name", matchedUser.businessName);
          localStorage.setItem("sp_email", matchedUser.email);

          setUsername(matchedUser.username);
          setBusinessName(matchedUser.businessName);

          // Load user's data
          setProducts(matchedUser.products || []);
          setPurchases(matchedUser.purchases || []);
          setTransactions(matchedUser.transactions || []);
          setSales(matchedUser.sales || []);
          setWallet(matchedUser.wallet || INITIAL_WALLET);

          // Update current active cache
          localStorage.setItem("sp_products", JSON.stringify(matchedUser.products || []));
          localStorage.setItem("sp_purchases", JSON.stringify(matchedUser.purchases || []));
          localStorage.setItem("sp_transactions", JSON.stringify(matchedUser.transactions || []));
          localStorage.setItem("sp_sales", JSON.stringify(matchedUser.sales || []));
          localStorage.setItem("sp_wallet", JSON.stringify(matchedUser.wallet || INITIAL_WALLET));
        } else if (authView === "forgot") {
          const userExists = localUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
          if (!userExists) {
            setAuthAlert({ type: "error", msg: "This email address is not registered in our system." });
            setIsAuthenticating(false);
            return;
          }
          setAuthAlert({
            type: "info",
            msg: "Registered account found locally! Redirecting to password reset..."
          });
          setTimeout(() => {
            setAuthView("reset-password");
            setAuthAlert(null);
          }, 1000);
        } else if (authView === "reset-password") {
          if (newPasswordInput !== confirmPasswordInput) {
            setAuthAlert({ type: "error", msg: "Passwords do not match." });
            setIsAuthenticating(false);
            return;
          }
          const userIdx = localUsers.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
          if (userIdx === -1) {
            setAuthAlert({ type: "error", msg: "User account session mapping failed." });
            setIsAuthenticating(false);
            return;
          }
          localUsers[userIdx].password = newPasswordInput;
          localStorage.setItem("sp_local_users", JSON.stringify(localUsers));

          setAuthAlert({ type: "success", msg: "Password successfully updated! Redirecting to login..." });
          setTimeout(() => {
            setAuthView("login");
            setNewPasswordInput("");
            setConfirmPasswordInput("");
            setAuthAlert(null);
          }, 2000);
        }
        setIsAuthenticating(false);
      }, 500);
    }
  };

  const handleDemoLogin = () => {
    setIsLoggedIn(true);
    setUsername("Alex Sterling");
    setBusinessName("Stitch & Prism Co.");
    setEmail("alex@stitchprism.com");
    localStorage.setItem("sp_is_logged_in", "true");
    localStorage.setItem("sp_username", "Alex Sterling");
    localStorage.setItem("sp_business_name", "Stitch & Prism Co.");
    localStorage.setItem("sp_email", "alex@stitchprism.com");

    // Explicitly load demo seed data on click
    saveLocalState(SEED_PRODUCTS, SEED_PURCHASES, SEED_TRANSACTIONS, SEED_SALES, SEED_WALLET);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    localStorage.removeItem("sp_is_logged_in");
    localStorage.removeItem("sp_username");
    localStorage.removeItem("sp_business_name");
    localStorage.removeItem("sp_email");
  };

  const handleResetData = async () => {
    if (confirm("Are you sure you want to load/reset demo dataset (waffle shirts, bags, fans, and transactions)?")) {
      if (supabase && activeUserId) {
        setIsLoadingDB(true);
        try {
          await supabase.from("products").delete().eq("user_id", activeUserId);
          await supabase.from("purchases").delete().eq("user_id", activeUserId);
          await supabase.from("sales").delete().eq("user_id", activeUserId);
          await supabase.from("transactions").delete().eq("user_id", activeUserId);
          
          await seedSupabaseUser(activeUserId);
          await fetchUserData(activeUserId);
          alert("Supabase database tables successfully seeded with demo dataset!");
        } catch (err) {
          console.error("Failed to reset database:", err);
        } finally {
          setIsLoadingDB(false);
        }
      } else {
        saveLocalState(SEED_PRODUCTS, SEED_PURCHASES, SEED_TRANSACTIONS, SEED_SALES, SEED_WALLET);
        alert("Local storage data successfully loaded with demo dataset!");
      }
    }
  };

  // ADD NEW PRODUCT FUNCTION
  const handleAddNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductAddAlert(null);

    if (!newProdName.trim()) {
      setProductAddAlert({ type: "error", msg: "Product name is required." });
      return;
    }

    const cost = parseFloat(newProdCost);
    const selling = newProdSelling ? parseFloat(newProdSelling) : 0;

    if (isNaN(cost) || cost < 0 || isNaN(selling) || selling < 0) {
      setProductAddAlert({ type: "error", msg: "Please enter valid numeric cost and selling prices." });
      return;
    }

    const newProd: Product = {
      id: `p-GH₵{Date.now()}`,
      name: newProdName.trim(),
      category: newProdCategory,
      costPrice: cost,
      sellingPrice: selling,
      image: newProdImage || "📦",
      variants: []
    };

    if (supabase && activeUserId) {
      setIsLoadingDB(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .insert([
            {
              user_id: activeUserId,
              name: newProd.name,
              category: newProd.category,
              cost_price: newProd.costPrice,
              selling_price: newProd.sellingPrice,
              image: newProd.image,
              variants: []
            }
          ])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          await fetchUserData(activeUserId);
          setProductAddAlert({ type: "success", msg: `Successfully added GH₵{newProd.name} to database!` });
          setNewProdName("");
          setNewProdCost("");
          setNewProdSelling("");
          setNewProdImage("📦");
          setTimeout(() => setShowAddProductModal(false), 800);
        }
      } catch (err: any) {
        setProductAddAlert({ type: "error", msg: `DB Error: GH₵{err.message}` });
      } finally {
        setIsLoadingDB(false);
      }
    } else {
      // Local mode
      const updatedProducts = [...products, newProd];
      saveLocalState(updatedProducts, purchases, transactions, sales, wallet);
      setProductAddAlert({ type: "success", msg: `Successfully added GH₵{newProd.name} to local workspace!` });
      setNewProdName("");
      setNewProdCost("");
      setNewProdSelling("");
      setNewProdImage("📦");
      setTimeout(() => setShowAddProductModal(false), 800);
    }
  };

  // INJECT STARTUP CAPITAL FUNDING
  const handleInjectCapital = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletAlert(null);

    const amount = parseFloat(injectAmount);
    if (isNaN(amount) || amount <= 0) {
      setWalletAlert({ type: "error", msg: "Please enter a valid investment funding amount." });
      return;
    }

    const newTx: Transaction = {
      id: `tx-GH₵{Date.now()}`,
      date: new Date().toISOString(),
      type: "Investment",
      description: `Injected GH₵${amount.toLocaleString()} personal startup funding capital.`,
      amount: amount,
      status: "Completed"
    };

    const nextWallet = {
      ...wallet,
      capitalCash: wallet.capitalCash + amount
    };

    if (supabase && activeUserId) {
      setIsLoadingDB(true);
      try {
        const { error: txErr } = await supabase
          .from("transactions")
          .insert([
            {
              user_id: activeUserId,
              type: "Investment",
              description: newTx.description,
              amount: amount,
              status: "Completed"
            }
          ]);
        if (txErr) throw txErr;

        const { error: wErr } = await supabase
          .from("wallets")
          .update({ capital_cash: nextWallet.capitalCash })
          .eq("user_id", activeUserId);
        if (wErr) throw wErr;

        await fetchUserData(activeUserId);
        setWalletAlert({ type: "success", msg: `Successfully injected GH₵${amount.toLocaleString()} capital cash!` });
      } catch (err: any) {
        setWalletAlert({ type: "error", msg: `Database error: GH₵{err.message}` });
      } finally {
        setIsLoadingDB(false);
      }
    } else {
      const updatedTransactions = [newTx, ...transactions];
      saveLocalState(products, purchases, updatedTransactions, sales, nextWallet);
      setWalletAlert({ type: "success", msg: `Injected GH₵${amount.toLocaleString()} capital cash (Local mode).` });
    }

    setInjectAmount("");
  };

  // Toggle Dark Mode
  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem("sp_dark_mode", nextMode ? "true" : "false");
    if (nextMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Bulk Purchase: Parser
  const parseBulkText = () => {
    setIsParsing(true);
    setParsingAlert(null);

    setTimeout(() => {
      try {
        const lines = bulkText.split("\n");
        const list: { color: string; size: string; quantity: number }[] = [];

        lines.forEach((line) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return;

          const parts = trimmedLine.split(":");
          if (parts.length < 2) {
            throw new Error(`Format error on line: "GH₵{trimmedLine}". Expected "Color: Quantity Size, Quantity Size" or "Color: Quantity"`);
          }

          const color = parts[0].trim();
          const itemsString = parts[1].trim();
          const itemParts = itemsString.split(",");

          itemParts.forEach((itemPart) => {
            const rawItem = itemPart.trim();
            if (!rawItem) return;

            // Highly flexible regex: Matches either "10 Large" or just "8" (defaults to "One Size")
            const match = rawItem.match(/^(\d+)(?:\s+(.+))?$/);
            if (!match) {
              throw new Error(`Failed to parse details in: "GH₵{rawItem}" inside line "GH₵{trimmedLine}". Make sure it is e.g. "2 Large" or "10"`);
            }

            const quantity = parseInt(match[1], 10);
            let size = match[2] ? match[2].trim() : "One Size";

            if (size.toLowerCase() === "large") size = "L";
            else if (size.toLowerCase() === "medium") size = "M";
            else if (size.toLowerCase() === "small") size = "S";
            else if (size.toLowerCase() === "xxl" || size.toLowerCase() === "2xl") size = "XXL";
            else if (size.toLowerCase() === "xl") size = "XL";

            list.push({ color, size, quantity });
          });
        });

        if (list.length === 0) {
          throw new Error("No products parsed. Text area is empty or invalid.");
        }

        setParsedItems(list);
        setParsingAlert({
          type: "success",
          msg: `Successfully parsed GH₵{list.reduce((acc, i) => acc + i.quantity, 0)} units across GH₵{list.length} variants!`
        });
      } catch (err: any) {
        setParsingAlert({ type: "error", msg: err.message || "An error occurred during text parsing." });
        setParsedItems([]);
      } finally {
        setIsParsing(false);
      }
    }, 800);
  };

  const handleSaveBulkPurchase = async () => {
    if (!bulkProductSelect) {
      setParsingAlert({ type: "error", msg: "Please select a target product for the bulk purchase restock." });
      return;
    }
    if (!bulkSupplier) {
      setParsingAlert({ type: "error", msg: "Supplier name is required for purchases records." });
      return;
    }
    if (parsedItems.length === 0) {
      setParsingAlert({ type: "error", msg: "No items parsed to save. Run parsing first." });
      return;
    }

    const selectedProduct = products.find((p) => p.id === bulkProductSelect);
    if (!selectedProduct) return;

    const totalQty = parsedItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalCost = totalQty * selectedProduct.costPrice;

    // Prepared updated product variants
    const updatedVariants = [...selectedProduct.variants];
    parsedItems.forEach((parsed) => {
      const variantIndex = updatedVariants.findIndex(
        (v) => v.color.toLowerCase() === parsed.color.toLowerCase() && v.size.toUpperCase() === parsed.size.toUpperCase()
      );

      if (variantIndex > -1) {
        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          quantity: updatedVariants[variantIndex].quantity + parsed.quantity
        };
      } else {
        updatedVariants.push({
          color: parsed.color,
          size: parsed.size,
          quantity: parsed.quantity
        });
      }
    });

    const nextProducts = products.map((p) =>
      p.id === bulkProductSelect ? { ...p, variants: updatedVariants } : p
    );

    const finalAmount = bulkIsInitial ? 0 : -totalCost;
    const finalType = bulkIsInitial ? "Restock" as const : "Purchase" as const;
    const finalDesc = bulkIsInitial 
      ? `Initial Stock Intake of GH₵{selectedProduct.name} (${totalQty} units)`
      : `Bulk purchase Restock of GH₵{selectedProduct.name} (${totalQty} units) from GH₵{bulkSupplier}`;

    // 2. Prepare new records
    const newBatch: PurchaseBatch = {
      id: `pur-GH₵{Date.now()}`,
      supplier: bulkIsInitial ? "Initial Inventory Setup" : bulkSupplier,
      date: new Date().toISOString(),
      totalQuantity: totalQty,
      totalAmount: bulkIsInitial ? 0 : totalCost,
      items: parsedItems.map((p) => ({
        name: selectedProduct.name,
        color: p.color,
        size: p.size,
        quantity: p.quantity,
        costPrice: selectedProduct.costPrice
      }))
    };

    const newTx: Transaction = {
      id: `tx-GH₵{Date.now()}`,
      date: new Date().toISOString(),
      type: finalType,
      description: finalDesc,
      amount: finalAmount,
      status: "Completed"
    };

    const nextWallet = {
      ...wallet,
      capitalCash: wallet.capitalCash + finalAmount
    };

    // 3. Persist State
    if (supabase && activeUserId) {
      setIsLoadingDB(true);
      try {
        const { error: prodErr } = await supabase
          .from("products")
          .update({ variants: updatedVariants })
          .eq("id", bulkProductSelect);
        if (prodErr) throw prodErr;

        const { error: purErr } = await supabase
          .from("purchases")
          .insert([
            {
              user_id: activeUserId,
              supplier: newBatch.supplier,
              total_quantity: totalQty,
              total_amount: newBatch.totalAmount,
              items: newBatch.items
            }
          ]);
        if (purErr) throw purErr;

        const { error: txErr } = await supabase
          .from("transactions")
          .insert([
            {
              user_id: activeUserId,
              type: finalType,
              description: finalDesc,
              amount: finalAmount,
              status: newTx.status
            }
          ]);
        if (txErr) throw txErr;

        const { error: wErr } = await supabase
          .from("wallets")
          .update({ capital_cash: nextWallet.capitalCash })
          .eq("user_id", activeUserId);
        if (wErr) throw wErr;

        await fetchUserData(activeUserId);
        setParsingAlert({
          type: "success",
          msg: "Bulk purchase has been successfully recorded in database!"
        });
      } catch (err: any) {
        setParsingAlert({ type: "error", msg: `Database error: GH₵{err.message}` });
      } finally {
        setIsLoadingDB(false);
      }
    } else {
      const updatedPurchases = [newBatch, ...purchases];
      const updatedTransactions = [newTx, ...transactions];
      saveLocalState(nextProducts, updatedPurchases, updatedTransactions, sales, nextWallet);
      setParsingAlert({
        type: "success",
        msg: "Bulk purchase has been successfully recorded in local cache!"
      });
    }

    setParsedItems([]);
    setBulkText("");
    setBulkSupplier("");
    setBulkIsInitial(false);
  };

  // Record Sale Flow
  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaleAlert(null);

    if (!saleProductSelect || !saleColorSelect || !saleSizeSelect) {
      setSaleAlert({ type: "error", msg: "Please select product, color, and size options before recording a sale." });
      return;
    }

    const selectedProduct = products.find((p) => p.id === saleProductSelect);
    if (!selectedProduct) return;

    const variantIndex = selectedProduct.variants.findIndex(
      (v) => v.color === saleColorSelect && v.size === saleSizeSelect
    );

    if (variantIndex === -1) {
      setSaleAlert({ type: "error", msg: "Selected color/size variant not found." });
      return;
    }

    const availableStock = selectedProduct.variants[variantIndex].quantity;
    if (saleQtyInput <= 0) {
      setSaleAlert({ type: "error", msg: "Quantity must be greater than zero." });
      return;
    }
    if (saleQtyInput > availableStock) {
      setSaleAlert({ type: "error", msg: `Requested GH₵{saleQtyInput} units, but only GH₵{availableStock} are available in stock.` });
      return;
    }

    const price = parseFloat(salePriceInput);
    if (isNaN(price) || price < 0) {
      setSaleAlert({ type: "error", msg: "Please enter a valid selling price." });
      return;
    }

    const revenue = saleQtyInput * price;
    const cost = saleQtyInput * selectedProduct.costPrice;
    const profit = revenue - cost;

    const nextVariants = [...selectedProduct.variants];
    nextVariants[variantIndex] = {
      ...nextVariants[variantIndex],
      quantity: nextVariants[variantIndex].quantity - saleQtyInput
    };
    const nextProducts = products.map((p) =>
      p.id === selectedProduct.id ? { ...p, variants: nextVariants } : p
    );

    const newSaleObj: Sale = {
      id: `sale-GH₵{Date.now()}`,
      date: new Date().toISOString(),
      productName: selectedProduct.name,
      color: saleColorSelect,
      size: saleSizeSelect,
      quantity: saleQtyInput,
      sellingPrice: price,
      costPrice: selectedProduct.costPrice,
      customerName: saleCustomerName.trim() || "Walk-in Customer",
      revenue,
      cost,
      profit
    };

    const newTx: Transaction = {
      id: `tx-GH₵{Date.now()}`,
      date: new Date().toISOString(),
      type: "Sale",
      description: `Sold GH₵{saleQtyInput}x GH₵{selectedProduct.name} (${saleColorSelect} - GH₵{saleSizeSelect}) to GH₵{saleCustomerName.trim() || "Walk-in Customer"}`,
      amount: revenue,
      status: "Completed",
      profit,
      cost
    };

    const nextWallet = {
      ...wallet,
      capitalCash: wallet.capitalCash + cost,
      profitWallet: wallet.profitWallet + profit
    };

    if (supabase && activeUserId) {
      setIsLoadingDB(true);
      try {
        const { error: prodErr } = await supabase
          .from("products")
          .update({ variants: nextVariants })
          .eq("id", selectedProduct.id);
        if (prodErr) throw prodErr;

        const { error: sErr } = await supabase
          .from("sales")
          .insert([
            {
              user_id: activeUserId,
              product_name: selectedProduct.name,
              color: saleColorSelect,
              size: saleSizeSelect,
              quantity: saleQtyInput,
              selling_price: price,
              cost_price: selectedProduct.costPrice,
              customer_name: newSaleObj.customerName,
              revenue,
              cost,
              profit
            }
          ]);
        if (sErr) throw sErr;

        const { error: txErr } = await supabase
          .from("transactions")
          .insert([
            {
              user_id: activeUserId,
              type: "Sale",
              description: newTx.description,
              amount: revenue,
              status: newTx.status,
              profit,
              cost
            }
          ]);
        if (txErr) throw txErr;

        const { error: wErr } = await supabase
          .from("wallets")
          .update({
            capital_cash: nextWallet.capitalCash,
            profit_wallet: nextWallet.profitWallet
          })
          .eq("user_id", activeUserId);
        if (wErr) throw wErr;

        await fetchUserData(activeUserId);
        setSaleAlert({
          type: "success",
          msg: `Successfully logged sale for GH₵{saleQtyInput} unit(s). Total Profit: GH₵${profit.toFixed(2)}.`
        });
      } catch (err: any) {
        setSaleAlert({ type: "error", msg: `Database syncing error: GH₵{err.message}` });
      } finally {
        setIsLoadingDB(false);
      }
    } else {
      const updatedSales = [newSaleObj, ...sales];
      const updatedTransactions = [newTx, ...transactions];
      saveLocalState(nextProducts, purchases, updatedTransactions, updatedSales, nextWallet);
      setSaleAlert({
        type: "success",
        msg: `Logged sale to local cache for GH₵{saleQtyInput} unit(s). Profit: GH₵${profit.toFixed(2)}.`
      });
    }

    setSaleQtyInput(1);
    setSaleCustomerName("");
    setSaleColorSelect("");
    setSaleSizeSelect("");
  };

  // Wallet Transfers
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletAlert(null);

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWalletAlert({ type: "error", msg: "Please enter a valid withdrawal amount." });
      return;
    }

    if (amount > wallet.profitWallet) {
      setWalletAlert({
        type: "error",
        msg: `Insufficient profit funds! You only have GH₵${wallet.profitWallet.toLocaleString()} in your profit wallet.`
      });
      return;
    }

    const newTx: Transaction = {
      id: `tx-GH₵{Date.now()}`,
      date: new Date().toISOString(),
      type: "Withdrawal",
      description: `Profit withdrawal to bank account (${withdrawBank || "Default Biz Account"})`,
      amount: -amount,
      status: "Completed"
    };

    const nextWallet = {
      ...wallet,
      profitWallet: wallet.profitWallet - amount,
      profitWithdrawn: wallet.profitWithdrawn + amount
    };

    if (supabase && activeUserId) {
      setIsLoadingDB(true);
      try {
        const { error: txErr } = await supabase
          .from("transactions")
          .insert([
            {
              user_id: activeUserId,
              type: "Withdrawal",
              description: newTx.description,
              amount: -amount,
              status: "Completed"
            }
          ]);
        if (txErr) throw txErr;

        const { error: wErr } = await supabase
          .from("wallets")
          .update({
            profit_wallet: nextWallet.profitWallet,
            profit_withdrawn: nextWallet.profitWithdrawn
          })
          .eq("user_id", activeUserId);
        if (wErr) throw wErr;

        await fetchUserData(activeUserId);
        setWalletAlert({ type: "success", msg: `Successfully withdrew GH₵${amount.toLocaleString()} from profits.` });
      } catch (err: any) {
        setWalletAlert({ type: "error", msg: `Database error: GH₵{err.message}` });
      } finally {
        setIsLoadingDB(false);
      }
    } else {
      const updatedTransactions = [newTx, ...transactions];
      saveLocalState(products, purchases, updatedTransactions, sales, nextWallet);
      setWalletAlert({
        type: "success",
        msg: `Withdrew GH₵${amount.toLocaleString()} to bank (Local mode).`
      });
    }

    setWithdrawAmount("");
    setWithdrawBank("");
  };

  const handleReinvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletAlert(null);

    const amount = parseFloat(reinvestAmount);
    if (isNaN(amount) || amount <= 0) {
      setWalletAlert({ type: "error", msg: "Please enter a valid reinvestment amount." });
      return;
    }

    if (amount > wallet.profitWallet) {
      setWalletAlert({
        type: "error",
        msg: `Insufficient profit funds! You only have GH₵${wallet.profitWallet.toLocaleString()} in your profit wallet to reinvest.`
      });
      return;
    }

    const newTx: Transaction = {
      id: `tx-GH₵{Date.now()}`,
      date: new Date().toISOString(),
      type: "Profit Reinvestment",
      description: `Reinvested GH₵${amount} from profits into business capital cash.`,
      amount: amount,
      status: "Completed"
    };

    const nextWallet = {
      ...wallet,
      profitWallet: wallet.profitWallet - amount,
      capitalCash: wallet.capitalCash + amount,
      profitReinvested: wallet.profitReinvested + amount
    };

    if (supabase && activeUserId) {
      setIsLoadingDB(true);
      try {
        const { error: txErr } = await supabase
          .from("transactions")
          .insert([
            {
              user_id: activeUserId,
              type: "Profit Reinvestment",
              description: newTx.description,
              amount: amount,
              status: "Completed"
            }
          ]);
        if (txErr) throw txErr;

        const { error: wErr } = await supabase
          .from("wallets")
          .update({
            capital_cash: nextWallet.capitalCash,
            profit_wallet: nextWallet.profitWallet,
            profit_reinvested: nextWallet.profitReinvested
          })
          .eq("user_id", activeUserId);
        if (wErr) throw wErr;

        await fetchUserData(activeUserId);
        setWalletAlert({ type: "success", msg: `Successfully reinvested GH₵${amount.toLocaleString()} into Capital Cash.` });
      } catch (err: any) {
        setWalletAlert({ type: "error", msg: `Database error: GH₵{err.message}` });
      } finally {
        setIsLoadingDB(false);
      }
    } else {
      const updatedTransactions = [newTx, ...transactions];
      saveLocalState(products, purchases, updatedTransactions, sales, nextWallet);
      setWalletAlert({
        type: "success",
        msg: `Reinvested GH₵${amount.toLocaleString()} (Local mode).`
      });
    }

    setReinvestAmount("");
  };

  // ==========================================
  // VIEW RENDERERS
  // ==========================================

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCategory = inventoryCategory === "All" || prod.category === inventoryCategory;
      const matchSearch =
        prod.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        prod.category.toLowerCase().includes(inventorySearch.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, inventoryCategory, inventorySearch]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(txSearch.toLowerCase()) ||
        tx.type.toLowerCase().includes(txSearch.toLowerCase());
      const matchesType = txFilter === "All" || tx.type === txFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, txSearch, txFilter]);

  const chartData = useMemo(() => {
    const dates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    const labelNames = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    });

    const values = dates.map((dateStr) => {
      if (activeReportMetric === "revenue") {
        return sales.reduce((acc, sale) => {
          const sDate = sale.date.split("T")[0];
          return sDate === dateStr ? acc + sale.revenue : acc;
        }, 0);
      } else if (activeReportMetric === "profit") {
        return sales.reduce((acc, sale) => {
          const sDate = sale.date.split("T")[0];
          return sDate === dateStr ? acc + sale.profit : acc;
        }, 0);
      } else if (activeReportMetric === "cogs") {
        return sales.reduce((acc, sale) => {
          const sDate = sale.date.split("T")[0];
          return sDate === dateStr ? acc + (sale.cost || 0) : acc;
        }, 0);
      } else if (activeReportMetric === "inventory") {
        const scaleFactors = [0.85, 0.9, 0.88, 0.95, 1.1, 1.05, 1.0];
        const dayIdx = dates.indexOf(dateStr);
        return dynamicInventoryValue * (scaleFactors[dayIdx] || 1.0);
      } else {
        const scaleFactors = [0.75, 0.8, 0.82, 0.88, 0.92, 0.96, 1.0];
        const dayIdx = dates.indexOf(dateStr);
        return (wallet.capitalCash + wallet.profitWallet) * (scaleFactors[dayIdx] || 1.0);
      }
    });

    return { labels: labelNames, values };
  }, [sales, activeReportMetric, dynamicInventoryValue, wallet.capitalCash, wallet.profitWallet]);

  const svgChartPoints = useMemo(() => {
    const values = chartData.values;
    const maxVal = Math.max(...values, 100);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;

    const width = 500;
    const height = 150;
    const padding = 20;

    const points = values.map((val, idx) => {
      const x = padding + (idx * (width - 2 * padding)) / (values.length - 1);
      const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
      return { x, y, value: val, label: chartData.labels[idx] };
    });

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} GH₵{p.x} GH₵{p.y}`).join(" ");
    const fillPath =
      points.length > 0
        ? `${linePath} L GH₵{points[points.length - 1].x} GH₵{height - padding} L GH₵{points[0].x} GH₵{height - padding} Z`
        : "";

    return { points, linePath, fillPath, maxVal, minVal };
  }, [chartData]);

  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f7f9fb] dark:bg-[#090d16]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-label-md font-medium text-on-surface-variant">Stitching Retail OS Workspace...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: LOGIN / REGISTRATION
  // ==========================================

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#f7f9fb] dark:bg-[#090d16] text-[#191c1e] dark:text-[#f1f5f9] transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-5xl bg-surface-lowest dark:bg-surface-lowest grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden premium-shadow-lg border border-outline-variant/30"
        >
          
          {/* Left panel */}
          <div className="md:col-span-5 bg-gradient-to-br from-primary/90 to-primary p-8 md:p-12 flex flex-col justify-between text-white select-none">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-[32px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                  grid_view
                </span>
                <span className="font-display font-bold text-headline-lg leading-tight tracking-tight">
                  Stitch Prism
                </span>
              </div>
              <h2 className="text-2xl font-bold font-headline-lg mb-4 text-white/90">
                A simple, elegant operating system for your boutique business.
              </h2>
              <p className="text-white/70 font-body-md text-sm leading-relaxed mb-6">
                Manage stock, auto-parse bulk shipments, record sales with live margin calculations, and trace financial portfolios with Notion simplicity and Stripe metrics.
              </p>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="material-symbols-outlined text-white">bolt</span>
                <div className="text-xs">
                  <p className="font-bold">Lightning Fast Parsing</p>
                  <p className="text-white/70">Paste shipping manifests directly.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                <span className="material-symbols-outlined text-white">wallet</span>
                <div className="text-xs">
                  <p className="font-bold">Consolidated FinTech Ledger</p>
                  <p className="text-white/70">Capital, profits, and stock worth in one view.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-8">
                <h3 className="text-2xl font-bold font-headline-lg mb-1 tracking-tight text-on-surface">
                  {authView === "login" 
                    ? "Welcome back" 
                    : authView === "register" 
                      ? "Create business account"
                      : authView === "forgot"
                        ? "Reset your password"
                        : "Enter new password"}
                </h3>
                <p className="text-sm text-on-surface-variant font-body-md">
                  {authView === "forgot"
                    ? "We will send instructions to verify and reset your credentials."
                    : authView === "reset-password"
                      ? "Choose a strong password to protect your retail OS catalog."
                      : isDbConnected 
                        ? "Connect using your Supabase cloud credentials."
                        : "Running locally via browser local storage cache."}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {authView === "register" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                        Workspace / Owner Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-sm outline-none transition-all text-on-surface"
                        placeholder="Alex Sterling"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                        Boutique / Brand Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-sm outline-none transition-all text-on-surface"
                        placeholder="Stitch & Prism Co."
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {(authView === "login" || authView === "register" || authView === "forgot") && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-sm outline-none transition-all text-on-surface"
                      placeholder="owner@brand.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}

                {(authView === "login" || authView === "register") && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-outline">
                        Password
                      </label>
                      {authView === "login" && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthView("forgot");
                            setAuthAlert(null);
                          }}
                          className="text-xs text-primary hover:underline font-semibold"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-sm outline-none transition-all text-on-surface"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 select-none flex items-center justify-center"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {authView === "reset-password" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-sm outline-none transition-all text-on-surface"
                        placeholder="New Password (min 6 chars)"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-sm outline-none transition-all text-on-surface"
                        placeholder="Confirm Password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {authAlert && (
                  <div className={`p-3.5 rounded-2xl text-xs flex items-start gap-2 border GH₵{
                    authAlert.type === "success" 
                      ? "bg-success-container/10 border-success/20 text-success" 
                      : authAlert.type === "info"
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-error-container/10 border-error/20 text-error"
                  }`}>
                    <span className="material-symbols-outlined text-[16px] mt-0.5">
                      {authAlert.type === "success" ? "check_circle" : authAlert.type === "info" ? "info" : "error"}
                    </span>
                    <p className="font-semibold">{authAlert.msg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3 mt-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : authView === "login" ? (
                    "Sign In to OS"
                  ) : authView === "register" ? (
                    "Setup Workspace"
                  ) : authView === "forgot" ? (
                    "Send Reset Link"
                  ) : (
                    "Update Password"
                  )}
                  {!isAuthenticating && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                </button>
              </form>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/30"></div>
                </div>
                <span className="relative bg-surface-lowest px-3 text-xs text-outline font-semibold">
                  OR PREVIEW SYSTEM
                </span>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-3 rounded-xl border border-outline-variant/80 hover:bg-surface-low/50 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  explore
                </span>
                Launch with seeded local dataset
              </button>

              <div className="mt-8 text-center">
                {authView === "forgot" || authView === "reset-password" ? (
                  <button
                    onClick={() => {
                      setAuthView("login");
                      setAuthAlert(null);
                    }}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAuthView(authView === "login" ? "register" : "login");
                      setAuthAlert(null);
                    }}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    {authView === "login"
                      ? "Don't have an account? Register your boutique"
                      : "Already have a boutique workspace? Log in here"}
                  </button>
                )}
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-background text-on-background">
      
      {/* ==========================================
          SIDE NAV: DESKTOP
          ========================================== */}
      <aside className="w-64 bg-surface-lowest dark:bg-[#0c101b] border-r border-outline-variant/30 flex-shrink-0 flex flex-col justify-between hidden lg:flex premium-shadow animate-fade-in">
        
        {/* Top Header */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white premium-shadow">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                grid_view
              </span>
            </div>
            <div>
              <h1 className="font-display font-bold text-base leading-tight tracking-tight text-on-surface">
                Stitch Prism
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-outline">
                {isDbConnected ? "Supabase Cloud" : "Local Retail OS"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-surface-low/80 dark:bg-surface-low/20 p-3 rounded-2xl border border-outline-variant/30 select-none">
            <div className="w-9 h-9 rounded-full bg-secondary-container/50 flex items-center justify-center font-bold text-primary font-display text-sm">
              {username[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-on-surface truncate">{username}</p>
              <p className="text-[10px] text-outline font-medium truncate">{businessName}</p>
            </div>
          </div>
        </div>

        {/* Mid Navigation Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setParsingAlert(null);
                  setSaleAlert(null);
                  setWalletAlert(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative GH₵{
                  isActive
                    ? "text-primary bg-primary/10 border-l-4 border-primary"
                    : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] GH₵{isActive ? "text-primary" : "text-outline"}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="p-4 border-t border-outline-variant/20 space-y-2">
          
          {isDbConnected && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl text-[10px] bg-success-container/10 border border-success/20 text-success mb-2 select-none">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse inline-block"></span>
                <span>DB Cloud Synced</span>
              </div>
              {isLoadingDB && (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border border-success border-t-transparent"></div>
              )}
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold bg-surface-low/60 hover:bg-surface-low border border-outline-variant/30 text-on-surface transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                {darkMode ? "dark_mode" : "light_mode"}
              </span>
              <span>{darkMode ? "Dark Theme" : "Light Theme"}</span>
            </div>
            <div className="w-8 h-4 rounded-full bg-outline-variant/50 relative flex items-center p-0.5 transition-all">
              <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 GH₵{darkMode ? "translate-x-3.5" : "translate-x-0"}`}></div>
            </div>
          </button>

          <button
            onClick={handleResetData}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-warning hover:bg-warning-container/20 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            Load Demo Data
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-error hover:bg-error-container/10 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Exit Workplace
          </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN AREA SHELL
          ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="h-16 border-b border-outline-variant/30 bg-surface-lowest dark:bg-[#0c101b] px-4 flex items-center justify-between lg:hidden flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-9 h-9 rounded-xl hover:bg-surface-low border border-outline-variant/30 flex items-center justify-center text-on-surface mr-1"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <span className="material-symbols-outlined text-primary text-[24px]">grid_view</span>
            <span className="font-display font-bold text-sm tracking-tight text-on-surface truncate">
              {businessName}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isLoadingDB && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-1"></div>
            )}
            
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-surface-low border border-outline-variant/30 flex items-center justify-center text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">
                {darkMode ? "dark_mode" : "light_mode"}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full hover:bg-error-container/20 flex items-center justify-center text-error"
              title="Log Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 select-text">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="w-full space-y-8 pb-10"
            >
          
          {/* ==========================================
              TAB 1: DASHBOARD
              ========================================== */}
          {currentTab === "dashboard" && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-headline-lg tracking-tight text-on-surface">
                    Workspace Summary
                  </h2>
                  <p className="text-sm text-on-surface-variant font-body-md">
                    Here is a visual analytics brief of your boutique business.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-4 py-2 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Create Product
                  </button>
                  <button
                    onClick={() => setCurrentTab("sales")}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-all premium-shadow active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">payments</span>
                    New Sale
                  </button>
                </div>
              </div>

              {/* Stat Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* 1. Business Worth */}
                <div className="bg-gradient-to-br from-primary to-primary-hover text-white p-5 rounded-2xl premium-shadow-lg flex flex-col justify-between h-32 select-none relative overflow-hidden">
                  <div className="absolute right-[-10px] top-[-10px] opacity-10">
                    <span className="material-symbols-outlined text-[96px]">finance</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Business Worth</span>
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Portfolio Valuation</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display tracking-tight leading-none">
                      GH₵{dynamicBusinessWorth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[10px] text-white/60 mt-1">Capital + Profit Wallet + Inventory Assets</p>
                  </div>
                </div>

                {/* 2. Inventory Value */}
                <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 premium-shadow flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-outline uppercase tracking-wider">Inventory Value</span>
                    <span className="bg-success-container/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">At Cost</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display tracking-tight leading-none text-on-surface">
                      GH₵{dynamicInventoryValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant mt-1">Total items in warehouse: {totalProductsInStock}</p>
                  </div>
                </div>

                {/* 3. Capital Cash */}
                <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 premium-shadow flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-outline uppercase tracking-wider">Capital Cash</span>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">Purchase Funds</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display tracking-tight leading-none text-on-surface">
                      GH₵{wallet.capitalCash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant mt-1">Cash reserved for bulk stock manifests</p>
                  </div>
                </div>

                {/* 4. Profit Wallet */}
                <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 premium-shadow flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-outline uppercase tracking-wider">Profit Wallet</span>
                    <span className="bg-success-container text-on-success-container text-[10px] font-bold px-2 py-0.5 rounded-full">Net Margin</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display tracking-tight leading-none text-on-surface">
                      GH₵{wallet.profitWallet.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant mt-1">Available for withdrawals/reinvestments</p>
                  </div>
                </div>

                {/* 5. Cash Available */}
                <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 premium-shadow flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-outline uppercase tracking-wider">Cash Available</span>
                    <span className="bg-outline-variant/30 text-on-surface text-[10px] font-bold px-2 py-0.5 rounded-full">Liquid Capital</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display tracking-tight leading-none text-on-surface">
                      GH₵{(wallet.capitalCash + wallet.profitWallet).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant mt-1">Sum of Capital Cash and Profit Wallet</p>
                  </div>
                </div>

                {/* 6. Products In Stock */}
                <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 premium-shadow flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-outline uppercase tracking-wider">Stock Units</span>
                    <span className="bg-warning-container text-on-warning-container text-[10px] font-bold px-2 py-0.5 rounded-full">Warehouse count</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display tracking-tight leading-none text-on-surface">
                      {totalProductsInStock}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant mt-1">Unique item categories tracked: {products.length}</p>
                  </div>
                </div>

                {/* 7. Products Sold */}
                <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 premium-shadow flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-outline uppercase tracking-wider">Products Sold</span>
                    <span className="bg-outline-variant/30 text-on-surface text-[10px] font-bold px-2 py-0.5 rounded-full">Life-time</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display tracking-tight leading-none text-on-surface">
                      {totalProductsSold} <span className="text-xs font-normal text-outline">units</span>
                    </h3>
                    <div className="text-[9px] text-on-surface-variant mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 font-medium border-t border-outline-variant/20 pt-1.5">
                      <span>Cost: <strong className="text-on-surface font-semibold">GH₵{totalSalesCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></span>
                      <span className="text-outline-variant/60">|</span>
                      <span>Rev: <strong className="text-success font-semibold">GH₵{totalSalesRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></span>
                    </div>
                  </div>
                </div>

                {/* 8. Revenue Today */}
                <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 premium-shadow flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-outline uppercase tracking-wider">Revenue Today</span>
                    <span className="text-xs text-primary font-bold">24hr brief</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display tracking-tight leading-none text-on-surface">
                      GH₵{dailyMetrics.revenueToday.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant mt-1">Gross sales completed today</p>
                  </div>
                </div>

                {/* 9. Profit Today */}
                <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 premium-shadow flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-outline uppercase tracking-wider">Profit Today</span>
                    <span className="bg-success-container/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">Net Margin</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display tracking-tight leading-none text-on-surface">
                      GH₵{dailyMetrics.profitToday.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant mt-1">Real-time daily net margin earned</p>
                  </div>
                </div>

              </div>

              {/* Feed Splits */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Recent Sales */}
                <div className="lg:col-span-8 bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      Recent Sales Log
                    </h4>
                    <button
                      onClick={() => setCurrentTab("transactions")}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      View Ledger
                    </button>
                  </div>
                  
                  {sales.length === 0 ? (
                    <div className="py-12 text-center text-outline text-xs border border-dashed border-outline-variant/30 rounded-2xl">
                      No sales recorded in database yet. Go to New Sale tab or load Seed Data.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-outline-variant/30 text-outline">
                            <th className="py-2.5">Date</th>
                            <th className="py-2.5">Product</th>
                            <th className="py-2.5">Customer</th>
                            <th className="py-2.5 text-right">Cost (COGS)</th>
                            <th className="py-2.5 text-right">Revenue</th>
                            <th className="py-2.5 text-right">Net Profit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                          {sales.slice(0, 5).map((sale) => (
                            <tr key={sale.id} className="hover:bg-surface-low/30 transition-colors">
                              <td className="py-3 text-outline">
                                {new Date(sale.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </td>
                              <td className="py-3 font-semibold text-on-surface">
                                {sale.productName} <span className="text-[10px] text-outline font-normal">({sale.color} / {sale.size})</span>
                              </td>
                              <td className="py-3 text-on-surface-variant">{sale.customerName}</td>
                              <td className="py-3 text-right font-medium text-on-surface-variant">GH₵{sale.cost.toFixed(2)}</td>
                              <td className="py-3 text-right font-medium text-on-surface">GH₵{sale.revenue.toFixed(2)}</td>
                              <td className="py-3 text-right">
                                <span className="bg-success-container/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  +GH₵{sale.profit.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Restock Alerts */}
                  <div className="mt-8 border-t border-outline-variant/20 pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-warning text-[18px]">warning</span>
                      Inventory Stock Alerts
                    </h4>
                    
                    <div className="space-y-2">
                      {products.map((prod) => {
                        const lowStockVariants = prod.variants.filter((v) => v.quantity <= 3);
                        if (lowStockVariants.length === 0) return null;
                        
                        return (
                          <div key={prod.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-warning-container/10 border border-warning/10 text-xs gap-2">
                            <div>
                              <span className="font-semibold text-on-surface">{prod.name}</span>
                              <span className="text-outline ml-2">({prod.category})</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {lowStockVariants.map((v, idx) => (
                                <span key={idx} className="bg-warning-container text-on-warning-container px-2 py-0.5 rounded-full font-bold text-[10px]">
                                  {v.color} - {v.size}: {v.quantity} Left
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      }).filter(Boolean).length === 0 && (
                        <p className="text-xs text-success font-medium">All item variants are currently healthy and well-stocked.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Column: Quick Action Dashboard Panels */}
                <div className="lg:col-span-4 space-y-6">
                  
                  <div className="bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-4">
                      OS Quick Actions
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setCurrentTab("sales")}
                        className="p-3 bg-surface-low hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/20 flex flex-col items-center justify-center rounded-2xl border border-outline-variant/20 transition-all text-center select-none"
                      >
                        <span className="material-symbols-outlined text-[24px] text-primary mb-2">payments</span>
                        <span className="text-xs font-bold">Record Sale</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab("bulk-purchase")}
                        className="p-3 bg-surface-low hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/20 flex flex-col items-center justify-center rounded-2xl border border-outline-variant/20 transition-all text-center select-none"
                      >
                        <span className="material-symbols-outlined text-[24px] text-primary mb-2">add_shopping_cart</span>
                        <span className="text-xs font-bold">Bulk Intake</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab("wallet")}
                        className="p-3 bg-surface-low hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/20 flex flex-col items-center justify-center rounded-2xl border border-outline-variant/20 transition-all text-center select-none"
                      >
                        <span className="material-symbols-outlined text-[24px] text-primary mb-2">account_balance_wallet</span>
                        <span className="text-xs font-bold">Capital/Wallet</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab("reports")}
                        className="p-3 bg-surface-low hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/20 flex flex-col items-center justify-center rounded-2xl border border-outline-variant/20 transition-all text-center select-none"
                      >
                        <span className="material-symbols-outlined text-[24px] text-primary mb-2">analytics</span>
                        <span className="text-xs font-bold">View Charts</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                        Purchase Batches
                      </h4>
                      <button
                        onClick={() => setCurrentTab("purchases")}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Timeline
                      </button>
                    </div>

                    <div className="space-y-4">
                      {purchases.slice(0, 3).map((pur) => (
                        <div key={pur.id} className="flex items-start gap-3 border-l-2 border-primary/30 pl-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-on-surface truncate">{pur.supplier}</p>
                            <p className="text-[10px] text-outline">
                              {new Date(pur.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-on-surface">GH₵{pur.totalAmount.toLocaleString()}</p>
                            <p className="text-[10px] text-outline font-medium">{pur.totalQuantity} items</p>
                          </div>
                        </div>
                      ))}
                      {purchases.length === 0 && (
                        <p className="text-xs text-outline py-4 text-center">No restock purchases recorded.</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB 3: INVENTORY
              ========================================== */}
          {currentTab === "inventory" && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-headline-lg tracking-tight text-on-surface">
                    Boutique Inventory
                  </h2>
                  <p className="text-sm text-on-surface-variant font-body-md">
                    Click any product row to view the detailed quantity breakdown by color and size.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-4 py-2 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Product
                  </button>
                  <button
                    onClick={() => setCurrentTab("bulk-purchase")}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-all premium-shadow active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                    Bulk Manifest Entry
                  </button>
                </div>
              </div>

              {/* Filters & Search Panel */}
              <div className="bg-surface-lowest dark:bg-surface-lowest p-4 rounded-2xl border border-outline-variant/30 premium-shadow flex flex-col md:flex-row gap-4 items-center justify-between">
                
                <div className="w-full md:w-80 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
                    placeholder="Search product SKU, categories..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  {["All", "Clothing", "Accessories", "Electronics", "Home Goods", "Other"].map((cat) => {
                    const isSelected = inventoryCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setInventoryCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all GH₵{
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-surface-low text-on-surface-variant border border-outline-variant/35 hover:bg-outline-variant/20"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-surface-lowest dark:bg-surface-lowest rounded-3xl border border-outline-variant/30 overflow-hidden premium-shadow">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs select-none">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-outline uppercase tracking-wider font-semibold text-[10px]">
                        <th className="p-4 w-12 text-center">Icon</th>
                        <th className="p-4">Product Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4 text-center">Available Stock</th>
                        <th className="p-4 text-right">Cost Price</th>
                        <th className="p-4 text-right">Selling Price</th>
                        <th className="p-4 text-right">Inventory Worth</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {filteredProducts.map((prod) => {
                        const totalQty = prod.variants.reduce((acc, v) => acc + v.quantity, 0);
                        const isExpanded = expandedProduct === prod.id;
                        const worthVal = totalQty * prod.costPrice;

                        return (
                          <React.Fragment key={prod.id}>
                            <tr
                              onClick={() => setExpandedProduct(isExpanded ? null : prod.id)}
                              className="hover:bg-surface-low/30 cursor-pointer transition-colors active:bg-surface-low"
                            >
                              <td className="p-4 text-center text-lg">{prod.image}</td>
                              <td className="p-4 font-bold text-on-surface text-sm">
                                {prod.name}
                              </td>
                              <td className="p-4 text-outline font-medium">{prod.category}</td>
                              <td className="p-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] GH₵{
                                  totalQty <= 3 
                                    ? "bg-error-container text-on-error-container"
                                    : totalQty <= 8 
                                      ? "bg-warning-container text-on-warning-container" 
                                      : "bg-success-container/10 text-success"
                                }`}>
                                  {totalQty} Units
                                </span>
                              </td>
                              <td className="p-4 text-right font-medium text-on-surface-variant">GH₵{prod.costPrice.toFixed(2)}</td>
                              <td className="p-4 text-right font-bold text-on-surface">GH₵{prod.sellingPrice.toFixed(2)}</td>
                              <td className="p-4 text-right font-bold text-primary">GH₵{worthVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="p-4 text-center">
                                <button className="p-1 rounded-full hover:bg-surface-low/80 text-outline hover:text-on-surface">
                                  <span className="material-symbols-outlined text-[20px] transition-transform duration-200" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                                    expand_more
                                  </span>
                                </button>
                              </td>
                            </tr>

                            {/* Accordion detail variants list */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={8} className="bg-surface-low/30 dark:bg-surface-low/10 p-5 border-t border-b border-outline-variant/20">
                                  <div className="max-w-2xl">
                                    <div className="flex items-center justify-between mb-3 border-b border-outline-variant/30 pb-2">
                                      <h5 className="text-[10px] uppercase font-bold text-outline tracking-wider">
                                        Color & Size Breakdown for {prod.name}
                                      </h5>
                                      <span className="text-[10px] font-bold text-primary">
                                        Total variants tracked: {prod.variants.length}
                                      </span>
                                    </div>
                                    
                                    {prod.variants.length === 0 ? (
                                      <div className="py-4 text-center text-outline text-xs">
                                        No variant stock records created yet. Use Bulk Purchase to manifest new quantities.
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {prod.variants.map((v, vIdx) => {
                                          const isLow = v.quantity <= 3;
                                          return (
                                            <div
                                              key={vIdx}
                                              className="p-3 bg-surface-lowest dark:bg-[#121620] border border-outline-variant/20 rounded-2xl flex items-center justify-between premium-shadow-sm"
                                            >
                                              <div>
                                                <p className="font-bold text-on-surface text-xs">{v.color}</p>
                                                <p className="text-[10px] text-outline">Size: {v.size}</p>
                                              </div>
                                              <div className="text-right">
                                                <p className={`font-display font-bold text-xs GH₵{isLow ? "text-error" : "text-on-surface"}`}>
                                                  {v.quantity} available
                                                </p>
                                                <p className="text-[9px] text-outline">Cost: GH₵{(v.quantity * prod.costPrice).toFixed(2)}</p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Action links */}
                                    <div className="flex items-center gap-3 mt-4 justify-end">
                                      <button
                                        onClick={() => {
                                          setSaleProductSelect(prod.id);
                                          setCurrentTab("sales");
                                        }}
                                        className="px-3.5 py-1.5 rounded-xl border border-outline-variant/80 text-on-surface text-xs font-semibold hover:bg-surface-low transition-all active:scale-[0.98]"
                                      >
                                        Log a Sale
                                      </button>
                                      <button
                                        onClick={() => {
                                          setBulkProductSelect(prod.id);
                                          setCurrentTab("bulk-purchase");
                                        }}
                                        className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-all active:scale-[0.98]"
                                      >
                                        Restock manifest
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-outline text-xs">
                            No products found matching filters. Create your first product to begin tracking assets.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 4: BULK PURCHASE PAGE
              ========================================== */}
          {currentTab === "bulk-purchase" && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-headline-lg tracking-tight text-on-surface">
                    Bulk Manifest Intake
                  </h2>
                  <p className="text-sm text-on-surface-variant font-body-md">
                    Intake large quantities of product inventory instantly using copy-pasted delivery sheets.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-all premium-shadow active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Create Product
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Text entry panel */}
                <div className="lg:col-span-6 bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow space-y-4">
                  <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-2">
                    Enter Manifest Details
                  </h4>

                  {/* 1. Target Product */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                      Choose Restock Product
                    </label>
                    <select
                      className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none transition-all text-on-surface"
                      value={bulkProductSelect}
                      onChange={(e) => {
                        setBulkProductSelect(e.target.value);
                        setParsedItems([]);
                        setParsingAlert(null);
                      }}
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.image} {p.name} (Cost: GH₵{p.costPrice.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Supplier Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                      Wholesale Supplier Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none transition-all text-on-surface"
                      placeholder="Apex Apparel Wholesale Ltd."
                      value={bulkSupplier}
                      onChange={(e) => setBulkSupplier(e.target.value)}
                    />
                  </div>

                  {/* 3. Text manifest */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-outline">
                        Manifest Stock List
                      </label>
                      <button
                        onClick={() => setBulkText("Navy Blue: 4 Large, 6 XL, 3 XXL\nObsidian Black: 5 Large, 3 XL\nHeather Grey: 2 Medium, 5 Large")}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        Load Clothing Sample
                      </button>
                      <span className="text-outline text-[9px]">|</span>
                      <button
                        onClick={() => setBulkText("Sage Green: 10\nPolar White: 15\nSlate Blue: 12")}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        Load Accessories Sample
                      </button>
                    </div>
                    
                    <textarea
                      rows={6}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs font-mono outline-none transition-all text-on-surface"
                      placeholder="Color Name: Quantity Size, Quantity Size&#10;Or for accessories:&#10;Color Name: Quantity&#10;Example:&#10;Midnight Black: 15"
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={parseBulkText}
                      disabled={isParsing || !bulkText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-outline-variant/30 hover:bg-outline-variant/50 text-on-surface text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                      Parse Manifest Text
                    </button>
                  </div>

                  {parsingAlert && (
                    <div className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 border GH₵{
                      parsingAlert.type === "success" 
                        ? "bg-success-container/10 border-success/20 text-success" 
                        : "bg-error-container/10 border-error/20 text-error"
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {parsingAlert.type === "success" ? "check_circle" : "error"}
                      </span>
                      <p className="font-semibold leading-relaxed">{parsingAlert.msg}</p>
                    </div>
                  )}

                </div>

                {/* Parser Preview Table & Save */}
                <div className="lg:col-span-6 space-y-6">
                  
                  <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-3xl border border-outline-variant/30 premium-shadow">
                    <h5 className="text-[10px] uppercase font-bold text-outline tracking-wider mb-2">
                      Manifest Syntax Guide
                    </h5>
                    <p className="text-xs text-on-surface-variant font-body-md leading-relaxed">
                      Our parsing engine processes line-by-line inputs. Format as <strong>Color: Number Size</strong> or simply <strong>Color: Number</strong> for bags, boxers, fans, or other single-size goods. Sizes will automatically default to <i>One Size</i> if not specified.
                    </p>
                  </div>

                  {/* Preview grid */}
                  <div className="bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow space-y-4">
                    <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/30 pb-2 flex items-center justify-between">
                      Manifest Preview Grid
                      <span className="text-xs font-bold text-outline">
                        {parsedItems.length} lines parsed
                      </span>
                    </h4>

                    {parsedItems.length === 0 ? (
                      <div className="py-12 text-center text-outline text-xs">
                        Enter delivery specs on the left and click Parse Manifest to generate preview.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="overflow-x-auto max-h-48 overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-outline-variant/30 text-outline font-semibold text-[10px]">
                                <th className="py-2">Color</th>
                                <th className="py-2 text-center">Size</th>
                                <th className="py-2 text-center">Quantity</th>
                                <th className="py-2 text-right">Unit cost</th>
                                <th className="py-2 text-right">Sum total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 font-medium">
                              {parsedItems.map((item, idx) => {
                                const prodCost = products.find((p) => p.id === bulkProductSelect)?.costPrice || 0;
                                return (
                                  <tr key={idx} className="text-on-surface hover:bg-surface-low/30">
                                    <td className="py-2 font-bold">{item.color}</td>
                                    <td className="py-2 text-center">{item.size}</td>
                                    <td className="py-2 text-center font-bold text-primary">{item.quantity}</td>
                                    <td className="py-2 text-right text-outline">GH₵{prodCost.toFixed(2)}</td>
                                    <td className="py-2 text-right font-bold">GH₵{(item.quantity * prodCost).toFixed(2)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-surface-low/40 dark:bg-surface-low/10 p-4 rounded-2xl border border-outline-variant/20">
                          <div>
                            <p className="text-[10px] text-outline font-semibold uppercase tracking-wider">Total Quantity</p>
                            <p className="text-lg font-bold text-on-surface">
                              {parsedItems.reduce((acc, i) => acc + i.quantity, 0)} Units
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-outline font-semibold uppercase tracking-wider">Invoice Total Amount</p>
                            <p className="text-lg font-bold text-primary">
                              GH₵{(parsedItems.reduce((acc, i) => acc + i.quantity, 0) * (products.find((p) => p.id === bulkProductSelect)?.costPrice || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs border-t border-outline-variant/25 pt-3">
                          <span className="text-outline">Capital Budget Remaining:</span>
                          <span className={`font-bold GH₵{
                            (parsedItems.reduce((acc, i) => acc + i.quantity, 0) * (products.find((p) => p.id === bulkProductSelect)?.costPrice || 0)) > wallet.capitalCash
                              ? "text-error"
                              : "text-success"
                          }`}>
                            GH₵{wallet.capitalCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Toggle initial stock check */}
                        <div className="flex items-center gap-2 py-1 select-none">
                          <input
                            type="checkbox"
                            id="bulkIsInitialCheckbox"
                            className="w-4.5 h-4.5 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
                            checked={bulkIsInitial}
                            onChange={(e) => setBulkIsInitial(e.target.checked)}
                          />
                          <label htmlFor="bulkIsInitialCheckbox" className="text-xs text-on-surface-variant font-semibold cursor-pointer">
                            Record as Initial Stock (Does not deduct from Capital Cash)
                          </label>
                        </div>

                        <button
                          onClick={handleSaveBulkPurchase}
                          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[18px]">add_circle</span>
                          {bulkIsInitial ? "Record as Initial Stock" : "Approve and Restock Inventory"}
                        </button>
                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB 5: SALES PAGE
              ========================================== */}
          {currentTab === "sales" && (
            <div className="space-y-6">
              
              <div>
                <h2 className="text-2xl font-bold font-headline-lg tracking-tight text-on-surface">
                  Log a Customer Sale
                </h2>
                <p className="text-sm text-on-surface-variant font-body-md">
                  Complete transactions by selecting products, sizes, and checking net revenue returns.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Sales form */}
                <div className="lg:col-span-7 bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow">
                  <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4 border-b border-outline-variant/30 pb-2">
                    Sale Configuration
                  </h4>

                  <form onSubmit={handleRecordSale} className="space-y-4">
                    
                    {/* Choose Product */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                        Select Product
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none transition-all text-on-surface"
                        value={saleProductSelect}
                        onChange={(e) => setSaleProductSelect(e.target.value)}
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.image} {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color & Size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                          Select Color
                        </label>
                        <select
                          required
                          disabled={!saleProductSelect}
                          className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none transition-all text-on-surface disabled:opacity-50"
                          value={saleColorSelect}
                          onChange={(e) => {
                            setSaleColorSelect(e.target.value);
                            setSaleSizeSelect("");
                            setSaleQtyInput(1);
                          }}
                        >
                          <option value="">-- Select Color --</option>
                          {availableColorsForSelected.map((col) => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                          Select Size
                        </label>
                        <select
                          required
                          disabled={!saleColorSelect}
                          className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none transition-all text-on-surface disabled:opacity-50"
                          value={saleSizeSelect}
                          onChange={(e) => {
                            setSaleSizeSelect(e.target.value);
                            setSaleQtyInput(1);
                          }}
                        >
                          <option value="">-- Select Size --</option>
                          {availableSizesForSelectedAndColor.map((v) => (
                            <option key={v.size} value={v.size}>
                              {v.size} ({v.quantity} in stock)
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>

                    {/* Cost & Qty */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                          Selling Unit Price (GH₵)
                        </label>
                        <input
                          type="number"
                          required
                          min="0.01"
                          step="0.01"
                          disabled={!saleProductSelect}
                          className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none transition-all text-on-surface disabled:opacity-50"
                          value={salePriceInput}
                          onChange={(e) => setSalePriceInput(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1 flex justify-between">
                          <span>Sale Quantity</span>
                          {saleSizeSelect && (
                            <span className="text-[9px] text-primary lowercase">Max: {selectedVariantStock} units</span>
                          )}
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max={selectedVariantStock || 999}
                          disabled={!saleSizeSelect}
                          className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none transition-all text-on-surface disabled:opacity-50"
                          value={saleQtyInput}
                          onChange={(e) => setSaleQtyInput(parseInt(e.target.value, 10))}
                        />
                      </div>

                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                        Customer Name (Optional)
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none transition-all text-on-surface"
                        placeholder="John Doe / Walk-in"
                        value={saleCustomerName}
                        onChange={(e) => setSaleCustomerName(e.target.value)}
                      />
                    </div>

                    {saleAlert && (
                      <div className={`p-4 rounded-2xl text-xs flex items-start gap-2 border GH₵{
                        saleAlert.type === "success" 
                          ? "bg-success-container/10 border-success/20 text-success" 
                          : "bg-error-container/10 border-error/20 text-error"
                      }`}>
                        <span className="material-symbols-outlined text-[18px]">
                          {saleAlert.type === "success" ? "check_circle" : "error"}
                        </span>
                        <p className="font-semibold">{saleAlert.msg}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!saleSizeSelect || saleQtyInput > selectedVariantStock || saleQtyInput <= 0}
                      className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-[18px]">receipt</span>
                      Record Customer Sale Transaction
                    </button>

                  </form>
                </div>

                {/* Estimate details */}
                <div className="lg:col-span-5 bg-surface-lowest dark:bg-[#121620] p-6 rounded-3xl border border-outline-variant/30 premium-shadow space-y-5">
                  <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/30 pb-2">
                    Live Cost &amp; Profit Estimator
                  </h4>

                  {(!saleProductSelect || !saleColorSelect || !saleSizeSelect) ? (
                    <div className="py-16 text-center text-outline text-xs">
                      Adjust color/size configuration inputs on the left to activate calculations.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      <div className="flex items-center gap-3 bg-surface-low/50 dark:bg-surface-low/20 p-3 rounded-2xl">
                        <span className="text-2xl">{selectedProductObj?.image}</span>
                        <div>
                          <p className="font-bold text-xs text-on-surface">{selectedProductObj?.name}</p>
                          <p className="text-[10px] text-outline">
                            Variant: {saleColorSelect} - {saleSizeSelect}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        
                        <div className="flex items-center justify-between py-1">
                          <span className="text-outline">Gross Sales Revenue:</span>
                          <span className="font-bold text-on-surface">
                            GH₵{(saleQtyInput * parseFloat(salePriceInput || "0")).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <span className="text-outline">Total Product Cost Price:</span>
                          <span className="font-semibold text-on-surface">
                            GH₵{(saleQtyInput * (selectedProductObj?.costPrice || 0)).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-t border-outline-variant/20 pt-2 text-sm font-semibold">
                          <span className="text-outline">Net Income / Net Profit:</span>
                          <span className="text-success font-bold font-display">
                            +GH₵{((saleQtyInput * parseFloat(salePriceInput || "0")) - (saleQtyInput * (selectedProductObj?.costPrice || 0))).toFixed(2)}
                          </span>
                        </div>

                      </div>

                      <div className="bg-primary/5 dark:bg-primary/20 border border-primary/10 p-4 rounded-2xl space-y-2">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Wallet Capital &amp; Profit Allocations
                        </h5>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-on-surface-variant font-medium">Re-enters Capital Cash:</span>
                          <span className="font-bold text-on-surface">
                            +GH₵{(saleQtyInput * (selectedProductObj?.costPrice || 0)).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-on-surface-variant font-medium">Deposits to Profit Wallet:</span>
                          <span className="font-bold text-success">
                            +GH₵{((saleQtyInput * parseFloat(salePriceInput || "0")) - (saleQtyInput * (selectedProductObj?.costPrice || 0))).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-warning-container/5 border border-warning/10 rounded-2xl flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant">Remaining variant stock:</span>
                        <span className="font-bold text-warning">
                          {selectedVariantStock - saleQtyInput} units remaining
                        </span>
                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB 6: PURCHASES
              ========================================== */}
          {currentTab === "purchases" && (
            <div className="space-y-6">
              
              <div>
                <h2 className="text-2xl font-bold font-headline-lg tracking-tight text-on-surface">
                  Restock Purchases Timeline
                </h2>
                <p className="text-sm text-on-surface-variant font-body-md">
                  Timeline of wholesale manifest deliveries.
                </p>
              </div>

              {purchases.length === 0 ? (
                <div className="bg-surface-lowest dark:bg-surface-lowest p-12 text-center rounded-3xl border border-outline-variant/30 text-outline text-xs">
                  No restock purchase batches found in logs. Go to Bulk Purchase to restock items.
                </div>
              ) : (
                <div className="relative border-l-2 border-primary/20 ml-4 pl-6 space-y-6">
                  {purchases.map((batch) => (
                    <div key={batch.id} className="relative bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow">
                      
                      <span className="absolute left-[-32px] top-[24px] w-4 h-4 rounded-full bg-primary border-4 border-background flex items-center justify-center"></span>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant/30 pb-3 gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-outline font-mono">Batch #{batch.id}</span>
                          <h4 className="text-base font-bold text-on-surface mt-0.5">{batch.supplier}</h4>
                          <p className="text-xs text-on-surface-variant mt-0.5 font-medium">
                            Manifest processed on: {new Date(batch.date).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary leading-tight">GH₵{batch.totalAmount.toLocaleString()}</p>
                          <p className="text-xs font-semibold text-outline">{batch.totalQuantity} items received</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="text-[10px] uppercase font-bold text-outline tracking-wider mb-2">
                          Itemized Manifest Specifications
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-outline border-b border-outline-variant/20">
                                <th className="py-2">Item Description</th>
                                <th className="py-2 text-center">Color</th>
                                <th className="py-2 text-center">Size</th>
                                <th className="py-2 text-center">Quantity</th>
                                <th className="py-2 text-right">Cost Price</th>
                                <th className="py-2 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10 font-semibold text-on-surface-variant">
                              {batch.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-surface-low/30">
                                  <td className="py-2 font-bold text-on-surface">{item.name}</td>
                                  <td className="py-2 text-center">{item.color}</td>
                                  <td className="py-2 text-center">{item.size}</td>
                                  <td className="py-2 text-center text-primary font-bold">{item.quantity}</td>
                                  <td className="py-2 text-right">GH₵{item.costPrice.toFixed(2)}</td>
                                  <td className="py-2 text-right text-on-surface">GH₵{(item.quantity * item.costPrice).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ==========================================
              TAB 7: REPORTS
              ========================================== */}
          {currentTab === "reports" && (
            <div className="space-y-6">
              
              <div>
                <h2 className="text-2xl font-bold font-headline-lg tracking-tight text-on-surface">
                  Financial Analytics
                </h2>
                <p className="text-sm text-on-surface-variant font-body-md">
                  Interactive charts representing business portfolio growth and revenue.
                </p>
              </div>

              {/* Chart Selector Card */}
              <div className="bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow space-y-6">
                
                <div className="flex flex-wrap gap-2 border-b border-outline-variant/20 pb-4">
                  {[
                    { id: "revenue", label: "Gross Revenue", icon: "payments" },
                    { id: "profit", label: "Net Profit", icon: "finance" },
                    { id: "cogs", label: "Cost of Goods Sold (COGS)", icon: "shopping_bag" },
                    { id: "inventory", label: "Inventory Valuation", icon: "inventory_2" },
                    { id: "capital", label: "Capital Growth", icon: "trending_up" }
                  ].map((metric) => {
                    const isActive = activeReportMetric === metric.id;
                    return (
                      <button
                        key={metric.id}
                        onClick={() => {
                          setActiveReportMetric(metric.id as any);
                          setHoveredDataIndex(null);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all GH₵{
                          isActive
                            ? "bg-primary text-white premium-shadow"
                            : "bg-surface-low text-on-surface-variant border border-outline-variant/25 hover:bg-outline-variant/30"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{metric.icon}</span>
                        {metric.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Interactive SVG Chart */}
                <div className="relative pt-6">
                  
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-4 pt-6 pb-8">
                    <div className="w-full border-t border-outline-variant/10"></div>
                    <div className="w-full border-t border-outline-variant/10"></div>
                    <div className="w-full border-t border-outline-variant/10"></div>
                    <div className="w-full border-t border-outline-variant/10"></div>
                  </div>

                  <svg
                    viewBox="0 0 500 150"
                    className="w-full h-64 overflow-visible cursor-pointer"
                    onMouseLeave={() => setHoveredDataIndex(null)}
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {svgChartPoints.fillPath && (
                      <path d={svgChartPoints.fillPath} fill="url(#chartGradient)" />
                    )}

                    {svgChartPoints.linePath && (
                      <path
                        d={svgChartPoints.linePath}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {svgChartPoints.points.map((p, idx) => {
                      const isHovered = hoveredDataIndex === idx;
                      return (
                        <g key={idx}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? 6 : 4}
                            fill={isHovered ? "var(--primary)" : "var(--surface-lowest)"}
                            stroke="var(--primary)"
                            strokeWidth="2.5"
                            className="transition-all duration-150"
                          />

                          <rect
                            x={p.x - 30}
                            y={0}
                            width={60}
                            height={150}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredDataIndex(idx)}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {hoveredDataIndex !== null && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-surface-lowest border border-outline-variant/60 p-3 rounded-2xl premium-shadow text-center min-w-40 z-10 transition-all pointer-events-none select-none animate-fade-in">
                      <p className="text-[10px] text-outline font-semibold uppercase tracking-wider">
                        {svgChartPoints.points[hoveredDataIndex].label}
                      </p>
                      <p className="text-base font-bold text-primary font-display mt-0.5">
                        GH₵{svgChartPoints.points[hoveredDataIndex].value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between text-[10px] text-outline font-semibold uppercase tracking-wider px-2.5 mt-2 select-none">
                    {chartData.labels.map((lbl, idx) => (
                      <span key={idx}>{lbl}</span>
                    ))}
                  </div>

                </div>

              </div>

              {/* Comparisons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">
                    Performance Analysis (June vs July)
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-outline-variant/10">
                      <span className="text-outline">Gross Sales Revenue:</span>
                      <span className="font-bold text-on-surface">+24.3% YoY Growth</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-outline-variant/10">
                      <span className="text-outline">Net profit margin value:</span>
                      <span className="font-bold text-success">58.4% Average</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-outline">Performance Rating:</span>
                      <span className="font-bold text-primary">High Margin Restock</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                      Retail Logic Summary
                    </h4>
                    <p className="text-xs text-on-surface-variant font-body-md leading-relaxed">
                      Your business worth is steadily expanding due to inventory restocking and high selling-price margins. We recommend injecting initial capital to fund wholesale restocks or reinvesting accumulated profit.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setCurrentTab("wallet")}
                      className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      Manage Wallet Balances
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB 8: WALLET
              ========================================== */}
          {currentTab === "wallet" && (
            <div className="space-y-6">
              
              <div>
                <h2 className="text-2xl font-bold font-headline-lg tracking-tight text-on-surface">
                  Financial Capital Portfolios
                </h2>
                <p className="text-sm text-on-surface-variant font-body-md">
                  Inject capital to fund inventory, withdraw net sales earnings, or reinvest profits back.
                </p>
              </div>

              {/* Wallet balances layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                
                <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 premium-shadow">
                  <span className="text-[10px] uppercase font-bold text-outline">Capital Cash</span>
                  <p className="text-xl font-bold font-display text-primary mt-1">
                    GH₵{wallet.capitalCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] text-outline mt-1">Used to purchase inventory stock</p>
                </div>

                <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 premium-shadow">
                  <span className="text-[10px] uppercase font-bold text-outline">Profit Wallet</span>
                  <p className="text-xl font-bold font-display text-success mt-1">
                    GH₵{wallet.profitWallet.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] text-outline mt-1">Earned margin from sales</p>
                </div>

                <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 premium-shadow">
                  <span className="text-[10px] uppercase font-bold text-outline">Inventory Stock Value</span>
                  <p className="text-xl font-bold font-display text-on-surface mt-1">
                    GH₵{dynamicInventoryValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] text-outline mt-1">Warehouse items valuation at cost</p>
                </div>

                <div className="bg-surface-lowest dark:bg-surface-lowest p-5 rounded-2xl border border-outline-variant/30 premium-shadow">
                  <span className="text-[10px] uppercase font-bold text-outline">Business Worth</span>
                  <p className="text-xl font-bold font-display text-on-surface mt-1">
                    GH₵{dynamicBusinessWorth.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] text-outline mt-1">Capital + Profit + Inventory worth</p>
                </div>

              </div>

              {/* Action columns grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Inject capital */}
                <div className="bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow space-y-4">
                  <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/30 pb-2">
                    Inject Startup Capital
                  </h4>
                  
                  <form onSubmit={handleInjectCapital} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                        Amount to Invest (GH₵)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none text-on-surface"
                        placeholder="5000.00"
                        value={injectAmount}
                        onChange={(e) => setInjectAmount(e.target.value)}
                      />
                    </div>
                    
                    <p className="text-[11px] text-on-surface-variant font-body-md leading-relaxed">
                      Inject capital cash directly to kick off stock intakes. Added amounts will increment the <strong>Capital Cash</strong> wallet and register an <i>Investment</i> transaction.
                    </p>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-[0.98]"
                    >
                      Inject Cash Capital
                    </button>
                  </form>
                </div>

                {/* 2. Withdraw profit */}
                <div className="bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow space-y-4">
                  <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/30 pb-2 flex items-center justify-between">
                    Withdraw Profits
                    <span className="text-xs text-outline font-bold">
                      Paid: GH₵{wallet.profitWithdrawn.toLocaleString()}
                    </span>
                  </h4>

                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                        Amount to Withdraw (GH₵)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none text-on-surface"
                        placeholder="500.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                        Destination Bank Account
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none text-on-surface"
                        placeholder="Chase Business Account (...1234)"
                        value={withdrawBank}
                        onChange={(e) => setWithdrawBank(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-all active:scale-[0.98]"
                    >
                      Confirm Withdrawal
                    </button>
                  </form>
                </div>

                {/* 3. Reinvest profits */}
                <div className="bg-surface-lowest dark:bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 premium-shadow space-y-4">
                  <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/30 pb-2 flex items-center justify-between">
                    Reinvest Profits
                    <span className="text-xs text-outline font-bold">
                      Reinvested: GH₵{wallet.profitReinvested.toLocaleString()}
                    </span>
                  </h4>

                  <form onSubmit={handleReinvest} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                        Amount to Reinvest (GH₵)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none text-on-surface"
                        placeholder="1000.00"
                        value={reinvestAmount}
                        onChange={(e) => setReinvestAmount(e.target.value)}
                      />
                    </div>

                    <p className="text-[11px] text-on-surface-variant font-body-md leading-relaxed">
                      Reinvesting transfers liquid funds from the <strong>Profit Wallet</strong> directly into <strong>Capital Cash</strong>, allowing you to restock products or restock variants.
                    </p>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-success text-white text-xs font-semibold hover:bg-emerald-600 transition-all active:scale-[0.98]"
                    >
                      Reinvest Profits
                    </button>
                  </form>
                </div>

              </div>

              {walletAlert && (
                <div className={`p-4 rounded-2xl text-xs flex items-start gap-2 border max-w-lg mx-auto GH₵{
                  walletAlert.type === "success" 
                    ? "bg-success-container/10 border-success/20 text-success" 
                    : "bg-error-container/10 border-error/20 text-error"
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {walletAlert.type === "success" ? "check_circle" : "error"}
                  </span>
                  <p className="font-semibold">{walletAlert.msg}</p>
                </div>
              )}

            </div>
          )}

          {/* ==========================================
              TAB 9: TRANSACTIONS
              ========================================== */}
          {currentTab === "transactions" && (
            <div className="space-y-6">
              
              <div>
                <h2 className="text-2xl font-bold font-headline-lg tracking-tight text-on-surface">
                  Financial Ledger
                </h2>
                <p className="text-sm text-on-surface-variant font-body-md">
                  Audit trail of all purchases, restocks, sales, reinvestments, and withdrawals.
                </p>
              </div>

              {/* Controls panel */}
              <div className="bg-surface-lowest dark:bg-surface-lowest p-4 rounded-2xl border border-outline-variant/30 premium-shadow flex flex-col md:flex-row gap-4 items-center justify-between">
                
                <div className="w-full md:w-80 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
                    placeholder="Search ledger details..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  {["All", "Sale", "Purchase", "Investment", "Profit Reinvestment", "Withdrawal"].map((cat) => {
                    const isSelected = txFilter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setTxFilter(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all GH₵{
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-surface-low text-on-surface-variant border border-outline-variant/35 hover:bg-outline-variant/25"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ledger Table */}
              <div className="bg-surface-lowest dark:bg-surface-lowest rounded-3xl border border-outline-variant/30 overflow-hidden premium-shadow animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-outline uppercase tracking-wider font-semibold text-[10px]">
                        <th className="p-4">Date/Time</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Description</th>
                        <th className="p-4 text-right">Cash Flow</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-on-surface-variant">
                      {filteredTransactions.map((tx) => {
                        const isIncome = tx.amount > 0;
                        let typeColorClass = "bg-primary/10 text-primary";
                        let typeIcon = "info";

                        if (tx.type === "Sale") {
                          typeColorClass = "bg-success-container/10 text-success";
                          typeIcon = "payments";
                        } else if (tx.type === "Purchase") {
                          typeColorClass = "bg-error-container/10 text-error";
                          typeIcon = "shopping_bag";
                        } else if (tx.type === "Withdrawal") {
                          typeColorClass = "bg-warning-container text-on-warning-container";
                          typeIcon = "logout";
                        } else if (tx.type === "Profit Reinvestment") {
                          typeColorClass = "bg-emerald-600/10 text-emerald-600";
                          typeIcon = "restart_alt";
                        } else if (tx.type === "Investment") {
                          typeColorClass = "bg-blue-600/10 text-blue-600";
                          typeIcon = "explore";
                        }

                        return (
                          <tr key={tx.id} className="hover:bg-surface-low/30 transition-colors">
                            <td className="p-4 text-outline font-medium">
                              {new Date(tx.date).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 GH₵{typeColorClass}`}>
                                <span className="material-symbols-outlined text-[12px]">{typeIcon}</span>
                                {tx.type}
                              </span>
                            </td>
                            <td className="p-4 text-on-surface font-bold">
                              {tx.description}
                            </td>
                            <td className={`p-4 text-right font-display font-bold text-sm ${isIncome ? "text-success" : "text-on-surface"}`}>
                              <div>
                                {isIncome ? "+" : ""}GH₵{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </div>
                              {tx.type === "Sale" && tx.cost !== undefined && (
                                <div className="text-[9px] text-outline font-normal mt-0.5 font-sans">
                                  COGS: GH₵{tx.cost.toFixed(2)} | Net: +GH₵{tx.profit?.toFixed(2)}
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <span className="bg-success-container/10 text-success font-bold text-[10px] px-2 py-0.5 rounded-full">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-outline text-xs">
                            No ledger entries found matching filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </main>
      </div>

      {/* ==========================================
          MOBILE SIDEBAR (DRAWER MENU)
          ========================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sidebar drawer content */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-64 max-w-[80vw] h-full bg-surface-lowest dark:bg-[#0c101b] border-r border-outline-variant/30 flex flex-col justify-between premium-shadow-lg z-10"
            >
              {/* Top Section */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white premium-shadow">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        grid_view
                      </span>
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-sm leading-tight text-on-surface">
                        Stitch Prism
                      </h2>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-outline">
                        {isDbConnected ? "Supabase Cloud" : "Local Retail OS"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-outline hover:text-on-surface hover:bg-surface-low rounded-lg"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5 bg-surface-low/80 dark:bg-surface-low/20 p-2.5 rounded-2xl border border-outline-variant/30 mb-4 select-none">
                  <div className="w-8 h-8 rounded-full bg-secondary-container/50 flex items-center justify-center font-bold text-primary font-display text-xs">
                    {username[0]}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-on-surface truncate">{username}</p>
                    <p className="text-[10px] text-outline font-medium truncate">{businessName}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setMobileMenuOpen(false);
                        setParsingAlert(null);
                        setSaleAlert(null);
                        setWalletAlert(null);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative GH₵{
                        isActive
                          ? "text-primary bg-primary/10 border-l-4 border-primary"
                          : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[18px] GH₵{isActive ? "text-primary" : "text-outline"}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Bottom controls */}
              <div className="p-3 border-t border-outline-variant/20 space-y-1.5">
                {isDbConnected && (
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[9px] bg-success-container/10 border border-success/20 text-success mb-1 select-none">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block"></span>
                      <span>Cloud Synced</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-semibold bg-surface-low/60 hover:bg-surface-low border border-outline-variant/30 text-on-surface transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">
                      {darkMode ? "dark_mode" : "light_mode"}
                    </span>
                    <span>Theme</span>
                  </div>
                  <div className="w-7 h-3.5 rounded-full bg-outline-variant/50 relative flex items-center p-0.5 transition-all">
                    <div className={`w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform duration-200 GH₵{darkMode ? "translate-x-3" : "translate-x-0"}`}></div>
                  </div>
                </button>

                <button
                  onClick={handleResetData}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-warning hover:bg-warning-container/20 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  Load Demo Data
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-error hover:bg-error-container/10 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Exit Workplace
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddProductModal(false);
                setProductAddAlert(null);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-surface-lowest dark:bg-surface-lowest max-w-md w-full rounded-3xl border border-outline-variant/40 overflow-hidden premium-shadow-lg p-6 relative z-10"
            >
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  setProductAddAlert(null);
                }}
                className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-low"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-on-surface">Create New Product SKU</h3>
                <p className="text-xs text-outline mt-0.5">Register custom products like bags, boxers, fans, or waffle shirts.</p>
              </div>

              <form onSubmit={handleAddNewProduct} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-outline mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none text-on-surface"
                    placeholder="Premium Boxers Pack of 3"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-outline mb-1">Category</label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none text-on-surface"
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                    >
                      <option value="Clothing">👕 Clothing</option>
                      <option value="Accessories">👜 Accessories</option>
                      <option value="Electronics">🌀 Electronics</option>
                      <option value="Home Goods">🥤 Home Goods</option>
                      <option value="Other">📦 Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-outline mb-1">Emoji Icon</label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none text-on-surface"
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                    >
                      <option value="📦">📦 Package</option>
                      <option value="👕">👕 Shirt</option>
                      <option value="🩳">🩳 Boxers/Shorts</option>
                      <option value="👜">👜 Bag</option>
                      <option value="🌀">🌀 Fan</option>
                      <option value="🥤">🥤 Cup/Tumbler</option>
                      <option value="🧦">🧦 Socks</option>
                      <option value="🕶️">🕶️ Sunglasses</option>
                      <option value="🧢">🧢 Cap</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-outline mb-1">Cost Price (GH₵)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none text-on-surface"
                      placeholder="8.50"
                      value={newProdCost}
                      onChange={(e) => setNewProdCost(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-outline mb-1">Selling Price (GH₵) (Optional)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-low dark:bg-surface-low focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none text-on-surface"
                      placeholder="None (Set at sale)"
                      value={newProdSelling}
                      onChange={(e) => setNewProdSelling(e.target.value)}
                    />
                  </div>
                </div>

                {productAddAlert && (
                  <div className={`p-3 rounded-2xl text-[11px] border GH₵{
                    productAddAlert.type === "success" 
                      ? "bg-success-container/10 border-success/20 text-success" 
                      : "bg-error-container/10 border-error/20 text-error"
                  }`}>
                    <p>{productAddAlert.msg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-[0.98]"
                >
                  Register Product SKU
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "inventory", label: "Inventory", icon: "inventory_2" },
  { id: "bulk-purchase", label: "Bulk Purchase", icon: "add_shopping_cart" },
  { id: "sales", label: "New Sale", icon: "payments" },
  { id: "purchases", label: "Purchases", icon: "shopping_bag" },
  { id: "reports", label: "Reports", icon: "analytics" },
  { id: "wallet", label: "Wallet", icon: "account_balance_wallet" },
  { id: "transactions", label: "Transactions", icon: "receipt_long" }
];

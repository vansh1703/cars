"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Car,
  TrendingUp,
  Plus,
  X,
  Save,
  Lock,
  Eye,
  EyeOff,
  DollarSign,
} from "lucide-react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const SECRET = "gursimrankaur";

interface MonthData {
  month: string;
  revenue: number;
  profit: number;
  count: number;
}

interface YearlySummary {
  year: number;
  total_revenue: number;
  total_profit: number;
  total_cars_sold: number;
}

const CACHE_KEY = "admin_dashboard_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCars: 0,
    soldCars: 0,
    availableCars: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [yearRevenue, setYearRevenue] = useState(0);
  const [yearProfit, setYearProfit] = useState(0);
  const [yearlySummaries, setYearlySummaries] = useState<YearlySummary[]>([]);

  // Modals
  const [showManualSale, setShowManualSale] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profit unlock
  const [profitUnlocked, setProfitUnlocked] = useState(false);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [profitPassword, setProfitPassword] = useState("");
  const [profitError, setProfitError] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Yearly history unlock
  const [historyUnlocked, setHistoryUnlocked] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPassword, setHistoryPassword] = useState("");
  const [historyError, setHistoryError] = useState(false);
  const [showHistoryPwd, setShowHistoryPwd] = useState(false);

  const [manualForm, setManualForm] = useState({
    car_title: "",
    brand: "",
    model: "",
    year: "",
    sell_price: "",
    purchase_price: "",
    buyer_name: "",
    buyer_phone: "",
    buyer_address: "",
    notes: "",
  });

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        setStats(data.stats);
        setMonthlyData(data.monthlyData);
        setYearRevenue(data.yearRevenue);
        setYearProfit(data.yearProfit);
        setYearlySummaries(data.yearlySummaries);
        return;
      }
    }
    loadData();
  }, []);

  const loadData = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) return;
      }
    }

    const currentYear = new Date().getFullYear();
    await archiveYearIfNeeded(currentYear);

    const [carsRes, soldRes] = await Promise.all([
      supabase
        .from("cars")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null),
      supabase
        .from("cars")
        .select("id, final_sell_price, purchase_price, price, sold_at")
        .eq("is_sold", true),
    ]);

    const soldCars = soldRes.data || [];
    const newStats = {
      totalCars: carsRes.count || 0,
      soldCars: soldCars.length,
      availableCars: (carsRes.count || 0) - soldCars.length,
    };
    setStats(newStats);

    const { data: manualSales } = await supabase
      .from("manual_sales")
      .select("sell_price, purchase_price, sold_at");

    const monthly: MonthData[] = MONTHS.map((month, i) => {
      const thisMonthListed = soldCars.filter((c: any) => {
        if (!c.sold_at) return false;
        const d = new Date(c.sold_at);
        return d.getFullYear() === currentYear && d.getMonth() === i;
      });
      const thisMonthManual = (manualSales || []).filter((m: any) => {
        if (!m.sold_at) return false;
        const d = new Date(m.sold_at);
        return d.getFullYear() === currentYear && d.getMonth() === i;
      });
      const revenue =
        thisMonthListed.reduce(
          (s: number, c: any) => s + (c.final_sell_price || c.price || 0),
          0,
        ) +
        thisMonthManual.reduce(
          (s: number, m: any) => s + (m.sell_price || 0),
          0,
        );
      const profit =
        thisMonthListed.reduce((s: number, c: any) => {
          const sell = c.final_sell_price || c.price || 0;
          const buy = c.purchase_price;
          if (!buy || buy === 0) return s;
          return s + (sell - buy);
        }, 0) +
        thisMonthManual.reduce((s: number, m: any) => {
          const sell = m.sell_price || 0;
          const buy = m.purchase_price;
          if (!buy || buy === 0) return s;
          return s + (sell - buy);
        }, 0);
      return {
        month,
        revenue,
        profit,
        count: thisMonthListed.length + thisMonthManual.length,
      };
    });

    const newYearRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
    const newYearProfit = monthly.reduce((s, m) => s + m.profit, 0);

    const { data: summaries } = await supabase
      .from("yearly_summaries")
      .select("*")
      .order("year", { ascending: false });

    setMonthlyData(monthly);
    setYearRevenue(newYearRevenue);
    setYearProfit(newYearProfit);
    setYearlySummaries(summaries || []);

    // Save to cache
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: {
          stats: newStats,
          monthlyData: monthly,
          yearRevenue: newYearRevenue,
          yearProfit: newYearProfit,
          yearlySummaries: summaries || [],
        },
      }),
    );
  };

  // Archives current year data to yearly_summaries if year has rolled over
  const archiveYearIfNeeded = async (currentYear: number) => {
    const lastYear = currentYear - 1;
    // NEW ✅
    const { data: existing } = await supabase
      .from("yearly_summaries")
      .select("id")
      .eq("year", lastYear)
      .maybeSingle();

    if (existing) return;

    // Get last year's data
    const { data: soldCars } = await supabase
      .from("cars")
      .select("final_sell_price, purchase_price, price, sold_at")
      .eq("is_sold", true);

    const { data: manualSales } = await supabase
      .from("manual_sales")
      .select("sell_price, purchase_price, sold_at");

    const lastYearSold = (soldCars || []).filter((c: any) => {
      if (!c.sold_at) return false;
      return new Date(c.sold_at).getFullYear() === lastYear;
    });

    const lastYearManual = (manualSales || []).filter((m: any) => {
      if (!m.sold_at) return false;
      return new Date(m.sold_at).getFullYear() === lastYear;
    });

    if (lastYearSold.length === 0 && lastYearManual.length === 0) return;

    const total_revenue =
      lastYearSold.reduce(
        (s: number, c: any) => s + (c.final_sell_price || c.price || 0),
        0,
      ) +
      lastYearManual.reduce((s: number, m: any) => s + (m.sell_price || 0), 0);

    const total_profit =
      lastYearSold.reduce((s: number, c: any) => {
        const sell = c.final_sell_price || c.price || 0;
        const buy = c.purchase_price;
        if (!buy || buy === 0) return s;
        return s + (sell - buy);
      }, 0) +
      lastYearManual.reduce((s: number, m: any) => {
        const sell = m.sell_price || 0;
        const buy = m.purchase_price;
        if (!buy || buy === 0) return s;
        return s + (sell - buy);
      }, 0);

    await supabase.from("yearly_summaries").upsert({
      year: lastYear,
      total_revenue,
      total_profit,
      total_cars_sold: lastYearSold.length + lastYearManual.length,
    });
  };

  const handleUnlockProfit = () => {
    if (profitPassword === SECRET) {
      setProfitUnlocked(true);
      setShowProfitModal(false);
      setProfitPassword("");
      setProfitError(false);
    } else {
      setProfitError(true);
    }
  };

  const handleUnlockHistory = () => {
    if (historyPassword === SECRET) {
      setHistoryUnlocked(true);
      setShowHistoryModal(false);
      setHistoryPassword("");
      setHistoryError(false);
    } else {
      setHistoryError(true);
    }
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.car_title || !manualForm.sell_price) return;
    setSaving(true);
    await supabase.from("manual_sales").insert({
      car_title: manualForm.car_title,
      brand: manualForm.brand,
      model: manualForm.model,
      year: manualForm.year ? parseInt(manualForm.year) : null,
      sell_price: parseInt(manualForm.sell_price),
      purchase_price: manualForm.purchase_price
        ? parseInt(manualForm.purchase_price)
        : null,
      buyer_name: manualForm.buyer_name,
      buyer_phone: manualForm.buyer_phone,
      buyer_address: manualForm.buyer_address,
      notes: manualForm.notes,
      sold_at: new Date().toISOString(),
    });
    setSaving(false);
    setShowManualSale(false);
    setManualForm({
      car_title: "",
      brand: "",
      model: "",
      year: "",
      sell_price: "",
      purchase_price: "",
      buyer_name: "",
      buyer_phone: "",
      buyer_address: "",
      notes: "",
    });
    loadData();
  };

  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);
  const currentYear = new Date().getFullYear();

  // Reusable password modal
  const PasswordModal = ({
    title,
    subtitle,
    value,
    onChange,
    onSubmit,
    onClose,
    error,
    show,
    setShow,
  }: any) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-sm w-full max-w-sm shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-brand-gold/10 p-2 rounded-sm">
            <Lock size={20} className="text-brand-gold" />
          </div>
          <div>
            <h3 className="font-bold text-brand-navy">{title}</h3>
            <p className="text-gray-400 text-xs">{subtitle}</p>
          </div>
        </div>
        <div className="relative mb-3">
          <input
            type={show ? "text" : "password"}
            placeholder="Enter password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            className={`input-field pr-10 ${error ? "border-red-400" : ""}`}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-xs mb-3">Incorrect password</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onSubmit}
            className="btn-gold flex-1 justify-center py-2.5"
          >
            Unlock
          </button>
          <button
            onClick={onClose}
            className="btn-outline flex-1 justify-center py-2.5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex gap-2">
        <button
          onClick={() => loadData(true)}
          className="text-gray-400 hover:text-brand-navy text-xs border border-gray-200 rounded-sm px-2 py-1"
        >
          ↻ Refresh
        </button>
        <button
          onClick={() => setShowManualSale(true)}
          className="btn-outline py-2 px-3 text-xs"
        >
          + Manual Sale
        </button>
        <Link href="/admin/cars/new" className="btn-gold py-2 px-3 text-xs">
          <Plus size={14} /> Add Car
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{currentYear} overview</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManualSale(true)}
            className="btn-outline py-2 px-3 text-xs"
          >
            + Manual Sale
          </button>
          <Link href="/admin/cars/new" className="btn-gold py-2 px-3 text-xs">
            <Plus size={14} /> Add Car
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Total listed */}
        <div className="bg-white rounded-sm p-4 shadow-sm">
          <Car size={20} className="text-brand-gold mb-2" />
          <div className="text-2xl font-bold text-brand-navy">
            {stats.totalCars}
          </div>
          <div className="text-gray-500 text-xs">Total Listed</div>
          <div className="text-gray-400 text-xs mt-0.5">
            {stats.availableCars} available
          </div>
        </div>

        {/* Cars sold */}
        <div className="bg-white rounded-sm p-4 shadow-sm">
          <TrendingUp size={20} className="text-green-500 mb-2" />
          <div className="text-2xl font-bold text-brand-navy">
            {stats.soldCars}
          </div>
          <div className="text-gray-500 text-xs">Cars Sold</div>
          <div className="text-gray-400 text-xs mt-0.5">all time</div>
        </div>

        {/* Revenue — always visible */}
        <div className="bg-white rounded-sm p-4 shadow-sm">
          <DollarSign size={20} className="text-brand-gold mb-2" />
          <div className="text-2xl font-bold text-brand-navy">
            ₹
            {yearRevenue >= 100000
              ? `${(yearRevenue / 100000).toFixed(1)}L`
              : yearRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-gray-500 text-xs">Revenue {currentYear}</div>
          <div className="text-gray-400 text-xs mt-0.5">total earnings</div>
        </div>

        {/* Profit — password locked */}
        <div
          className="bg-white rounded-sm p-4 shadow-sm cursor-pointer hover:shadow-md transition-all"
          onClick={() => !profitUnlocked && setShowProfitModal(true)}
        >
          {profitUnlocked ? (
            <>
              <TrendingUp
                size={20}
                className={`mb-2 ${yearProfit >= 0 ? "text-green-500" : "text-red-500"}`}
              />
              <div
                className={`text-2xl font-bold ${yearProfit >= 0 ? "text-green-600" : "text-red-500"}`}
              >
                {yearProfit >= 0 ? "+" : "-"}₹
                {Math.abs(yearProfit) >= 100000
                  ? `${(Math.abs(yearProfit) / 100000).toFixed(1)}L`
                  : Math.abs(yearProfit).toLocaleString("en-IN")}
              </div>
              <div className="text-gray-500 text-xs">
                {yearProfit >= 0 ? "Profit" : "Loss"} {currentYear}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProfitUnlocked(false);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 mt-1 block"
              >
                lock
              </button>
            </>
          ) : (
            <>
              <Lock size={20} className="text-gray-300 mb-2" />
              <div className="text-2xl font-bold text-gray-200">₹ ••••</div>
              <div className="text-gray-400 text-xs">Profit {currentYear}</div>
              <div className="text-gray-300 text-xs mt-0.5">tap to unlock</div>
            </>
          )}
        </div>
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-sm shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-brand-navy">
            Monthly Revenue — {currentYear}
          </h2>
          <div className="text-right">
            <div className="text-brand-gold font-bold text-sm">
              ₹{yearRevenue.toLocaleString("en-IN")}
            </div>
            {profitUnlocked && (
              <div
                className={`text-xs font-semibold ${yearProfit >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {yearProfit >= 0 ? "+" : ""}₹
                {yearProfit.toLocaleString("en-IN")} profit
              </div>
            )}
          </div>
        </div>

        {/* Bars */}
        <div className="flex items-end gap-1 md:gap-1.5 h-36 mb-3">
          {monthlyData.map((m, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 group relative"
            >
              {m.revenue > 0 && (
                <div className="absolute bottom-6 hidden group-hover:flex flex-col bg-brand-navy text-white text-xs px-2 py-1.5 rounded-sm whitespace-nowrap z-10 left-1/2 -translate-x-1/2 shadow-lg">
                  <span>₹{m.revenue.toLocaleString("en-IN")}</span>
                  {profitUnlocked && (
                    <span
                      className={
                        m.profit >= 0 ? "text-green-400" : "text-red-400"
                      }
                    >
                      {m.profit >= 0 ? "+" : ""}₹
                      {m.profit.toLocaleString("en-IN")}
                    </span>
                  )}
                  <span className="text-gray-400">{m.count} sold</span>
                </div>
              )}
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  m.revenue > 0
                    ? "bg-brand-gold hover:bg-brand-gold-dark"
                    : "bg-gray-100"
                }`}
                style={{
                  height: `${Math.max((m.revenue / maxRevenue) * 130, m.revenue > 0 ? 8 : 3)}px`,
                }}
              />
              <span className="text-[9px] md:text-[10px] text-gray-400">
                {m.month}
              </span>
            </div>
          ))}
        </div>

        {/* Monthly breakdown cards — only months with sales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
          {monthlyData
            .filter((m) => m.revenue > 0)
            .map((m, i) => (
              <div key={i} className="bg-brand-cream rounded-sm p-3">
                <div className="text-xs font-semibold text-gray-500 mb-1">
                  {m.month}
                </div>
                <div className="font-bold text-brand-navy text-sm">
                  ₹{m.revenue.toLocaleString("en-IN")}
                </div>
                {profitUnlocked && (
                  <div
                    className={`text-xs font-semibold ${m.profit >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {m.profit >= 0 ? "+" : ""}₹
                    {m.profit.toLocaleString("en-IN")}
                  </div>
                )}
                <div className="text-gray-400 text-xs">
                  {m.count} car{m.count !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          {monthlyData.every((m) => m.revenue === 0) && (
            <p className="text-gray-400 text-sm col-span-4 py-3 text-center">
              No sales this year yet
            </p>
          )}
        </div>
      </div>

      {/* Yearly History — password locked */}
      <div
        className="bg-white rounded-sm shadow-sm p-5 cursor-pointer hover:shadow-md transition-all"
        onClick={() => !historyUnlocked && setShowHistoryModal(true)}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">
            Yearly Revenue & Profit History
          </h2>
          {historyUnlocked ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHistoryUnlocked(false);
              }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              lock
            </button>
          ) : (
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Lock size={13} /> tap to unlock
            </div>
          )}
        </div>

        {!historyUnlocked ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-sm p-3 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-12 mb-2" />
                <div className="h-5 bg-gray-200 rounded w-20 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : yearlySummaries.length === 0 ? (
          <p className="text-gray-400 text-sm mt-4">
            No archived years yet. Data will auto-archive when the year ends.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {yearlySummaries.map((y) => (
              <div
                key={y.year}
                className="border border-gray-100 rounded-sm p-4"
              >
                <div className="font-bold text-brand-navy text-lg mb-2">
                  {y.year}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Revenue</span>
                    <span className="font-semibold text-brand-navy">
                      ₹{y.total_revenue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Profit</span>
                    <span
                      className={`font-semibold ${y.total_profit >= 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {y.total_profit >= 0 ? "+" : ""}₹
                      {y.total_profit.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cars Sold</span>
                    <span className="font-semibold text-brand-navy">
                      {y.total_cars_sold}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password modals */}
      {showProfitModal && (
        <PasswordModal
          title="View Profit Data"
          subtitle="Enter password to unlock"
          value={profitPassword}
          onChange={setProfitPassword}
          onSubmit={handleUnlockProfit}
          onClose={() => {
            setShowProfitModal(false);
            setProfitPassword("");
            setProfitError(false);
          }}
          error={profitError}
          show={showPwd}
          setShow={setShowPwd}
        />
      )}

      {showHistoryModal && (
        <PasswordModal
          title="Yearly History"
          subtitle="Enter password to view past years"
          value={historyPassword}
          onChange={setHistoryPassword}
          onSubmit={handleUnlockHistory}
          onClose={() => {
            setShowHistoryModal(false);
            setHistoryPassword("");
            setHistoryError(false);
          }}
          error={historyError}
          show={showHistoryPwd}
          setShow={setShowHistoryPwd}
        />
      )}

      {/* Manual Sale Modal */}
      {showManualSale && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h3 className="font-bold text-brand-navy text-lg">
                  Record Manual Sale
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  For cars not listed on site
                </p>
              </div>
              <button
                onClick={() => setShowManualSale(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleManualSave} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Car Title *
                </label>
                <input
                  value={manualForm.car_title}
                  onChange={(e) =>
                    setManualForm((p) => ({ ...p, car_title: e.target.value }))
                  }
                  className="input-field"
                  placeholder="e.g. Maruti Swift 2018"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Brand
                  </label>
                  <input
                    value={manualForm.brand}
                    onChange={(e) =>
                      setManualForm((p) => ({ ...p, brand: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Maruti"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={manualForm.year}
                    onChange={(e) =>
                      setManualForm((p) => ({ ...p, year: e.target.value }))
                    }
                    className="input-field"
                    placeholder="2018"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    value={manualForm.purchase_price}
                    onChange={(e) =>
                      setManualForm((p) => ({
                        ...p,
                        purchase_price: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="400000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Sell Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={manualForm.sell_price}
                    onChange={(e) =>
                      setManualForm((p) => ({
                        ...p,
                        sell_price: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="500000"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Buyer Name
                </label>
                <input
                  value={manualForm.buyer_name}
                  onChange={(e) =>
                    setManualForm((p) => ({ ...p, buyer_name: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Buyer Phone
                </label>
                <input
                  value={manualForm.buyer_phone}
                  onChange={(e) =>
                    setManualForm((p) => ({
                      ...p,
                      buyer_phone: e.target.value,
                    }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Address
                </label>
                <input
                  value={manualForm.buyer_address}
                  onChange={(e) =>
                    setManualForm((p) => ({
                      ...p,
                      buyer_address: e.target.value,
                    }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <textarea
                  value={manualForm.notes}
                  onChange={(e) =>
                    setManualForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="input-field resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gold flex-1 justify-center py-3 disabled:opacity-60"
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={15} /> Save Sale
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualSale(false)}
                  className="btn-outline flex-1 justify-center py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Coins, Sparkles, ShoppingBag, ArrowUpRight, 
  CheckCircle2, Plus, Gift, Coffee, Compass, Home, Bike 
} from 'lucide-react';

export default function PahadiCoinsWallet() {
  const [balance, setBalance] = useState(45);
  const [redeemedShop, setRedeemedShop] = useState(null);

  const shops = [
    { id: 1, name: 'Chai & Buransh Juice Point', cost: 2, icon: Coffee, desc: 'Hot herbal tea & rhododendron juice' },
    { id: 2, name: 'Local Himalayan Guide Tip', cost: 5, icon: Compass, desc: 'Direct reward for heritage trail guides' },
    { id: 3, name: 'Organic Pahadi Thali Dinner', cost: 8, icon: Home, desc: 'Farm-to-table mandua & jhangora meal' },
    { id: 4, name: 'Riding Helmet / Raincoat Add-on', cost: 4, icon: Bike, desc: 'Premium riding safety gear for rental fleet' }
  ];

  const transactions = [
    { id: 1, title: 'Tea at Chopta Chai Point', amount: '-2 Coins', type: 'debit', time: 'Today, 1:15 PM' },
    { id: 2, title: 'Guide tip for Tungnath trek', amount: '-5 Coins', type: 'debit', time: 'Yesterday, 4:00 PM' },
    { id: 3, title: 'Reward: Zero-Plastic Trail Cleanup', amount: '+15 Coins', type: 'credit', time: '21 Sep, 11:30 AM' },
    { id: 4, title: 'Welcome Bonus: Verified Traveler KYC', amount: '+30 Coins', type: 'credit', time: '20 Sep, 9:00 AM' }
  ];

  const handleRedeem = (shop) => {
    if (balance < shop.cost) {
      alert('Insufficient Pahadi Coins balance!');
      return;
    }
    setBalance(prev => prev - shop.cost);
    setRedeemedShop(shop.name);
    setTimeout(() => setRedeemedShop(null), 3000);
  };

  const handleEarnMore = () => {
    setBalance(prev => prev + 10);
  };

  return (
    <div className="w-full bg-[#fcfaf6] text-slate-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.04)] relative overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-5 border-b border-stone-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Coins size={14} className="text-amber-600" />
            <span>Circular Mountain Economy Token</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display tracking-tight">
            Pahadi Coins Eco-Wallet
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Earn rewards for eco-friendly trekking, zero-plastic disposal, and spend directly at certified local village vendors.
          </p>
        </div>

        <button
          type="button"
          onClick={handleEarnMore}
          className="px-4 py-2 rounded-full bg-[#0f3d2e] hover:bg-[#165a44] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
        >
          <Plus size={14} />
          <span>Earn +10 Eco Coins</span>
        </button>
      </div>

      {/* Main Grid: Left Balance & Redeem + Right Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Balance Card & Local Shop Redemptions (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Balance Hero Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Available Eco-Token Balance
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-950 mt-1 flex items-baseline gap-2">
                <span>{balance}</span>
                <span className="text-base font-bold text-amber-800">Pahadi Coins</span>
              </div>
              <p className="text-xs text-amber-900/80 mt-1">
                ≈ ₹{balance * 10} value across 120+ verified mountain homestays & tea stalls
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-200/80 text-amber-800 flex items-center justify-center shadow-xs">
              <Coins size={32} />
            </div>
          </div>

          {/* Local Partner Redeem Grid */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 mb-3">
              Redeem with Local Village Partners
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shops.map((shop) => {
                const Icon = shop.icon;
                return (
                  <div
                    key={shop.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                          <Icon size={16} />
                        </div>
                        <span className="text-xs font-black text-[#0f3d2e] bg-[#0f3d2e]/10 px-2.5 py-0.5 rounded-full">
                          {shop.cost} Coins
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-stone-900">{shop.name}</h5>
                      <p className="text-[11px] text-stone-500 mt-0.5">{shop.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRedeem(shop)}
                      className="mt-3 w-full py-1.5 rounded-xl bg-stone-50 hover:bg-[#0f3d2e] text-stone-700 hover:text-white border border-stone-200 hover:border-transparent text-xs font-bold transition-all cursor-pointer"
                    >
                      Redeem Coupon
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {redeemedShop && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <span>Coupon for <strong>{redeemedShop}</strong> generated! Show to local partner.</span>
            </div>
          )}

        </div>

        {/* Right: Transactions History (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Recent Eco Activities
              </span>
              <span className="text-[11px] font-bold text-stone-600">Ledger Verified</span>
            </div>

            <div className="space-y-3">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-xs pb-2 border-b border-stone-50">
                  <div>
                    <div className="font-bold text-stone-800">{t.title}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">{t.time}</div>
                  </div>
                  <span className={`font-black ${t.type === 'credit' ? 'text-emerald-700' : 'text-stone-700'}`}>
                    {t.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100 text-[11px] text-stone-500 text-center">
            Every coin directly supports Himalayan community welfare.
          </div>
        </div>

      </div>

    </div>
  );
}

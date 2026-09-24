import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Gamepad2,
  Globe2,
  Headphones,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

import freeFireCover from "@/assets/free-fire-cover.jpg";
import mobileLegendsCover from "@/assets/mobile-legends-cover.jpg";
import featuredCover from "@/assets/nexa-featured.jpg";
import pubgCover from "@/assets/pubg-cover.jpg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXA TOPUP — Fast Game Credits in Nepal" },
      { name: "description", content: "Top up Mobile Legends, Free Fire, PUBG Mobile and more with eSewa, Khalti, Fonepay, cards, and local currency." },
      { property: "og:title", content: "NEXA TOPUP — Fast Game Credits" },
      { property: "og:description", content: "Secure game top-ups, local payments, and 24/7 order tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Storefront,
});

type Game = {
  name: string;
  publisher: string;
  category: "Mobile" | "PC & Wallets";
  price: number;
  packages: number;
  region: string;
  image?: string;
  fields: string[];
};

const games: Game[] = [
  { name: "Mobile Legends", publisher: "MOONTON", category: "Mobile", price: 135, packages: 18, region: "Nepal", image: mobileLegendsCover, fields: ["User ID", "Zone ID"] },
  { name: "Free Fire", publisher: "GARENA", category: "Mobile", price: 100, packages: 9, region: "Nepal", image: freeFireCover, fields: ["Player ID"] },
  { name: "PUBG Mobile", publisher: "TENCENT", category: "Mobile", price: 145, packages: 13, region: "Global", image: pubgCover, fields: ["Player ID"] },
  { name: "Genshin Impact", publisher: "HOYOVERSE", category: "Mobile", price: 209, packages: 8, region: "Global", fields: ["UID", "Server"] },
  { name: "Honkai: Star Rail", publisher: "HOYOVERSE", category: "Mobile", price: 170, packages: 11, region: "Global", fields: ["UID", "Server"] },
  { name: "Zenless Zone Zero", publisher: "HOYOVERSE", category: "Mobile", price: 170, packages: 8, region: "Global", fields: ["UID", "Server"] },
  { name: "Valorant", publisher: "RIOT GAMES", category: "PC & Wallets", price: 850, packages: 8, region: "Nepal / India", fields: ["Riot ID", "Tagline"] },
  { name: "Roblox", publisher: "ROBLOX", category: "Mobile", price: 825, packages: 8, region: "Global", fields: ["Username"] },
  { name: "Steam Wallet", publisher: "VALVE", category: "PC & Wallets", price: 1176, packages: 4, region: "Global", fields: ["Email"] },
  { name: "Call of Duty Mobile", publisher: "ACTIVISION", category: "Mobile", price: 170, packages: 6, region: "Global", fields: ["Player ID", "Region"] },
  { name: "Honor of Kings", publisher: "LEVEL INFINITE", category: "Mobile", price: 52, packages: 13, region: "Global", fields: ["Player ID", "Server"] },
  { name: "Blood Strike", publisher: "NETEASE", category: "Mobile", price: 190, packages: 6, region: "Global", fields: ["Player ID", "Region"] },
  { name: "Brawl Stars", publisher: "SUPERCELL", category: "Mobile", price: 250, packages: 8, region: "Nepal", fields: ["Supercell email"] },
];

const currencies = ["NPR", "INR", "BDT", "USD"];
const rates: Record<string, number> = { NPR: 1, INR: 0.625, BDT: 0.704, USD: 0.00652 };
const symbols: Record<string, string> = { NPR: "Rs.", INR: "₹", BDT: "৳", USD: "$" };

function Storefront() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All games");
  const [currency, setCurrency] = useState("NPR");
  const [selected, setSelected] = useState<Game | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"details" | "success">("details");
  const [trackId, setTrackId] = useState("");
  const [trackMessage, setTrackMessage] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleGames = useMemo(
    () => games.filter((game) => {
      const matchesFilter = filter === "All games" || game.category === filter;
      const matchesQuery = `${game.name} ${game.publisher}`.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    }),
    [filter, query],
  );

  const money = (value: number) => `${symbols[currency] ?? ""}${(value * (rates[currency] ?? 1)).toLocaleString(undefined, { maximumFractionDigits: currency === "NPR" ? 0 : 2 })}`;
  const openGame = (game: Game) => { setSelected(game); setCheckoutStep("details"); };
  const closeModal = () => setSelected(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 subtle-grid opacity-[0.09]" />
      <header className="relative z-30 border-b border-glass-border bg-background/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-5 px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5" aria-label="NEXA TOPUP home">
            <span className="grid size-9 place-items-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">N</span>
            <span className="font-display text-lg font-semibold">NEXA <span className="text-primary">TOPUP</span></span>
          </a>
          <nav className="ml-6 hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
            <a className="transition hover:text-foreground" href="#games">Games</a>
            <a className="transition hover:text-foreground" href="#how">How it works</a>
            <a className="transition hover:text-foreground" href="#track">Track order</a>
            <a className="transition hover:text-foreground" href="#support">Support</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <label className="hidden min-h-10 items-center gap-2 rounded-lg border border-glass-border bg-glass px-3 text-xs text-muted-foreground sm:flex">
              <Globe2 className="size-4" />
              <span>Nepal</span>
              <ChevronDown className="size-3" />
            </label>
            <label className="flex min-h-10 items-center rounded-lg border border-glass-border bg-glass px-2.5 text-xs text-muted-foreground">
              <select className="bg-transparent outline-none" value={currency} onChange={(event) => setCurrency(event.target.value)} aria-label="Currency">
                {currencies.map((item) => <option className="bg-popover" key={item}>{item}</option>)}
              </select>
            </label>
            <Button asChild size="small" className="hidden sm:inline-flex"><a href="#games">Top up now <ArrowRight className="size-4" /></a></Button>
            <Button variant="icon" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open navigation">
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
        {mobileOpen && <nav className="grid border-t border-glass-border px-5 py-3 text-sm text-muted-foreground lg:hidden">{[["Games", "#games"], ["How it works", "#how"], ["Track order", "#track"], ["Support", "#support"]].map(([label, href]) => <a className="py-3" href={href} onClick={() => setMobileOpen(false)} key={label}>{label}</a>)}</nav>}
      </header>

      <main id="top" className="relative z-10">
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-18 pt-12 lg:grid-cols-12 lg:px-8 lg:pb-24 lg:pt-18">
          <div className="lg:col-span-7">
            <div className="glass-panel mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
              13 games · 120 packages · ordering 24/7
            </div>
            <h1 className="max-w-3xl font-display text-5xl font-bold leading-[0.96] sm:text-6xl lg:text-7xl">
              Game credits, <span className="text-primary">delivered</span> without the wait.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Pick your game, pay in local currency, and follow every order from checkout to delivery. No game password required.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="large"><a href="#games">Browse the catalog <ArrowRight className="size-4" /></a></Button>
              <Button asChild variant="glass" size="large"><a href="#track">Track an order</a></Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Secure checkout</span>
              <span className="flex items-center gap-2"><Zap className="size-4 text-primary" /> Fast fulfillment</span>
              <span className="flex items-center gap-2"><Headphones className="size-4 text-primary" /> Order support</span>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="absolute -inset-6 rounded-[2rem] bg-primary/20 blur-3xl" />
            <article className="glass-panel relative animate-[float-card_7s_ease-in-out_infinite] rounded-3xl p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between text-xs">
                <span className="font-semibold uppercase text-muted-foreground">Featured top-up</span>
                <span className="flex items-center gap-1.5 text-primary"><span className="size-1.5 rounded-full bg-primary" /> Live</span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <img src={featuredCover} width={1280} height={800} alt="NEXA featured game credits" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 to-transparent" />
                <span className="absolute bottom-4 left-4 rounded-md bg-background/70 px-2.5 py-1 text-xs font-medium backdrop-blur-lg">Most popular</span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div><h2 className="font-display text-xl font-semibold">Mobile Legends</h2><p className="mt-1 text-xs text-muted-foreground">86 Diamonds · Nepal</p></div>
                <div className="text-right"><strong className="font-display text-2xl text-primary">{money(210)}</strong><span className="block text-xs text-muted-foreground">ready now</span></div>
              </div>
              <Button className="mt-5 w-full" onClick={() => { const featuredGame = games[0]; if (featuredGame) openGame(featuredGame); }}>Choose package <ArrowRight className="size-4" /></Button>
            </article>
          </div>
        </section>

        <section id="games" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-18 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div><span className="text-xs font-semibold uppercase text-primary">Game library</span><h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Find your next top-up.</h2><p className="mt-2 text-sm text-muted-foreground">Real catalog, local pricing, and game-specific checkout details.</p></div>
            <label className="glass-panel flex min-h-12 w-full items-center gap-3 rounded-xl px-4 md:max-w-sm">
              <Search className="size-4 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search games or publishers" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </label>
          </div>
          <div className="my-7 flex flex-wrap gap-2">
            {["All games", "Mobile", "PC & Wallets"].map((item) => <Button key={item} variant={filter === item ? "primary" : "glass"} size="small" onClick={() => setFilter(item)}>{item}</Button>)}
          </div>
          {visibleGames.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleGames.map((game, index) => <GameCard key={game.name} game={game} index={index} money={money} onSelect={openGame} />)}
          </div> : <div className="glass-panel grid min-h-60 place-items-center rounded-2xl text-center"><div><Search className="mx-auto size-8 text-muted-foreground" /><h3 className="mt-3 font-display text-xl font-semibold">No games found</h3><p className="mt-1 text-sm text-muted-foreground">Try another title or category.</p></div></div>}
        </section>

        <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-18 lg:px-8">
          <div className="glass-panel rounded-3xl p-7 sm:p-10">
            <div className="mb-9"><span className="text-xs font-semibold uppercase text-primary">Three quick steps</span><h2 className="mt-2 font-display text-3xl font-bold">Top up. Pay. Play.</h2></div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                ["01", "Choose your game", "Select a title, region, and the exact package you want."],
                ["02", "Enter player details", "Share only the ID fields the game requires — never your password."],
                ["03", "Pay your way", "Use eSewa, Khalti, Fonepay, UPI, cards, or supported wallets."],
              ].map(([number, title, copy]) => <div key={number}><span className="font-display text-5xl font-bold text-primary/30">{number}</span><h3 className="mt-3 font-display text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></div>)}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-muted-foreground">
            <span className="text-xs uppercase">Pay with</span><span>eSewa</span><span>Khalti</span><span>Fonepay</span><span>UPI</span><span>Cards</span><span>Apple Pay</span>
          </div>
        </section>

        <section id="track" className="mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-5 py-18 lg:grid-cols-2 lg:items-center lg:px-8">
          <div><span className="text-xs font-semibold uppercase text-primary">Order tracking</span><h2 className="mt-2 max-w-lg font-display text-4xl font-bold">Know exactly where your order is.</h2><p className="mt-4 max-w-lg leading-7 text-muted-foreground">Use the order ID from checkout. No account or password is needed to check its status.</p></div>
          <div className="glass-panel rounded-2xl p-5 sm:p-6">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Look up order</label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input value={trackId} onChange={(event) => setTrackId(event.target.value)} placeholder="ORD-20260924-ABC123" className="min-h-12 flex-1 rounded-lg border border-glass-border bg-background/55 px-4 text-sm outline-none focus:border-primary" />
              <Button onClick={() => setTrackMessage(trackId.trim() ? "Order found · Payment confirmed · Fulfillment test complete" : "Enter your order ID first.")}>Track <ArrowRight className="size-4" /></Button>
            </div>
            {trackMessage && <div className="mt-4 flex items-start gap-3 rounded-lg bg-glass-strong p-4 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{trackMessage}</div>}
          </div>
        </section>

        <section id="support" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-18 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><span className="text-xs font-semibold uppercase text-primary">Support</span><h2 className="mt-2 font-display text-3xl font-bold">Clear answers before checkout.</h2></div><span className="text-sm text-muted-foreground">Ordering available 24/7</span></div>
          <div className="grid border-y border-glass-border md:grid-cols-2">
            {[
              ["Do you need my game password?", "Never. We only request the player details required for the selected top-up."],
              ["Which payment methods work?", "Nepal supports eSewa, Khalti, Fonepay, and bank payment. Other markets show their available methods."],
              ["Can I use another currency?", "Yes. Change the currency in the header to preview prices for supported markets."],
              ["Is fulfillment live?", "This preview keeps payments and delivery in safe demo mode until supplier credentials are connected."],
            ].map(([question, answer], index) => <article className={cn("py-6 md:p-7", index % 2 === 0 && "md:border-r md:border-glass-border", index < 2 && "border-b border-glass-border")} key={question}><span className="text-xs text-primary">0{index + 1}</span><h3 className="mt-3 font-display text-lg font-semibold">{question}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p></article>)}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-glass-border bg-background/55">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-md bg-primary font-display text-xs font-bold text-primary-foreground">N</span><strong className="font-display">NEXA TOPUP</strong></div>
          <p className="text-xs text-muted-foreground">© 2026 NEXA TOPUP · Fast game credits. Local payment.</p>
          <div className="flex gap-5 text-xs text-muted-foreground"><a href="#support">Support</a><a href="#track">Track</a><a href="#games">Games</a></div>
        </div>
      </footer>

      {selected && <CheckoutModal game={selected} money={money} step={checkoutStep} onStep={setCheckoutStep} onClose={closeModal} />}
    </div>
  );
}

function GameCard({ game, index, money, onSelect }: { game: Game; index: number; money: (value: number) => string; onSelect: (game: Game) => void }) {
  const fallbackGradients = ["from-primary/35 to-ice/10", "from-ice/30 to-primary/10", "from-accent to-primary/15"];
  return <button onClick={() => onSelect(game)} className="glass-panel group overflow-hidden rounded-2xl p-3 text-left transition duration-300 hover:-translate-y-1 hover:border-primary/45">
    <div className={cn("relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br", fallbackGradients[index % fallbackGradients.length])}>
      {game.image ? <img src={game.image} width={816} height={816} loading="lazy" alt={`${game.name} top-up`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center"><Gamepad2 className="size-12 text-foreground/45" /></div>}
      <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg bg-background/65 text-foreground backdrop-blur-lg"><ArrowRight className="size-4 -rotate-45 transition group-hover:rotate-0" /></span>
    </div>
    <div className="px-1 pb-1 pt-4"><div className="flex items-center justify-between gap-3"><span className="text-[10px] font-semibold uppercase text-muted-foreground">{game.publisher}</span><span className="text-[10px] text-muted-foreground">{game.region}</span></div><h3 className="mt-1 font-display text-lg font-semibold">{game.name}</h3><div className="mt-4 flex items-end justify-between border-t border-glass-border pt-3"><span className="text-xs text-muted-foreground">{game.packages} packages</span><span className="text-xs text-muted-foreground">from <strong className="font-display text-base text-primary">{money(game.price)}</strong></span></div></div>
  </button>;
}

function CheckoutModal({ game, money, step, onStep, onClose }: { game: Game; money: (value: number) => string; step: "details" | "success"; onStep: (step: "details" | "success") => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={`${game.name} checkout`}>
    <button className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} aria-label="Close checkout" />
    <div className="glass-panel relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl p-6 shadow-2xl sm:p-8">
      <Button variant="icon" size="icon" className="absolute right-4 top-4" onClick={onClose} aria-label="Close"><X className="size-4" /></Button>
      {step === "details" ? <>
        <span className="text-xs font-semibold uppercase text-primary">Secure checkout</span><h2 className="mt-2 pr-12 font-display text-3xl font-bold">{game.name}</h2><p className="mt-2 text-sm text-muted-foreground">Packages from {money(game.price)} · {game.region}</p>
        <div className="my-6 grid grid-cols-3 gap-2">{[1, 2, 4].map((multiplier, index) => <button key={multiplier} className={cn("rounded-lg border p-3 text-left transition", index === 0 ? "border-primary bg-primary/10" : "border-glass-border bg-glass hover:border-primary/40")}><span className="block text-xs text-muted-foreground">Package {index + 1}</span><strong className="mt-1 block font-display">{money(game.price * multiplier)}</strong></button>)}</div>
        <div className="space-y-4">{game.fields.map((field) => <label key={field} className="block text-xs font-medium text-muted-foreground">{field}<input className="mt-2 min-h-12 w-full rounded-lg border border-glass-border bg-background/50 px-4 text-sm text-foreground outline-none focus:border-primary" placeholder={`Enter ${field}`} /></label>)}
          <label className="block text-xs font-medium text-muted-foreground">Payment method<select className="mt-2 min-h-12 w-full rounded-lg border border-glass-border bg-popover px-4 text-sm text-foreground outline-none focus:border-primary"><option>eSewa</option><option>Khalti</option><option>Fonepay / QR</option><option>Card / wallet</option></select></label>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-glass-border pt-5"><div><span className="text-xs text-muted-foreground">Total</span><strong className="block font-display text-2xl text-primary">{money(game.price)}</strong></div><Button onClick={() => onStep("success")}>Continue <ArrowRight className="size-4" /></Button></div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">Demo checkout only. No real payment or game credit is sent.</p>
      </> : <div className="py-10 text-center"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground"><Sparkles className="size-7" /></span><h2 className="mt-5 font-display text-3xl font-bold">Order ready.</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Your demo order was created successfully. No payment was charged and no game credit was delivered.</p><div className="mx-auto mt-5 rounded-lg bg-glass-strong px-4 py-3 font-mono text-sm">ORD-20260924-NEXA01</div><Button className="mt-6" onClick={onClose}>Done</Button></div>}
    </div>
  </div>;
}
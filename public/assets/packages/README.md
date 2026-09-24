# Package artwork sources

Product thumbnails are bundled locally so the catalog does not make third-party image requests at runtime. Package names and quantities remain visible as text alongside the decorative art.

| Product | Local asset | Source |
| --- | --- | --- |
| Mobile Legends Weekly Diamond Pass | `ml-weekly-pass.png` | [Daconda Mobile Legends listing](https://admin.daconda.com/storage/item-category/01JRSMNZD10V9YT4K8SSJ4NKMM.png) |
| Mobile Legends Weekly Elite Bundle | `ml-weekly-elite.webp` | [Durmaplay Weekly Elite Bundle](https://www.durmaplay.com/hi/mlbb-weekly-elite-bundle-tr) |
| Mobile Legends Monthly Epic Bundle | `ml-monthly-epic.webp` | [Durmaplay Monthly Epic Bundle](https://www.durmaplay.com/de/mlbb-monthly-epic-bundle-tr) |
| Mobile Legends Twilight Pass | `ml-twilight-pass.webp` | [Daconda Mobile Legends listing](https://admin.daconda.com/storage/item-category/01JS4CFZ9H01HJ1KMDKMB1Z25G.webp) |
| Free Fire Weekly Membership | `free-fire-weekly-membership.webp` | [RaxGame Weekly Membership](https://raxgame.com/urunler/free-fire-weekly-membership-satin-al) |
| Free Fire Monthly Membership | `free-fire-monthly-membership.png` | [Durmaplay Monthly Membership](https://www.durmaplay.com/en/monthly-membership-free-fire) |
| Honkai: Star Rail Express Supply Pass | `hsr-express-supply-pass.png` | [Durmaplay Express Supply Pass](https://www.durmaplay.com/en/honkai-star-rail-express-supply-pass) |
| Zenless Zone Zero Inter-Knot Membership | `zzz-inter-knot-membership.png` | [PlayStation Store membership artwork](https://image.api.playstation.com/vulcan/ap/rnd/202403/2910/90206107b88818ef11bf1a69e5a4a97c196852a1d588c07e.png) |
| Genshin Impact Blessing of the Welkin Moon | `genshin-welkin-moon.jpg` | [Kaleoz Welkin Moon listing](https://www.kaleoz.com/buy/genshin-impact/258737) |
| Honor of Kings Weekly Card / Weekly Card Plus | `hok-weekly-card-thumb.jpg` | [Kaleoz Weekly Card Plus listing](https://www.kaleoz.com/id/buy/honor-of-kings/249207) |
| Brawl Stars Pass / Pass Plus | `brawl-pass-plus.jpg` | [BuyMMOG Brawl Pass Plus](https://www.buymmog.com/brawl-stars-gems-pass-top-ups) |

Other packages use the local per-game currency artwork in `../currency/`. Quantity chips and layered gem marks communicate denomination without using unrelated pass art.

## Mobile Legends in-game recharge artwork

The denomination tiles below are crops from the official Mobile Legends recharge-menu screenshot supplied by the site owner. Each crop keeps the corresponding gem pile or chest artwork, while the package name and price remain selectable text in the storefront.

| Recharge tier | Local asset |
| --- | --- |
| Small diamond tiers | `ml-recharge-50.jpg` |
| Mid diamond tiers | `ml-recharge-150.jpg`, `ml-recharge-250.jpg`, `ml-recharge-500.jpg` |
| Large diamond tiers | `ml-recharge-1000.jpg`, `ml-recharge-1500.jpg`, `ml-recharge-2000.jpg`, `ml-recharge-2500.jpg` |

Other games use the local, game-specific currency and pass illustrations already listed above and in `../currency/`. The renderer selects the art by game and product kind so unrelated currencies are never shown as generic placeholders.

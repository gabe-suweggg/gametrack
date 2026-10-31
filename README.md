# GameTrack

US gaming-hardware prices with tax and shipping. This repo is the foundation. Prices are sample data.

The repo stays under one owner until both people agree to share it. A read invite is fine. Admin is not.

## Open it on your computer

You need [Node.js](https://nodejs.org) installed. Then, in a terminal:

```bash
git clone https://github.com/gabe-suweggg/gametrack.git
cd gametrack
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080). Prices are still samples.

The New and Updated labels show in this local copy. They do not show on a published site.

## What you are looking at

| Path | What it is |
|---|---|
| `src/routes/index.tsx` | The list. One product for now. |
| `src/routes/p/$productId.tsx` | A product page |
| `src/data/prices.json` | The only prices file. One product inside `products`. Add the next one here. |
| `prototype/` | The saved demo from the meeting. Leave it alone. |
| `docs/STATUS.md` | What is real and what is fake |
| `docs/OPEN.md` | Questions that are not decided |

## Not in this repo yet

Accounts, payments, store scrapers, affiliate links, and extra products.

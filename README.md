# Metkish — Portfolio (Scroll Expansion Hero)

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn struktura, z integrirano `ScrollExpandMedia` komponento.

## Zagon

```bash
npm install
npm run dev
```

Odpri http://localhost:3000.

Za produkcijsko verzijo: `npm run build && npm start`.

## Stack — preverjeno stanje

- **TypeScript** — da (`tsconfig.json`, vse komponente so `.tsx`).
- **Tailwind CSS** — da, v4 (CSS-first, brez `tailwind.config.js`; nastavitve so v `app/globals.css` prek `@theme`).
- **shadcn struktura** — da. `components.json` je nastavljen z privzetimi potmi:
  - `components` → `@/components`
  - `ui` → `@/components/ui`
  - `lib` → `@/lib`

  Ker projekt uporablja privzeto pot `/components/ui`, jo obdrži tudi v prihodnje — vanjo shadcn CLI (`npx shadcn add ...`) pričakuje in postavlja vse osnovne (primitive) komponente. Če bi pot spremenil, bi moral CLI ob vsakem dodajanju komponente ročno preusmerjati, poleg tega marsikatera skupnostna komponenta/predloga privzeto referencira `@/components/ui/...` — ohranjanje privzete poti prepreči podvajanje in polomljene importe.

  Opomba: `npx shadcn init` v tem peskovniku ni mogel dokončati, ker klical `ui.shadcn.com`, do katerega peskovnik nima omrežnega dostopa. Zato sem `components.json`, `lib/utils.ts` in CSS spremenljivke (neutral/new-york tema) postavil ročno — rezultat je enak, kot bi ga naredil CLI. Na tvojem računalniku bo `npx shadcn@latest add <komponenta>` za dodajanje novih komponent deloval normalno.

## Nameščene odvisnosti

```bash
npm install framer-motion lucide-react clsx tailwind-merge class-variance-authority tw-animate-css
```

- `framer-motion` — zahtevana za `ScrollExpandMedia` (animacije).
- `lucide-react` — ikonska knjižnica (shadcn privzeta izbira), trenutno ni v uporabi na strani, a je na voljo.
- `clsx`, `tailwind-merge`, `class-variance-authority`, `tw-animate-css` — standardne shadcn odvisnosti (`cn()` helper, animacijski utility razredi).

## Komponenta

`components/ui/scroll-expansion-hero.tsx` — kopija komponente iz specifikacije, z eno dodano funkcionalnostjo: prop **`bgIsVideo?: boolean`**. Originalna komponenta je ozadje (`bgImageSrc`) vedno renderala kot `next/image`; ker si želela video ozadje namesto slike, sem dodala pogojno renderanje `<video>` elementa, ko je `bgIsVideo` nastavljen na `true`. Vse ostalo (scroll/touch logika, animacije, layout) je nespremenjeno.

## Kaj je prilagojeno za Metkish (`app/page.tsx`)

- **Ozadje** (`bgImageSrc` + `bgIsVideo`) → tvoj video: `Landing page.mp4`
- **Medij v sredini** (`mediaSrc`, `mediaType="image"`) → tvoj logo: `metkish-logo-transparent-circle.png`
- Naslov: `Metkish`, podnapis: `Portfolio 2026`, poziv za scroll: `Scroll to Expand`
- Spodnja "about" sekcija ima kratko slovensko besedilo — zamenjaj ga s svojim.
- `next.config.ts` ima dodan `images.remotePatterns` za domeno `pub-639db9eee0bc4d35bfa9f777a62a6f91.r2.dev`, ker `next/image` zahteva eksplicitno dovoljene domene za zunanje slike.
- `app/layout.tsx` uporablja sistemsko pisavo namesto Google Fonts (Geist), ker v tem peskovniku ni bilo dostopa do `fonts.googleapis.com`. Če imaš na svojem računalniku/strežniku internetni dostop, lahko Geist mirno vrneš nazaj (`next/font/google`).

## Kje urejati vsebino

Vse besedilo, naslov in URL-je medijev najdeš na vrhu `app/page.tsx` (konstanti `BG_VIDEO_SRC`, `LOGO_SRC`) in v propih komponente `ScrollExpandMedia`.

## Responsivnost

Komponenta že vsebuje mobilno obnašanje (drugačna občutljivost na touch scroll, ožji razpon širine/višine medija pod 768px) — prilagajanje ni potrebno, deluje "iz škatle".

# DeployAI

Marketing website and brand assets for DeployAI: behavioral models for consumer brands. DeployAI builds a behavioral model on a brand's own first-party data, deploys it into the brand's CRM and media, and measures the lift against a randomized holdout group.

Live site: https://nglungfai.github.io/deployai/

## Repository layout

```
/                 Website (served by GitHub Pages from the repo root)
├── index.html    Home page
├── styles.css    Site styles
├── results.js    Results section: uplift chart, budget slider, hero win-back list
├── favicon.ico
├── assets/       Logos, icons, social share image
├── brand/        Logo system: wordmark, mark, app icons, brand sheet (PDF/HTML)
└── docs/         Brand usage notes
```

The site is plain HTML, CSS and JavaScript. There is no build step.

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Results on the home page

The win-back and prediction results come from a demo brand, Cedar & Ember Coffee: a simulated 200,000-customer coffee and brewing-gear business built so the true drivers of churn and offer response are known. Models trained on earlier weeks were scored on a later win-back campaign with a randomized 20% holdout. The numbers live in `results.js`.

## Booking

"Book a consultation" opens the booking form. There is no on-page chat agent.

## Deploying

GitHub Pages serves the `main` branch from `/` (root). Any commit to `main` redeploys the site within about a minute. Bump the `?v=` cache-bust on `styles.css` and `results.js` in `index.html` when either changes.

## Brand

The logo is the triangle D built into the DeployAI wordmark (set in Outfit), with a matching 45° seam on the "I". Usage rules, colors and type are in `docs/brand-guidelines.md` and `brand/DeployAI-Brand-Logo.pdf`.

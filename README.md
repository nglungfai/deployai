# DeployAI

Marketing website and brand assets for **DeployAI**: AI and automation for home service businesses, set up and managed for you. DeployAI scores a business's past customers, reaches the ones who are due for service, answers when they call with AI agents, and measures the jobs it added against a holdout group.

**Live site:** https://nglungfai.github.io/deployai/

## Repository layout

```
/                     Website (served by GitHub Pages from the repo root)
├── index.html        Home page
├── styles.css        Site styles
├── deployai.js       Voice call demos, Botpress embed loader
├── due.js            "Who's due this month" scored-list demo
├── favicon.ico
├── assets/           Logos, icons, social share image, demo call audio
│   └── audio/
├── brand/            Logo system: wordmark, mark, app icons, brand sheet (PDF/HTML)
└── docs/             Setup notes (Botpress, brand usage)
```

The site is plain HTML, CSS and JavaScript. There is no build step.

## Preview locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Connecting the Botpress scheduling agent

The booking section on the home page embeds a Botpress webchat. Until it is connected, a built-in preview of the same qualify-and-book flow runs. See [docs/botpress-setup.md](docs/botpress-setup.md).

## Deploying

GitHub Pages serves the `main` branch from `/ (root)`. Any commit to `main` redeploys the site within about a minute.

## Brand

The logo is the triangle D built into the DeployAI wordmark (set in Outfit), with a matching 45° seam on the "I". Usage rules, colors and type are in [docs/brand-guidelines.md](docs/brand-guidelines.md) and [brand/DeployAI-Brand-Logo.pdf](brand/DeployAI-Brand-Logo.pdf).

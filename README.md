# Shoutrrr.com

Marketing site for [Shoutrrr](https://shoutrrr.com), the open-source social scheduling app for drafting once and publishing to X, Bluesky, and LinkedIn.

This repository contains the public website only. The Shoutrrr application and self-hosting docs live in the main project repository: [coollabsio/shoutrrr](https://github.com/coollabsio/shoutrrr).

## About Shoutrrr

Shoutrrr is an open-source alternative to Buffer, Typefully, and Hootsuite. It focuses on:

- self-hosting with a single Docker image
- multi-account publishing across supported social networks
- queueing and calendar-based scheduling
- workspace and team workflows
- secure account connections with encrypted tokens
- a managed Cloud option that is coming soon

## Website stack

- [Astro](https://astro.build/) for the site shell and pages
- [Svelte](https://svelte.dev/) for interactive marketing components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) icons

## Project structure

```text
/
├── public/                  Static assets, icons, and manifest files
├── src/
│   ├── components/          Shared Astro components
│   ├── components/marketing Marketing sections and interactive demos
│   ├── layouts/             Base page layout and metadata
│   ├── pages/               Website routes
│   ├── scripts/             Client-side animation helpers
│   └── styles/              Global styles
├── astro.config.mjs         Astro integrations and site config
├── tailwind.config.cjs      Tailwind theme tokens
└── package.json
```

## Development

Install dependencies and start the local dev server:

```sh
npm install
npm run dev
```

The dev server runs at <http://localhost:4321> by default.

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production site to `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro -- --help` | Show Astro CLI help |

## Links

- Website: <https://shoutrrr.com>
- App repository: <https://github.com/coollabsio/shoutrrr>
- Website repository: <https://github.com/coollabsio/shoutrrr.com>

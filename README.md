# Alexandre Mouriec's Personal Website

## GitHub Actions Status
[![GitHub Pages Deployment](https://github.com/mrcalexandre/alexandremouriec.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/mrcalexandre/alexandremouriec.com/actions/workflows/deploy.yml)
[![Bookshelf Update from Goodreads](https://github.com/mrcalexandre/alexandremouriec.com/actions/workflows/bookshelf.yml/badge.svg)](https://github.com/mrcalexandre/alexandremouriec.com/actions/workflows/bookshelf.yml)
[![Webmentions Fetching](https://github.com/mrcalexandre/alexandremouriec.com/actions/workflows/webmentions.yml/badge.svg)](https://github.com/mrcalexandre/alexandremouriec.com/actions/workflows/webmentions.yml)

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                     | Action                                                          |
| :-------------------------- | :-------------------------------------------------------------- |
| `npm install`               | Installs dependencies                                           |
| `npm run dev`               | Starts local dev server at `localhost:4321`                     |
| `npm run build`             | Build your production site to `./dist/`                         |
| `npm run preview`           | Preview your build locally, before deploying                    |
| `npm run astro ...`         | Run CLI commands like `astro add`, `astro check`                |
| `npm run astro -- --help`   | Get help using the Astro CLI                                    |
| `npm optimize:fonts`        | Optimize fonts using glyphhanger                                |
| `npm optimize:images`       | Optimize images using ImageOptim CLI                            |
| `npm run lint`              | Lint project using Eslint                                       |
| `npm run webmentions:send`  | Send Webmentions using @remy/webmention project                 |
| `npm run webmentions:debug` | Fetch Webmentions before sending using @remy/webmention project |

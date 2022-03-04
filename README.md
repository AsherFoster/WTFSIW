# What the fuck should I watch?

## 2.0 goals
- High levels of automation
  - Build & Deploy
  - Dataset updates
  - Dependency upgrades
- Robust unit tests to back these up
- Trying out new tools
  - Prettier
  - Rounding out my eslint config
  - Cloudflare workers
- Doing all of this, while ideally not costing anything
- Making the most of a common search term with good SEO
- Privacy-friendly analytics to feed my curiosity

## Setup
- Clone the repo
- `npm i`
- `npm build`
- Either build the database yourself, or place supplied data files in the `./data` dir
- `npm start`

## Configuration
For runtime config, check out `src/config.ts`

## Building the DB
First, download all the required data files with `./scripts/download.js`
Then import it all into a SQLite DB with `./scripts/import.js`

## Disclaimer
Yeah, this is open souce, but it's a quick and dirty project for an assessment.
Things probably won't work if you try building it from scratch

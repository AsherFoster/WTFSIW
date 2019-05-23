# What the fuck should I watch?
## Setup
- Clone the repo
- `npm i`
- `npm build`
- Either build the database yourself, or place supplied data files in the `./data` dir
- `npm start`

## Markers, listen up
If you're marking this, you probably want to add `?safe=true&debug=true` to the url.
Because it's a minimal site, the default UI doesn't meet the assessment requirements, so must be flagged.

## Configuration
`server.js`
- `process.env.PORT` is used for the port the server starts on

`download.js`
- `process.env.TMDB_API_KEY` is used to access the TMDb API

## Building the DB
First, download all the required data files with `./scripts/download.js`
Then import it all into a SQLite DB with `./scripts/import.js`

## Disclaimer
Yeah, this is open souce, but it's a quick and dirty project for an assessment.
Things probably won't work if you try building it from scratch

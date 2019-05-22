const CONFIG = {
  importCount: 1000, // Download and import this many movies
  apiKey: process.env.TMDB_API_KEY,
  apiBase: 'https://api.themoviedb.org/3',
  outputFile: 'movies.json'
};

const https = require('https');
const fs = require('fs');
const Bottleneck = require('bottleneck/bottleneck');

async function main() {
  let {initialPagination, movies} = await getDiscoverPage(1);
  let page = 2;
  while (movies.length < CONFIG.importCount) {
    let {pagination, movies: newMovies} = await getDiscoverPage(page);
    movies = movies.concat(newMovies);
    console.log(`Page ${page}. ${movies.length} movies so far`);
    page++;
  }

  console.log('Finishing here for some reason?');

  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(movies));
}
async function getDiscoverPage(page) {
  const resp = await apiGet(`/discover/movie`, {
    sort_by: 'popularity.desc',
    page
  });
  let movies = [];
  if(!resp.results) {
    console.error(resp);
  }
  await Promise.all(resp.results.map(async (movie) => {
    movies.push({
      discover: movie,
      ...(await getMovieDetails(movie.id))
    });
    console.log(`${page}/${movie.id}: ${movie.title}`);
  }));
  return {
    movies,
    pagination: {
      page: resp.page,
      total_results: resp.total_results,
      total_pages: resp.total_pages
    }
  };
}

async function getMovieDetails(id) {
  const {cast, crew} = await apiGet(`/movie/${id}/credits`);
  return {cast, crew}
}
async function getGenres() {
  return (await get('/genre/movie/list')).genres;
}

/* Simplifies querying the API. Formats the URL and parses the response */
function _apiGet(method, params = {}) {
  return new Promise(async (resolve, reject) => {
    const url = makeUrl(method, params);
    https.get(url, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve(JSON.parse(body));
      });
    });
  });
}

const limiter = new Bottleneck({
  // reservoir: 40,
  // reservoirIncreaseInterval: 10 * 1000,
  // reservoirIncreaseAmount: 40,

  minTime: 250
});
const apiGet = limiter.wrap(_apiGet);

function makeUrl(method, params) {
  params.api_key = CONFIG.apiKey;
  // Handy one liner from https://stackoverflow.com/a/23639793
  const serializedParams = '?' + Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&');
  return CONFIG.apiBase + method + serializedParams;
}

main();

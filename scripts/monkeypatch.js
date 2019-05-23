const path = require('path');
const sqlite = require('sqlite');
const assert = require('assert');
const movies = require('../data/movies');

const dbPromise = sqlite.open(path.resolve(__dirname, '../data/db.sqlite'));
let db;

// Patches every movie to include the average_rating and release_date
async function patchMovie(id) {
  let movie = movies.find(m => m.discover.id === id);
  if(!movie) {
    console.error(`Failed to find base data for movie ${id}`);
    return false;
  }

  let date = null;
  if(movie.discover.release_date.length === 0) {
    console.log('NO date');
  } else {
    date = new Date(movie.discover.release_date).toISOString()
  }
  let vote = movie.discover.vote_average;
  await db.run('UPDATE movies SET average_rating = ?, release_date = ? WHERE movie_id = ?', vote, date, id);
  console.log(`√ Patched ${id}`)
}

async function main() {
  db = await dbPromise;
  let ids = await db.all(`SELECT movie_id FROM movies`);
  console.log(`Patching ${ids.length} movies`);
  await Promise.all(ids.map(i => patchMovie(i.movie_id)));
  console.log('Done');
}

main();

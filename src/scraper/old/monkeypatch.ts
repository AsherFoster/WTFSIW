import * as path from 'path';
import * as sqlite from 'sqlite';
import {API, DataDump} from '../../types';

const movies: DataDump[] = require('../../data/movies');

const dbPromise = sqlite.open(path.resolve(__dirname, '../../data/db.sqlite'));
let db: sqlite.Database;

// Patches every movie to include the average_rating and release_date
async function addRatingAndRelease(id: number) {
  let movie = movies.find(m => m.discover.id === id);
  if(!movie) {
    console.error(`Failed to find base data for movie ${id}`);
    return false;
  }

  let date = null;
  if(movie.discover.release_date.length === 0) {
    console.log('NO date');
  } else {
    date = new Date(movie.discover.release_date).toISOString();
  }
  let vote = movie.discover.vote_average;
  await db.run('UPDATE movies SET average_rating = ?, release_date = ? WHERE movie_id = ?', vote, date, id);
  console.log(`√ Patched ${id}`);
}
async function addCreditOrders(id: number) {
  let {cast} = movies.find(m => m.discover.id === id) as DataDump;
  if(!cast) return;
  return Promise.all(cast.map(c => {
    if(!c.order && c.order !== 0) console.error(c.credit_id, c.order);
    return db.run('UPDATE credits SET credit_order = ? WHERE credit_id = ?', c.order, c.credit_id);

  }));
}

async function main() {
  db = await dbPromise;
  let ids = await db.all(`SELECT movie_id FROM movies`);
  console.log(`Patching ${ids.length} movies`);
  await Promise.all(ids.map(i => addCreditOrders(i.movie_id)));
  console.log('Done');
}

main();

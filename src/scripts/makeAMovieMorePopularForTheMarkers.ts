import * as sqlite from 'sqlite';
import * as path from "path";

const dbPromise = sqlite.open(path.resolve(__dirname, '../../data/db.sqlite'));

async function main() {
  let db = await dbPromise;
  let rand = await db.get('SELECT movie_id, average_rating FROM movies ORDER BY RANDOM() LIMIT 1');
  let newVal = rand.average_rating + Math.round(Math.random() * 10) / 10;
  console.log(`${rand.movie_id} is now slightly more popular! ${rand.average_rating} -> ${newVal}`);
  await db.run('UPDATE movies SET average_rating = ? WHERE movie_id = ?', newVal, rand.movie_id)
}

main();

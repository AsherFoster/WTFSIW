import * as sqlite from 'sqlite';
import * as path from 'path';
import {Database} from './types';

const dbPromise = sqlite.open(path.resolve(__dirname, '../data/db.sqlite'));
let db: sqlite.Database;

export let GENRE_NAMES = new Map<number, string>();



async function loadGenres(): Promise<void> {
  let dbGenres = await db.all('SELECT * FROM genres') as Database.Genre[]; // It's pretty small, no big deal
  dbGenres.forEach(({genre_id, name}) => GENRE_NAMES.set(genre_id, name));
}

export async function connect(): Promise<sqlite.Database> {
  if (!db) {
    exports.default = db = await dbPromise;
    await loadGenres();
  }
  return db;
}

export default db!; // Not really safe, but if we assume it gets initialised in time, I'm sure it'll be fine

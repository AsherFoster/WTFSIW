import * as sqlite from 'sqlite';
import * as path from 'path';
import * as assert from 'assert';
import {API, DataDump} from '../../types';

const movies: DataDump[] = require('../../data/movies.json');
const BASE_DIR = path.dirname(__filename);
const dbPromise = sqlite.open(BASE_DIR + '/db.sqlite');
let db: sqlite.Database;
let addedPeople = new Set();

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

async function createDb() {
  await db.exec(`
  CREATE TABLE movies (
    movie_id INTEGER NOT NULL PRIMARY KEY,
    title CHAR(70) NOT NULL,
    overview CHAR(1000) NOT NULL,
    poster_url CHAR(32)
  );
  CREATE UNIQUE INDEX index_movies_id ON movies(movie_id);

  CREATE TABLE genres (
    genre_id INT PRIMARY KEY NOT NULL,
    name CHAR(50) NOT NULL
  );
  CREATE TABLE genre_links (
    genre_id INT NOT NULL,
    movie_id INT NOT NULL,
    FOREIGN KEY (genre_id) REFERENCES genres(genre_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
    PRIMARY KEY (genre_id, movie_id)
  );

  CREATE TABLE people (
    person_id INT PRIMARY_KEY NOT NULL,
    name CHAR(50)
  );
  CREATE TABLE credits (
    credit_id CHAR(24) NOT NULL PRIMARY KEY,
    person_id INT NOT NULL,
    job CHAR(64) NOT NULL,
    credit_type CHAR(4) NOT NULL,
    movie_id INT,
    FOREIGN KEY (person_id) REFERENCES people(person_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
  );`);
}
async function doesDbExist() {
  return !!(await db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='movies'"
  ));
}

async function importGenres() {
  const {genres} = require('../genres') as {genres: API.Genre[]};

  const insert = await db.prepare(
    `INSERT INTO genres(genre_id, name) VALUES (?, ?)`
  );
  await Promise.all(genres.map(genre => insert.run(genre.id, genre.name)));
  insert.finalize();

  // Verify it worked
  let count = await db.get(`SELECT count(*) FROM genres`);
  assert.strictEqual(count['count(*)'], genres.length);
}
async function importMovie({discover: movie, cast, crew}: DataDump) {
  let date = new Date(movie.release_date || 0);
  await db.run(
    'INSERT INTO movies(movie_id, title, overview, poster_url, average_rating, release_date) VALUES (?, ?, ?, ?)',
    [
      movie.id,
      movie.title,
      movie.overview,
      movie.poster_path,
      movie.vote_average,
      date,
    ]
  );
  if (cast) await Promise.all(cast.map(c => importCast(c, movie.id)));
  if (crew) await Promise.all(crew.map(c => importCrew(c, movie.id)));

  await Promise.all(movie.genre_ids.map(g => linkGenre(movie.id, g)));
}
function importCast(cast: API.Cast, movieId: number) {
  return importPerson({
    id: cast.credit_id,
    person_id: cast.id,
    movie_id: movieId,
    job: cast.character,
    credit_type: 'cast',
    name: cast.name,
  });
}
function importCrew(crew: API.Crew, movieId: number) {
  return importPerson({
    id: crew.credit_id,
    person_id: crew.id,
    movie_id: movieId,
    job: crew.job,
    credit_type: 'crew',
    name: crew.name,
  });
}
async function importPerson(credit: any) {
  await db.run('INSERT INTO credits VALUES (?, ?, ?, ?, ?)', [
    credit.id,
    credit.person_id,
    credit.job,
    credit.credit_type,
    credit.movie_id,
  ]);
  if (!addedPeople.has(credit.person_id)) {
    // addedPeople.
    db.run('INSERT INTO people VALUES (?, ?)', credit.person_id, credit.name);
  }
}
function linkGenre(movieId: number, genreId: number) {
  return db.run(
    'INSERT INTO genre_links(movie_id, genre_id) VALUES (?, ?)',
    movieId,
    genreId
  );
}

async function main() {
  db = await dbPromise;
  if (await doesDbExist()) {
    console.error(`!!*********************************************************!!
!!  This script will destroy the database in 2 seconds...  !!
!!*********************************************************!!`);
    await sleep(2000);
    const tablesToDelete = [
      'movies',
      'genres',
      'genre_links',
      'people',
      'credits',
    ];
    await Promise.all(
      tablesToDelete.map(t => db.run(`DROP TABLE IF EXISTS ${t}`))
    );
  }

  await createDb();
  console.log('DB Created');

  await importGenres();
  console.log('Genres imported!');

  for (let i = 0; i < movies.length; i++) {
    let movie = movies[i];
    try {
      await importMovie(movie);
      console.log(`√ #${i} ${movie.discover.id}`);
    } catch (e) {
      console.error(
        `X Failed to import ${movie.discover.id} ${movie.discover.title}\n`,
        e,
        e.stack
      );
    }
  }
  console.log('Movies imported!');
}

main();

import * as kv from './kv';
import type {Genre, Movie} from '../shared/database';

interface LoadValues {
  movies: Movie[];
  genres: Genre[];
}
async function load(
  version: number,
  {movies, genres}: LoadValues
): Promise<void> {
  const existingMovies = await kv.get<number[]>(version + '/movies');
  let moviesToLoad = movies;
  if (existingMovies) {
    // Any existingMovies that aren't in movies should be removed
    const moviesToRemove = existingMovies.filter(
      (em) => !movies.find((m) => em === m.id)
    );
    await kv.deleteKeys(moviesToRemove.map((m) => version + '/movie/' + m));
    console.log(`Removed ${moviesToRemove.length} movies`);

    // Any movies that aren't in existingMovies should be added
    moviesToLoad = moviesToLoad.filter((m) => !existingMovies.includes(m.id));

    // Any movies that are in both should be updated
    // TODO update
  }

  const items = [
    ...moviesToLoad.map((m) => [version + '/movie/' + m.id, m]),
    [version + '/movies', movies.map((m) => m.id)],
    [version + '/genres', genres],
  ] as [string, any][];

  console.log(`Writing ${items.length} values to KV`);

  await kv.bulkWrite(items);

  // If we just loaded a new version, update the version and then nuke the old data
  const currentVersion = await kv.get<number>('version');
  if (currentVersion !== version) {
    const oldKeys = await kv.listKeys(currentVersion + '/');
    await kv.deleteKeys(oldKeys);
    console.log(`Deleted ${oldKeys.length} old KV values`);

    await kv.bulkWrite([['version', version]]);
    console.log(`Updated version ${currentVersion} -> ${version}`);
  }
}

export default load;

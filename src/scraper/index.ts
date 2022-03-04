import {getAllTheThings} from './load';

async function main() {
  const {movies, genres, persons} = getAllTheThings();
  // TODO load into KV
}

main();

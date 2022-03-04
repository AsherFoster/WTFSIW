import {getAllTheThings} from './load';

async function main() {
  const {movies, genres, persons} = await getAllTheThings();
  // TODO load into KV
}

main();

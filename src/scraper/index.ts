import extract from './extract';
import load from './load';

async function main() {
  const allTheThings = await extract();
  await load(1, allTheThings);
}

main();

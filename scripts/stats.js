let movies = require('../data/movies');

const stats = {
  maxTitleLength: 0,
  maxOverviewLength: 0,
  maxPersonNameLength: 0,
  maxCrewJobLength: 0,
  maxCastCharacterLength: 0,
  maxPosterLength: 0,
  noCrewCount: 0,
  noCastCount: 0,
  noPosterCount: 0,
  noPersonCount: 0,
  noVoteCount: 0,
  noReleaseCount: 0
};

movies.forEach(movie => {
  stats.maxTitleLength = Math.max(movie.discover.title.length, stats.maxTitleLength);
  stats.maxOverviewLength = Math.max(movie.discover.overview.length, stats.maxOverviewLength);

  if(movie.discover.poster_path)
    stats.maxPosterLength = Math.max(movie.discover.poster_path.length, stats.maxPosterLength);
  else
    stats.noPosterCount++;

  if(typeof movie.discover.vote_average !== 'number')
    stats.noVoteCount++;
  if(typeof movie.discover.release_date !== 'string')
    stats.noReleaseCount++;

  if(movie.crew && movie.crew.length)
    movie.crew.forEach(crew => {
      stats.maxPersonNameLength = Math.max(crew.name.length, stats.maxPersonNameLength);
      stats.maxCrewJobLength = Math.max(crew.job.length, stats.maxCrewJobLength);
      if(!crew.id)
        stats.noPersonCount++;
    });
  else
    stats.noCrewCount++;
  if(movie.cast && movie.cast.length)
    movie.cast.forEach(cast => {
      stats.maxPersonNameLength = Math.max(cast.name.length, stats.maxPersonNameLength);
      stats.maxCastCharacterLength = Math.max(cast.character.length, stats.maxCrewJobLength);
      if(!cast.id)
        stats.noPersonCount++;
    });
  else
    stats.noCastCount++;
});

console.log(stats);

import type {ClientMovie} from '../types/clientapi/Response';

const Movie = ({movie}: {movie: ClientMovie}) => {
  return (
    <div v-if='!error && movie' class='suggestion'>
      <h2>{movie.title}</h2>
      <p class='description'>
          {movie.overview/* | trim(400)*/} -&nbsp;<a href={movie.link}>View on TMDb</a>
      </p>
      <div class='actions'>
        <a href='#' onClick={savePreference(action); reload()} v-for="action of movie.actions">{{action.text}}</a>
        <br />
        <a href='#' @click="reload()">Just give me another {{fuck}}ing movie!</a>
      </div>
    </div>
  )
}

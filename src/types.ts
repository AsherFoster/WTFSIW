
export namespace Database {
  export type Movie = {
    movie_id: number,
    title: string,
    overview: string,
    poster_url: string|null,
    release_date: string,
    average_rating: number
  }
  export type Genre = {
    genre_id: number,
    name: string
  }
  export type GenreLink = {
    genre_id: number,
    movie_id: number
  }
  export type CreditType = 'cast'|'crew';
  export type Credit = {
    credit_id: string,
    person_id: number,
    movie_id: number,
    credit_type: CreditType,
    job: string,
    credit_order: number|null
  }
  export type Person = {
    person_id: number,
    name: string
  }
}

export namespace API {
  export type DiscoverMovie = {
    vote_count: number,
    id: number,
    video: boolean,
    vote_average: number,
    title: string,
    popularity: number,
    poster_path: string|null,
    original_language: string,
    original_title: string,
    genre_ids: number[],
    backdrop_path: string|null,
    adult: boolean,
    overview: string,
    release_date: string
  }
  export type Cast = {
    cast_id: number,
    character: string,
    credit_id: string,
    gender: number,
    id: number,
    name: string,
    order: number,
    profile_path: string|null
  }
  export type Crew = {
    credit_id: string,
    department: string,
    gender: number,
    id: number,
    job: string,
    name: string,
    profile_path: string|null
  }
  export type Genres = {
    name: string,
    id: number
  }
}

export type DataDump = {
  discover: API.DiscoverMovie,
  cast: API.Cast[]|null
  crew: API.Crew[]|null,
}

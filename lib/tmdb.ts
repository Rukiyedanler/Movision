// TMDB API wrapper functions

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "c9d5f0f01b098c021e6964b9fae786dd"
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

// Image sizes: w92, w154, w185, w342, w500, w780, original
export const getImageUrl = (path: string | null, size = "w500") => {
  if (!path) return "/placeholder.svg?height=450&width=300"
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

// Fetch trending movies and TV shows
export async function getTrending(mediaType: "all" | "movie" | "tv" = "all", timeWindow: "day" | "week" = "week") {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_API_KEY}&language=tr-TR&include_adult=false`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch trending content: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching trending content:", error)
    return { results: [] }
  }
}

// Fetch movie details with videos
export async function getMovieDetails(movieId: number) {
  try {
    // First fetch the movie details
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=tr-TR&append_to_response=credits,images,recommendations&include_image_language=tr,null`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.status}`)
    }

    const movieData = await response.json()

    // Then fetch videos separately to ensure we get both Turkish and English videos
    const videosResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`, {
      cache: "no-store",
    })

    if (videosResponse.ok) {
      const videosData = await videosResponse.json()
      movieData.videos = videosData
    }

    return movieData
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error)
    return null
  }
}

// Fetch TV show details with videos
export async function getTvDetails(tvId: number) {
  try {
    // First fetch the TV details
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=tr-TR&append_to_response=credits,images,recommendations&include_image_language=tr,null`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch TV details: ${response.status}`)
    }

    const tvData = await response.json()

    // Then fetch videos separately to ensure we get both Turkish and English videos
    const videosResponse = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/videos?api_key=${TMDB_API_KEY}`, {
      cache: "no-store",
    })

    if (videosResponse.ok) {
      const videosData = await videosResponse.json()
      tvData.videos = videosData
    }

    return tvData
  } catch (error) {
    console.error(`Error fetching TV details for ID ${tvId}:`, error)
    return null
  }
}

// Search for movies and TV shows
export async function searchMulti(query: string, page = 1) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=tr-TR&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error(`Failed to search: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error searching:", error)
    return { results: [] }
  }
}

// Get movie videos (trailers, teasers, etc.)
export async function getMovieVideos(movieId: number) {
  try {
    // First try to get Turkish videos
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch movie videos: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error(`Error fetching movie videos for ID ${movieId}:`, error)
    return { results: [] }
  }
}

// Get TV show videos
export async function getTvVideos(tvId: number) {
  try {
    // First try to get Turkish videos
    const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/videos?api_key=${TMDB_API_KEY}`, { cache: "no-store" })

    if (!response.ok) {
      throw new Error(`Failed to fetch TV videos: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error(`Error fetching TV videos for ID ${tvId}:`, error)
    return { results: [] }
  }
}

// Get popular movies
export async function getPopularMovies(page = 1) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=tr-TR&page=${page}&region=TR&include_adult=false`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch popular movies: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    return { results: [] }
  }
}

// Get popular TV shows
export async function getPopularTvShows(page = 1) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=tr-TR&page=${page}&include_adult=false`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch popular TV shows: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching popular TV shows:", error)
    return { results: [] }
  }
}

// Get upcoming movies
export async function getUpcomingMovies(page = 1) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=tr-TR&page=${page}&region=TR&include_adult=false`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch upcoming movies: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching upcoming movies:", error)
    return { results: [] }
  }
}

// Get movie genres
export async function getMovieGenres() {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=tr-TR`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch movie genres: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching movie genres:", error)
    return { genres: [] }
  }
}

// Get TV show genres
export async function getTvGenres() {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=tr-TR`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch TV genres: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching TV genres:", error)
    return { genres: [] }
  }
}

// Format movie data for our app
export function formatMovieData(movie: any) {
  if (!movie) return null

  // Find trailer - first look for Turkish trailer, then any trailer
  let trailerKey = null
  if (movie.videos && movie.videos.results && movie.videos.results.length > 0) {
    // First look for Turkish Trailer
    const trTrailer = movie.videos.results.find(
      (video: any) =>
        (video.type === "Trailer" || video.type === "Teaser") && video.site === "YouTube" && video.iso_639_1 === "tr",
    )

    // Then look for any Trailer
    const anyTrailer = movie.videos.results.find(
      (video: any) => (video.type === "Trailer" || video.type === "Teaser") && video.site === "YouTube",
    )

    // Finally, just take any YouTube video
    const anyVideo = movie.videos.results.find((video: any) => video.site === "YouTube")

    trailerKey = trTrailer?.key || anyTrailer?.key || anyVideo?.key || null
  }

  // Rest of the function remains the same...
  const director = movie.credits?.crew?.find((person: any) => person.job === "Director")?.name || "N/A"
  const studio =
    movie.production_companies && movie.production_companies.length > 0 ? movie.production_companies[0].name : "N/A"

  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    posterUrl: getImageUrl(movie.poster_path),
    backdropUrl: getImageUrl(movie.backdrop_path, "original"),
    releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A",
    releaseDate: movie.release_date ? new Date(movie.release_date).toLocaleDateString("tr-TR") : "N/A",
    director: director,
    studio: studio,
    duration: movie.runtime ? `${movie.runtime} dakika` : "N/A",
    rating: movie.vote_average?.toFixed(1) || "N/A",
    voteCount: movie.vote_count || 0,
    description: movie.overview || "Açıklama bulunamadı.",
    trailerUrl: trailerKey,
    cast:
      movie.credits?.cast?.slice(0, 8).map((actor: any) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        imageUrl: getImageUrl(actor.profile_path, "w185"),
      })) || [],
    genres: movie.genres?.map((genre: any) => genre.name) || [],
    genreIds: movie.genres?.map((genre: any) => genre.id) || movie.genre_ids || [],
    popularity: movie.popularity || 0,
    adult: movie.adult || false,
    recommendations:
      movie.recommendations?.results?.slice(0, 6).map((rec: any) => ({
        id: rec.id,
        title: rec.title,
        posterUrl: getImageUrl(rec.poster_path),
        releaseYear: rec.release_date ? new Date(rec.release_date).getFullYear() : "N/A",
        type: "movie",
        rating: rec.vote_average?.toFixed(1) || "N/A",
      })) || [],
  }
}

// Format TV show data for our app
export function formatTvData(tv: any) {
  if (!tv) return null

  // Find trailer - first look for Turkish trailer, then any trailer
  let trailerKey = null
  if (tv.videos && tv.videos.results && tv.videos.results.length > 0) {
    // First look for Turkish Trailer
    const trTrailer = tv.videos.results.find(
      (video: any) =>
        (video.type === "Trailer" || video.type === "Teaser") && video.site === "YouTube" && video.iso_639_1 === "tr",
    )

    // Then look for any Trailer
    const anyTrailer = tv.videos.results.find(
      (video: any) => (video.type === "Trailer" || video.type === "Teaser") && video.site === "YouTube",
    )

    // Finally, just take any YouTube video
    const anyVideo = tv.videos.results.find((video: any) => video.site === "YouTube")

    trailerKey = trTrailer?.key || anyTrailer?.key || anyVideo?.key || null
  }

  // Rest of the function remains the same...
  const creator = tv.created_by && tv.created_by.length > 0 ? tv.created_by[0].name : "N/A"
  const studio = tv.networks && tv.networks.length > 0 ? tv.networks[0].name : "N/A"

  return {
    id: tv.id,
    title: tv.name,
    originalTitle: tv.original_name,
    posterUrl: getImageUrl(tv.poster_path),
    backdropUrl: getImageUrl(tv.backdrop_path, "original"),
    releaseYear: tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : "N/A",
    releaseDate: tv.first_air_date ? new Date(tv.first_air_date).toLocaleDateString("tr-TR") : "N/A",
    creator: creator,
    studio: studio,
    seasons: tv.number_of_seasons || "N/A",
    episodes: tv.number_of_episodes || "N/A",
    rating: tv.vote_average?.toFixed(1) || "N/A",
    voteCount: tv.vote_count || 0,
    description: tv.overview || "Açıklama bulunamadı.",
    trailerUrl: trailerKey,
    cast:
      tv.credits?.cast?.slice(0, 8).map((actor: any) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        imageUrl: getImageUrl(actor.profile_path, "w185"),
      })) || [],
    genres: tv.genres?.map((genre: any) => genre.name) || [],
    genreIds: tv.genres?.map((genre: any) => genre.id) || tv.genre_ids || [],
    popularity: tv.popularity || 0,
    adult: tv.adult || false,
    recommendations:
      tv.recommendations?.results?.slice(0, 6).map((rec: any) => ({
        id: rec.id,
        title: rec.name,
        posterUrl: getImageUrl(rec.poster_path),
        releaseYear: rec.first_air_date ? new Date(rec.first_air_date).getFullYear() : "N/A",
        type: "tv",
        rating: rec.vote_average?.toFixed(1) || "N/A",
      })) || [],
  }
}

// Format search results
export function formatSearchResult(item: any) {
  if (!item) return null

  if (item.media_type === "movie") {
    return {
      id: item.id,
      title: item.title,
      originalTitle: item.original_title,
      posterUrl: getImageUrl(item.poster_path),
      backdropUrl: getImageUrl(item.backdrop_path),
      releaseYear: item.release_date ? new Date(item.release_date).getFullYear() : "N/A",
      type: "movie",
      rating: item.vote_average?.toFixed(1) || "N/A",
      genreIds: item.genre_ids || [],
      description: item.overview || "",
    }
  } else if (item.media_type === "tv") {
    return {
      id: item.id,
      title: item.name,
      originalTitle: item.original_name,
      posterUrl: getImageUrl(item.poster_path),
      backdropUrl: getImageUrl(item.backdrop_path),
      releaseYear: item.first_air_date ? new Date(item.first_air_date).getFullYear() : "N/A",
      type: "tv",
      rating: item.vote_average?.toFixed(1) || "N/A",
      genreIds: item.genre_ids || [],
      description: item.overview || "",
    }
  }
  return null
}

// Format movie list item
export function formatMovieListItem(movie: any) {
  if (!movie) return null

  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    posterUrl: getImageUrl(movie.poster_path),
    backdropUrl: getImageUrl(movie.backdrop_path),
    releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A",
    releaseDate: movie.release_date ? new Date(movie.release_date).toLocaleDateString("tr-TR") : "N/A",
    type: "movie",
    rating: movie.vote_average?.toFixed(1) || "N/A",
    voteCount: movie.vote_count || 0,
    genreIds: movie.genre_ids || [],
    description: movie.overview || "",
    popularity: movie.popularity || 0,
    adult: movie.adult || false,
  }
}

// Format TV show list item
export function formatTvListItem(tv: any) {
  if (!tv) return null

  return {
    id: tv.id,
    title: tv.name,
    originalTitle: tv.original_name,
    posterUrl: getImageUrl(tv.poster_path),
    backdropUrl: getImageUrl(tv.backdrop_path),
    releaseYear: tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : "N/A",
    releaseDate: tv.first_air_date ? new Date(tv.first_air_date).toLocaleDateString("tr-TR") : "N/A",
    type: "tv",
    rating: tv.vote_average?.toFixed(1) || "N/A",
    voteCount: tv.vote_count || 0,
    genreIds: tv.genre_ids || [],
    description: tv.overview || "",
    popularity: tv.popularity || 0,
    adult: tv.adult || false,
  }
}

// Discover movies with filters
export async function discoverMovies(params: Record<string, string | number>) {
  try {
    const queryParams = new URLSearchParams()

    // Add API key and language
    queryParams.append("api_key", TMDB_API_KEY)
    queryParams.append("language", "tr-TR")
    queryParams.append("include_adult", "false")

    // Add all other params
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, String(value))
    })

    const response = await fetch(`${TMDB_BASE_URL}/discover/movie?${queryParams.toString()}`, { cache: "no-store" })

    if (!response.ok) {
      throw new Error(`Failed to discover movies: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error discovering movies:", error)
    return { results: [] }
  }
}

// Discover TV shows with filters
export async function discoverTvShows(params: Record<string, string | number>) {
  try {
    const queryParams = new URLSearchParams()

    // Add API key and language
    queryParams.append("api_key", TMDB_API_KEY)
    queryParams.append("language", "tr-TR")
    queryParams.append("include_adult", "false")

    // Add all other params
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, String(value))
    })

    const response = await fetch(`${TMDB_BASE_URL}/discover/tv?${queryParams.toString()}`, { cache: "no-store" })

    if (!response.ok) {
      throw new Error(`Failed to discover TV shows: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error discovering TV shows:", error)
    return { results: [] }
  }
}

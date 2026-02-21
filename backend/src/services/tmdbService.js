const axios = require("axios");
const config = require("../config");

const tmdb = axios.create({
  baseURL: config.tmdbBaseUrl,
  params: { api_key: config.tmdbApiKey },
  timeout: 10000,
});

const tmdbService = {
  
  async searchMovies(query, page = 1, language = "en-US") {
    const { data } = await tmdb.get("/search/movie", {
      params: { query, page, language },
    });
    return data;
  },

  async searchTV(query, page = 1, language = "en-US") {
    const { data } = await tmdb.get("/search/tv", {
      params: { query, page, language },
    });
    return data;
  },

  async searchMulti(query, page = 1, language = "en-US") {
    const { data } = await tmdb.get("/search/multi", {
      params: { query, page, language },
    });
    return data;
  },

  
  async getMovieDetails(tmdbId, language = "en-US") {
    const { data } = await tmdb.get(`/movie/${tmdbId}`, {
      params: { language, append_to_response: "credits,videos" },
    });
    return data;
  },

  async getTVDetails(tmdbId, language = "en-US") {
    const { data } = await tmdb.get(`/tv/${tmdbId}`, {
      params: { language, append_to_response: "credits,videos" },
    });
    return data;
  },

  
  async getPopularMovies(page = 1, language = "en-US") {
    const { data } = await tmdb.get("/movie/popular", {
      params: { page, language },
    });
    return data;
  },

  async getPopularTV(page = 1, language = "en-US") {
    const { data } = await tmdb.get("/tv/popular", {
      params: { page, language },
    });
    return data;
  },

  async getTrending(mediaType = "all", timeWindow = "week", page = 1) {
    const { data } = await tmdb.get(`/trending/${mediaType}/${timeWindow}`, {
      params: { page },
    });
    return data;
  },

  async getTopRatedMovies(page = 1, language = "en-US") {
    const { data } = await tmdb.get("/movie/top_rated", {
      params: { page, language },
    });
    return data;
  },

  async getTopRatedTV(page = 1, language = "en-US") {
    const { data } = await tmdb.get("/tv/top_rated", {
      params: { page, language },
    });
    return data;
  },

  async getNowPlayingMovies(page = 1, language = "en-US") {
    const { data } = await tmdb.get("/movie/now_playing", {
      params: { page, language },
    });
    return data;
  },

  async getUpcomingMovies(page = 1, language = "en-US") {
    const { data } = await tmdb.get("/movie/upcoming", {
      params: { page, language },
    });
    return data;
  },

  
  async getMovieGenres(language = "en-US") {
    const { data } = await tmdb.get("/genre/movie/list", {
      params: { language },
    });
    return data.genres;
  },

  async getTVGenres(language = "en-US") {
    const { data } = await tmdb.get("/genre/tv/list", { params: { language } });
    return data.genres;
  },

  
  async discoverMovies(params = {}) {
    const { data } = await tmdb.get("/discover/movie", { params });
    return data;
  },

  async discoverTV(params = {}) {
    const { data } = await tmdb.get("/discover/tv", { params });
    return data;
  },
};

module.exports = tmdbService;
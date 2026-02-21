const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = this.getToken();
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Armazena o token JWT no localStorage
   */
  setToken(token) {
    localStorage.setItem('authToken', token);
    this.token = token;
  }

  /**
   * Remove o token JWT do localStorage
   */
  clearToken() {
    localStorage.removeItem('authToken');
    this.token = null;
  }

  /**
   * Headers padrão para requisições
   */
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Faz uma requisição genérica à API
   * @param {string} method - GET, POST, PUT, DELETE, PATCH
   * @param {string} endpoint - URL relativa (ex: /movies)
   * @param {object} data - Dados para enviar (POST/PUT/PATCH)
   * @param {string} customURL - URL completa customizada (opcional)
   */
  async request(method, endpoint, data = null, customURL = null) {
    const url = customURL || `${this.baseURL}${endpoint}`;

    const config = {
      method,
      headers: this.getHeaders(),
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);

      // Se não autenticado, limpa token e redireciona
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login.html';
        return null;
      }

      const result = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: result.error || 'Erro na requisição',
          data: result,
        };
      }

      return result;
    } catch (error) {
      console.error(`Erro na requisição ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * GET - Listar ou buscar dados
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request('GET', url);
  }

  /**
   * POST - Criar novo recurso
   */
  async post(endpoint, data = {}) {
    return this.request('POST', endpoint, data);
  }

  /**
   * PUT - Atualizar recurso
   */
  async put(endpoint, data = {}) {
    return this.request('PUT', endpoint, data);
  }

  /**
   * PATCH - Atualizar parcial
   */
  async patch(endpoint, data = {}) {
    return this.request('PATCH', endpoint, data);
  }

  /**
   * DELETE - Deletar recurso
   */
  async delete(endpoint) {
    return this.request('DELETE', endpoint);
  }

  // ============ AUTENTICAÇÃO ============

  /**
   * POST /api/auth/register
   */
  async register(username, email, password) {
    return this.post('/auth/register', { username, email, password });
  }

  /**
   * POST /api/auth/login
   */
  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  /**
   * GET /api/auth/me
   */
  async getCurrentUser() {
    return this.get('/auth/me');
  }

  /**
   * PUT /api/auth/me
   */
  async updateProfile(username = null, password = null, avatar = null) {
    const data = {};
    if (username) data.username = username;
    if (password) data.password = password;
    if (avatar) data.avatar = avatar;
    return this.put('/auth/me', data);
  }

  // ============ FILMES ============

  /**
   * GET /api/movies
   */
  async getMovies(page = 1, limit = 20, sort = 'created_at', order = 'DESC', media_type = null, search = null, year = null, genre = null) {
    const params = { page, limit, sort, order };
    if (media_type) params.media_type = media_type;
    if (search) params.search = search;
    if (year) params.year = year;
    if (genre) params.genre = genre;
    return this.get('/movies', params);
  }

  /**
   * GET /api/movies/:id
   */
  async getMovieById(id) {
    return this.get(`/movies/${id}`);
  }

  /**
   * POST /api/movies/import/:mediaType/:tmdbId
   */
  async importMovie(mediaType, tmdbId) {
    return this.post(`/movies/import/${mediaType}/${tmdbId}`);
  }

  /**
   * GET /api/movies/genres/available
   */
  async getAvailableGenres() {
    return this.get('/movies/genres/available');
  }

  /**
   * GET /api/movies/years/available
   */
  async getAvailableYears() {
    return this.get('/movies/years/available');
  }

  // ============ FAVORITOS ============

  /**
   * GET /api/favorites
   */
  async getFavorites(page = 1, limit = 20) {
    return this.get('/favorites', { page, limit });
  }

  /**
   * POST /api/favorites/:movieId
   */
  async addFavorite(movieId) {
    return this.post(`/favorites/${movieId}`);
  }

  /**
   * DELETE /api/favorites/:movieId
   */
  async removeFavorite(movieId) {
    return this.delete(`/favorites/${movieId}`);
  }

  /**
   * GET /api/favorites/check/:movieId
   */
  async checkFavorite(movieId) {
    return this.get(`/favorites/check/${movieId}`);
  }

  // ============ REVIEWS ============

  /**
   * GET /api/reviews/movie/:movieId
   */
  async getReviews(movieId, page = 1, limit = 20, sort = 'newest') {
    return this.get(`/reviews/movie/${movieId}`, { page, limit, sort });
  }

  /**
   * POST /api/reviews
   */
  async createReview(movie_id, rating, title = '', content = '', contains_spoilers = false) {
    return this.post('/reviews', {
      movie_id,
      rating,
      title,
      content,
      contains_spoilers,
    });
  }

  /**
   * PUT /api/reviews/:id
   */
  async updateReview(reviewId, rating, title = '', content = '', contains_spoilers = false) {
    return this.put(`/reviews/${reviewId}`, {
      rating,
      title,
      content,
      contains_spoilers,
    });
  }

  /**
   * DELETE /api/reviews/:id
   */
  async deleteReview(reviewId) {
    return this.delete(`/reviews/${reviewId}`);
  }

  /**
   * POST /api/reviews/:id/vote
   */
  async voteReview(reviewId, voteType) {  // voteType: 'up' ou 'down'
    return this.post(`/reviews/${reviewId}/vote`, { vote_type: voteType });
  }

  // ============ LISTAS ============

  /**
   * GET /api/lists
   */
  async getLists(page = 1, limit = 20) {
    return this.get('/lists', { page, limit });
  }

  /**
   * GET /api/lists/watchlist/default
   */
  async getWatchlistDefault() {
    return this.get('/lists/watchlist/default');
  }

  /**
   * POST /api/lists
   */
  async createList(name, description = '', is_public = false) {
    return this.post('/lists', { name, description, is_public });
  }

  /**
   * PUT /api/lists/:id
   */
  async updateList(listId, name = null, description = null, is_public = null) {
    const data = {};
    if (name) data.name = name;
    if (description !== null) data.description = description;
    if (is_public !== null) data.is_public = is_public;
    return this.put(`/lists/${listId}`, data);
  }

  /**
   * DELETE /api/lists/:id
   */
  async deleteList(listId) {
    return this.delete(`/lists/${listId}`);
  }

  /**
   * POST /api/lists/:id/items
   */
  async addListItem(listId, movieId, notes = '') {
    return this.post(`/lists/${listId}/items`, { movie_id: movieId, notes });
  }

  /**
   * DELETE /api/lists/:id/items/:itemId
   */
  async removeListItem(listId, itemId) {
    return this.delete(`/lists/${listId}/items/${itemId}`);
  }

  /**
   * Verifica se um filme está na watchlist
   */
  async isMovieInWatchlist(movieId) {
    try {
      const watchlist = await this.getWatchlistDefault();
      const fullList = await this.get(`/lists/${watchlist.id}`);
      if (fullList && fullList.items) {
        const item = fullList.items.find(i => i.movie_id === movieId);
        return item ? item.id : null;
      }
    } catch (err) {
      return null;
    }
    return null;
  }

  // ============ TMDB ============

  /**
   * GET /api/tmdb/search
   */
  async searchTMDB(query, type = 'multi', page = 1) {
    return this.get('/tmdb/search', { query, type, page });
  }

  /**
   * GET /api/tmdb/:type/:id
   */
  async getTMDBDetails(type, id) {
    return this.get(`/tmdb/${type}/${id}`);
  }
}

// Instância global da API
const api = new ApiService();


const { sequelize, User, Movie, List, ListItem, Review } = require("../models");

const SAMPLE_MOVIES = [
  {
    tmdb_id: 550,
    title: "O clube da luta",
    original_title: "Fight Club",
    overview:
      "Um funcionário de uma seguradora de perdas cíclicas conhece um misterioso fabricante de sabonetes e juntos criam um clube de luta clandestino que se transforma em algo muito maior.",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop_path: "/hZkgoQYus5dXo3H8T7Uef6DNknP.jpg",
    release_date: "1999-10-15",
    vote_average: 8.4,
    vote_count: 26280,
    popularity: 61.4,
    genres: [{ id: 18, name: "Drama" }],
    media_type: "movie",
    runtime: 139,
    status: "Released",
    tagline: "Mischief. Mayhem. Soap.",
    original_language: "en",
  },
  {
    tmdb_id: 680,
    title: "Pulp Fiction",
    original_title: "Pulp Fiction",
    overview:
      "Um grupo de criminosos e assassinos se encontram em uma série de eventos que se entrelaçam em quatro histórias de violência e redenção.",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    release_date: "1994-09-10",
    vote_average: 8.5,
    vote_count: 25000,
    popularity: 70.2,
    genres: [
      { id: 80, name: "Crime" },
      { id: 53, name: "Thriller" },
    ],
    media_type: "movie",
    runtime: 154,
    status: "Released",
    tagline:
      "Just because you are a character doesn't mean you have character.",
    original_language: "en",
  },
  {
    tmdb_id: 278,
    title: "O Resgate do Shawshank",
    original_title: "The Shawshank Redemption",
    overview:
      "Um banqueiro encarcerado em Shawshank se dedica a ajudar outros presos e constrói uma nova vida.",
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    release_date: "1994-09-23",
    vote_average: 8.7,
    vote_count: 23500,
    popularity: 80.1,
    genres: [
      { id: 18, name: "Drama" },
      { id: 80, name: "Crime" },
    ],
    media_type: "movie",
    runtime: 142,
    status: "Released",
    tagline: "Fear can hold you prisoner. Hope can set you free.",
    original_language: "en",
  },
  {
    tmdb_id: 238,
    title: "O Padrinho",
    original_title: "The Godfather",
    overview:
      "Abrangendo os anos de 1945 a 1955, uma crônica da fictícia família criminosa ítalo-americana Corleone.",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdrop_path: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    release_date: "1972-03-14",
    vote_average: 8.7,
    vote_count: 18000,
    popularity: 88.5,
    genres: [
      { id: 18, name: "Drama" },
      { id: 80, name: "Crime" },
    ],
    media_type: "movie",
    runtime: 175,
    status: "Released",
    tagline: "An offer you can't refuse.",
    original_language: "en",
  },
  {
    tmdb_id: 155,
    title: "Batman: O Cavaleiro das Trevas",
    original_title: "The Dark Knight",
    overview:
      "Quando o crime organizado em Gotham City é liderado por um criminoso conhecido como Coringa, Batman deve aceitar um dos maiores testes de sua capacidade de combater o crime.",
    poster_path: "/qJ2tW6WMUDux911Bw13lnGjmk.jpg",
    backdrop_path: "/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
    release_date: "2008-07-16",
    vote_average: 8.5,
    vote_count: 30000,
    popularity: 75.3,
    genres: [
      { id: 28, name: "Action" },
      { id: 18, name: "Drama" },
      { id: 80, name: "Crime" },
    ],
    media_type: "movie",
    runtime: 152,
    status: "Released",
    tagline: "Why So Serious?",
    original_language: "en",
  },
  {
    tmdb_id: 1396,
    title: "Breaking Bad",
    original_title: "Breaking Bad",
    overview:
      "Um professor de química diagnosticado com câncer de pulmão se dedica à fabricação e venda de metanfetamina.",
    poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    release_date: null,
    vote_average: 8.9,
    vote_count: 12000,
    popularity: 200.3,
    genres: [
      { id: 18, name: "Drama" },
      { id: 80, name: "Crime" },
    ],
    media_type: "tv",
    runtime: null,
    status: "Ended",
    tagline: "Change the equation.",
    original_language: "en",
    number_of_seasons: 5,
    number_of_episodes: 62,
    first_air_date: "2008-01-20",
    last_air_date: "2013-09-29",
  },
  {
    tmdb_id: 1399,
    title: "Game of Thrones",
    original_title: "Game of Thrones",
    overview:
      "Nove famílias nobres lutam pelo controle das terras de Westeros, enquanto uma antiga ameaça retorna após séculos de dormência.",
    poster_path: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
    backdrop_path: "/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
    release_date: null,
    vote_average: 8.4,
    vote_count: 20000,
    popularity: 350.1,
    genres: [
      { id: 10765, name: "Sci-Fi & Fantasy" },
      { id: 18, name: "Drama" },
    ],
    media_type: "tv",
    runtime: null,
    status: "Ended",
    tagline: "Winter Is Coming.",
    original_language: "en",
    number_of_seasons: 8,
    number_of_episodes: 73,
    first_air_date: "2011-04-17",
    last_air_date: "2019-05-19",
  },
  {
    tmdb_id: 76479,
    title: "The Boys",
    original_title: "The Boys",
    overview:
      "Um grupo de vigilantes decide derrubar super-heróis corruptos que abusam de seus superpoderes.",
    poster_path: "/stTEycfG9928HYGEISBFaG1ngjM.jpg",
    backdrop_path: "/7nKezMz3UEBqkFDNLH2v7ZHDQ2y.jpg",
    release_date: null,
    vote_average: 8.5,
    vote_count: 8500,
    popularity: 180.5,
    genres: [
      { id: 10765, name: "Sci-Fi & Fantasy" },
      { id: 10759, name: "Action & Adventure" },
    ],
    media_type: "tv",
    runtime: null,
    status: "Returning Series",
    tagline: "Never meet your heroes.",
    original_language: "en",
    number_of_seasons: 4,
    number_of_episodes: 32,
    first_air_date: "2019-07-25",
    last_air_date: "2024-07-18",
  },
];

async function seed() {
  try {
    console.log("Syncing database (force recreate)…"); 
    const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;
    const { Sequelize: Seq } = require("sequelize");
    const tmpSeq = new Seq("", DB_USER || "root", DB_PASSWORD || "", {
      host: DB_HOST || "localhost",
      port: parseInt(DB_PORT) || 3306,
      dialect: "mysql",
      logging: false,
    });
    await tmpSeq.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME || "films_db"}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );
    await tmpSeq.close();
    await sequelize.sync({ force: true });

    console.log("Criar Utilizadores…");
    const admin = await User.create({
      username: "admin",
      email: "admin@filmesapi.com",
      password: "Admin@123",
      role: "admin",
    });
    const alice = await User.create({
      username: "alice",
      email: "alice@filmesapi.com",
      password: "Alice@123",
      role: "user",
    });
    const bob = await User.create({
      username: "bob",
      email: "bob@filmesapi.com",
      password: "Bob@1234",
      role: "user",
    });

    console.log("Filmes e séries");
    const movies = [];
    for (const m of SAMPLE_MOVIES) {
      const movie = await Movie.create(m);
      movies.push(movie);
    }

    console.log("Criar favoritos…");
    await alice.addFavoriteMovies([movies[0], movies[2], movies[5]]);
    await bob.addFavoriteMovies([movies[1], movies[3], movies[6]]);

    console.log("Criar listas…");
    const aliceList = await List.create({
      user_id: alice.id,
      name: "Top Crime Dramas",
      description: "Meus filmes de crime e drama favoritos",
      is_public: true,
    });
    await aliceList.addMovies([movies[1], movies[2], movies[3], movies[5]]);

    const bobList = await List.create({
      user_id: bob.id,
      name: "Fim de semana bomm",
      description: "Filmes e séries para maratonar no fim de semana",
      is_public: true,
    });
    await bobList.addMovies([movies[5], movies[6], movies[7]]);

    console.log("  Criar reviews…  ");
    await Review.bulkCreate([
      {
        user_id: alice.id,
        movie_id: movies[0].id,
        rating: 5,
        title: "Os melhores filmes de todos os tempos",
        content: "Este é um dos melhores filmes de todos os tempos. A reviravolta é incrível.",
        contains_spoilers: false,
      },
      {
        user_id: alice.id,
        movie_id: movies[5].id,
        rating: 5,
        title: "Perfeito",
        content:
          "Breaking Bad é uma obra-prima. A evolução de Walter White é fascinante de assistir.",
        contains_spoilers: false,
      },
      {
        user_id: bob.id,
        movie_id: movies[0].id,
        rating: 4.5,
        title: "Filme incrível",
        content: "Realmente gostei da história e da atuação.",
        contains_spoilers: false,
      },
      {
        user_id: bob.id,
        movie_id: movies[3].id,
        rating: 5,
        title: "Classicos Antigos",
        content: "O Godfather é cinema em sua melhor forma.",
        contains_spoilers: false,
      },
      {
        user_id: admin.id,
        movie_id: movies[4].id,
        rating: 4.5,
        title: "Melhor filme de super-herói",
        content: "Heath Ledger entrega uma performance inesquecível.",
        contains_spoilers: false,
      },
    ]);

    
  } catch (err) {
    console.error(" Erro:", err);
    process.exit(1);
  }
}

seed();
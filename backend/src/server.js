require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const { sequelize } = require("./models");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const tmdbRoutes = require("./routes/tmdb");
const favoriteRoutes = require("./routes/favorites");
const listRoutes = require("./routes/lists");
const reviewRoutes = require("./routes/reviews");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições, tente novamente mais tarde." },
});
app.use("/api/", limiter);

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/tmdb", tmdbRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    name: "Films API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      movies: "/api/movies",
      tmdb: "/api/tmdb",
      favorites: "/api/favorites",
      lists: "/api/lists",
      reviews: "/api/reviews",
      admin: "/api/admin",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.use(errorHandler);

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Banco conectado");

    await sequelize.sync({ alter: true });
    console.log("Modelos sincronizados");

    app.listen(config.port, () => {
      console.log(`Api rodando em: http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  }
}

start();

module.exports = app;
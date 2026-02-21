const express = require("express");
const {
  User,
  Movie,
  Review,
  List,
  Favorite,
  ReviewVote,
  ListItem,
} = require("../models");
const { authenticate, adminOnly } = require("../middleware/auth");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

const router = express.Router();

router.use(authenticate, adminOnly);

router.get("/users", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.json({
      results: rows,
      page,
      total_pages: Math.ceil(count / limit),
      total_results: count,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const [reviewCount, listCount, favoriteCount] = await Promise.all([
      Review.count({ where: { user_id: user.id } }),
      List.count({ where: { user_id: user.id } }),
      Favorite.count({ where: { user_id: user.id } }),
    ]);

    res.json({
      user,
      activity: {
        reviews: reviewCount,
        lists: listCount,
        favorites: favoriteCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.put("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { role, is_active } = req.body;
    if (role !== undefined) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;

    await user.save();
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await ReviewVote.destroy({ where: { user_id: user.id } });
    await Review.destroy({ where: { user_id: user.id } });
    await Favorite.destroy({ where: { user_id: user.id } });
    const userLists = await List.findAll({ where: { user_id: user.id } });
    for (const l of userLists) {
      await ListItem.destroy({ where: { list_id: l.id } });
    }
    await List.destroy({ where: { user_id: user.id } });
    await user.destroy();

    res.json({ message: "Usuario deletado" });
  } catch (err) {
    next(err);
  }
});

router.get("/movies", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const where = {};

    if (req.query.search) {
      where.title = { [Op.like]: `%${req.query.search}%` };
    }
    if (req.query.media_type) {
      where.media_type = req.query.media_type;
    }

    const { count, rows } = await Movie.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.json({
      results: rows,
      page,
      total_pages: Math.ceil(count / limit),
      total_results: count,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/movies/:id", async (req, res, next) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    const allowedFields = [
      "title",
      "overview",
      "poster_path",
      "backdrop_path",
      "status",
      "tagline",
      "genres",
      "runtime",
      "release_date",
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        movie[field] = req.body[field];
      }
    }

    await movie.save();
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

router.delete("/movies/:id", async (req, res, next) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    const reviews = await Review.findAll({ where: { movie_id: movie.id } });
    for (const r of reviews) {
      await ReviewVote.destroy({ where: { review_id: r.id } });
    }
    await Review.destroy({ where: { movie_id: movie.id } });
    await Favorite.destroy({ where: { movie_id: movie.id } });
    await ListItem.destroy({ where: { movie_id: movie.id } });
    await movie.destroy();

    res.json({ message: "Filme deletado" });
  } catch (err) {
    next(err);
  }
});

router.get("/reviews", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      include: [
        { model: User, as: "author", attributes: ["id", "username"] },
        { model: Movie, attributes: ["id", "title", "media_type"] },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.json({
      results: rows,
      page,
      total_pages: Math.ceil(count / limit),
      total_results: count,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
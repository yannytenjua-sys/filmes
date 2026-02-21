const express = require("express");
const { body } = require("express-validator");
const { Review, ReviewVote, Movie, User } = require("../models");
const { authenticate, optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { Op } = require("sequelize");

const router = express.Router();

router.get("/movie/:movieId", optionalAuth, async (req, res, next) => {
  try {
    const movieId = req.params.movieId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    let order;
    switch (req.query.sort) {
      case "oldest":
        order = [["created_at", "ASC"]];
        break;
      case "highest":
        order = [["rating", "DESC"]];
        break;
      case "lowest":
        order = [["rating", "ASC"]];
        break;
      case "most_voted":
        order = [["upvotes", "DESC"]];
        break;
      default:
        order = [["created_at", "DESC"]];
    }

    const { count, rows } = await Review.findAndCountAll({
      where: { movie_id: movieId },
      include: [
        { model: User, as: "author", attributes: ["id", "username", "avatar"] },
      ],
      limit,
      offset,
      order,
    });

    const allReviews = await Review.findAll({
      where: { movie_id: movieId },
      attributes: ["rating"],
    });
    const avgRating = allReviews.length
      ? (
          allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        ).toFixed(2)
      : null;

    res.json({
      results: rows,
      average_rating: avgRating ? parseFloat(avgRating) : null,
      total_reviews: count,
      page,
      total_pages: Math.ceil(count / limit),
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authenticate,
  [
    body("movie_id").isInt().withMessage("movie_id deve ser um inteiro"),
    body("rating")
      .isFloat({ min: 0, max: 5.0 })
      .withMessage("avaliação deve ser um número entre 0 e 5"),
    body("title").optional().isString().isLength({ max: 200 }),
    body("content").optional().isString(),
    body("contains_spoilers").optional().isBoolean(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { movie_id, rating, title, content, contains_spoilers } = req.body;

      const movie = await Movie.findByPk(movie_id);
      if (!movie)
        return res.status(404).json({ error: "Filme não encontrado" });

      let review = await Review.findOne({
        where: { user_id: req.user.id, movie_id },
      });

      if (review) {
        review.rating = rating;
        if (title !== undefined) review.title = title;
        if (content !== undefined) review.content = content;
        if (contains_spoilers !== undefined)
          review.contains_spoilers = contains_spoilers;
        await review.save();
        return res.json({ message: "Review atualizada", review });
      }

      review = await Review.create({
        user_id: req.user.id,
        movie_id,
        rating,
        title,
        content,
        contains_spoilers: contains_spoilers || false,
      });

      res.status(201).json({ message: "Review criada", review });
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review)
      return res.status(404).json({ error: "Review não encontrada" });
    if (review.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Não autorizado" });
    }

    await ReviewVote.destroy({ where: { review_id: review.id } });
    await review.destroy();
    res.json({ message: "Review deletada" });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/vote",
  authenticate,
  [
    body("vote")
      .isIn(["up", "down"])
      .withMessage('Voto deve ser "up" ou "down"'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const review = await Review.findByPk(req.params.id);
      if (!review)
        return res.status(404).json({ error: "Review não encontrada" });

      if (review.user_id === req.user.id) {
        return res
          .status(400)
          .json({ error: "Não é possível votar em sua própria review" });
      }

      const { vote } = req.body;

      let existingVote = await ReviewVote.findOne({
        where: { user_id: req.user.id, review_id: review.id },
      });

      if (existingVote) {
        if (existingVote.vote === "up")
          review.upvotes = Math.max(0, review.upvotes - 1);
        else review.downvotes = Math.max(0, review.downvotes - 1);

        if (existingVote.vote === vote) {
          await existingVote.destroy();
          await review.save();
          return res.json({
            message: "Voto removido",
            upvotes: review.upvotes,
            downvotes: review.downvotes,
          });
        }

        existingVote.vote = vote;
        await existingVote.save();
      } else {
        existingVote = await ReviewVote.create({
          user_id: req.user.id,
          review_id: review.id,
          vote,
        });
      }

      if (vote === "up") review.upvotes += 1;
      else review.downvotes += 1;

      await review.save();

      res.json({
        message: "Voto registrado",
        vote,
        upvotes: review.upvotes,
        downvotes: review.downvotes,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/user/:userId", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      where: { user_id: req.params.userId },
      include: [
        { model: Movie },
        { model: User, as: "author", attributes: ["id", "username", "avatar"] },
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
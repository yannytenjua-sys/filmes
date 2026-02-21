const express = require("express");
const { body } = require("express-validator");
const { List, ListItem, Movie, User } = require("../models");
const { authenticate, optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = { is_public: true };

    const { count, rows } = await List.findAndCountAll({
      where,
      include: [
        { model: User, as: "owner", attributes: ["id", "username", "avatar"] },
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

router.get("/mine", authenticate, async (req, res, next) => {
  try {
    const lists = await List.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: ListItem,
          as: "items",
          include: [{ model: Movie }],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json(lists);
  } catch (err) {
    next(err);
  }
});

router.get("/watchlist/default", authenticate, async (req, res, next) => {
  try {
    let watchlist = await List.findOne({
      where: { user_id: req.user.id, name: "Watchlist" },
    });

    if (!watchlist) {
      watchlist = await List.create({
        user_id: req.user.id,
        name: "Watchlist",
        description: "Meus filmes e séries para ver",
        is_public: false,
      });
    }

    res.json(watchlist);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const list = await List.findByPk(req.params.id, {
      include: [
        { model: User, as: "owner", attributes: ["id", "username", "avatar"] },
        {
          model: ListItem,
          as: "items",
          include: [{ model: Movie }],
          order: [["position", "ASC"]],
        },
      ],
    });

    if (!list) return res.status(404).json({ error: "Lista não encontrada" });

    if (!list.is_public && (!req.user || req.user.id !== list.user_id)) {
      return res.status(403).json({ error: "Esta lista é privada" });
    }

    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authenticate,
  [
    body("name")
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Nome é obrigatório (máximo 200 caracteres)"),
    body("description").optional().isString(),
    body("is_public").optional().isBoolean(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, description, is_public } = req.body;
      const list = await List.create({
        user_id: req.user.id,
        name,
        description,
        is_public: is_public !== undefined ? is_public : true,
      });
      res.status(201).json(list);
    } catch (err) {
      next(err);
    }
  },
);

router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const list = await List.findByPk(req.params.id);
    if (!list) return res.status(404).json({ error: "Lista não encontrada" });
    if (list.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Não autorizado" });
    }

    const { name, description, is_public } = req.body;
    if (name !== undefined) list.name = name;
    if (description !== undefined) list.description = description;
    if (is_public !== undefined) list.is_public = is_public;

    await list.save();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const list = await List.findByPk(req.params.id);
    if (!list) return res.status(404).json({ error: "Lista não encontrada" });
    if (list.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Não autorizado" });
    }

    await ListItem.destroy({ where: { list_id: list.id } });
    await list.destroy();
    res.json({ message: "Lista deletada" });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/items", authenticate, async (req, res, next) => {
  try {
    const list = await List.findByPk(req.params.id);
    if (!list) return res.status(404).json({ error: "Lista não encontrada" });
    if (list.user_id !== req.user.id)
      return res.status(403).json({ error: "Não autorizado" });

    const movie = await Movie.findByPk(req.body.movie_id);
    if (!movie) return res.status(404).json({ error: "Filme não encontrado" });

    const existing = await ListItem.findOne({
      where: { list_id: list.id, movie_id: movie.id },
    });
    if (existing)
      return res.status(409).json({ error: "Filme já está na lista" });

    const maxPos =
      (await ListItem.max("position", { where: { list_id: list.id } })) || 0;

    const item = await ListItem.create({
      list_id: list.id,
      movie_id: movie.id,
      position: maxPos + 1,
      notes: req.body.notes || null,
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/items/:itemId", authenticate, async (req, res, next) => {
  try {
    const list = await List.findByPk(req.params.id);
    if (!list) return res.status(404).json({ error: "Lista não encontrada" });
    if (list.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Não autorizado" });
    }

    const deleted = await ListItem.destroy({
      where: { id: req.params.itemId, list_id: list.id },
    });
    if (!deleted) return res.status(404).json({ error: "Item não encontrado" });

    res.json({ message: "Item removido da lista" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
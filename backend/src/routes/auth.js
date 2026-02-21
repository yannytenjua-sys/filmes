const express = require("express");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const config = require("../config");
const { User } = require("../models");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be 3-50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      const existing = await User.findOne({ where: { email } });
      if (existing)
        return res.status(409).json({ error: "Email already registered." });

      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername)
        return res.status(409).json({ error: "Username already taken." });

      const user = await User.create({ username, email, password });
      const token = signToken(user);

      res.status(201).json({ token, user: user.toSafeJSON() });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      if (!user.is_active) {
        return res.status(403).json({ error: "Account is deactivated." });
      }

      const token = signToken(user);
      res.json({ token, user: user.toSafeJSON() });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/me", authenticate, async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

router.put(
  "/me",
  authenticate,
  [
    body("username").optional().trim().isLength({ min: 3, max: 50 }),
    body("password").optional().isLength({ min: 6 }),
    body("avatar").optional().isURL(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, password, avatar } = req.body;
      const user = req.user;

      if (username) user.username = username;
      if (password) user.password = password;
      if (avatar) user.avatar = avatar;

      await user.save();
      res.json({ user: user.toSafeJSON() });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
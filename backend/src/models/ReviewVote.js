const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReviewVote = sequelize.define(
  "ReviewVote",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    review_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vote: {
      type: DataTypes.ENUM("up", "down"),
      allowNull: false,
    },
  },
  {
    tableName: "review_votes",
    indexes: [{ unique: true, fields: ["user_id", "review_id"] }],
  },
);

module.exports = ReviewVote;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ListItem = sequelize.define(
  "ListItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    list_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    movie_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "list_items",
    indexes: [{ unique: true, fields: ["list_id", "movie_id"] }],
  },
);

module.exports = ListItem;
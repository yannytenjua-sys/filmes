const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Movie = sequelize.define(
  "Movie",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tmdb_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    original_title: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    overview: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    poster_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    backdrop_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    release_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    vote_average: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    vote_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    popularity: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    genres: {
      type: DataTypes.TEXT, 
      allowNull: true,
      get() {
        const raw = this.getDataValue("genres");
        return raw ? JSON.parse(raw) : [];
      },
      set(val) {
        this.setDataValue("genres", JSON.stringify(val));
      },
    },
    media_type: {
      type: DataTypes.ENUM("movie", "tv"),
      defaultValue: "movie",
    },
    runtime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tagline: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    original_language: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    
    number_of_seasons: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    number_of_episodes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    first_air_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    last_air_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "movies",
  },
);

module.exports = Movie;
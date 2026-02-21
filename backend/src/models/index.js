const sequelize = require("../config/database");
const User = require("./User");
const Movie = require("./Movie");
const Favorite = require("./Favorite");
const List = require("./List");
const ListItem = require("./ListItem");
const Review = require("./Review");
const ReviewVote = require("./ReviewVote");

User.belongsToMany(Movie, {
  through: Favorite,
  foreignKey: "user_id",
  otherKey: "movie_id",
  as: "favoriteMovies",
});
Movie.belongsToMany(User, {
  through: Favorite,
  foreignKey: "movie_id",
  otherKey: "user_id",
  as: "favoritedBy",
});

Favorite.belongsTo(User, { foreignKey: "user_id" });
Favorite.belongsTo(Movie, { foreignKey: "movie_id" });
User.hasMany(Favorite, { foreignKey: "user_id" });
Movie.hasMany(Favorite, { foreignKey: "movie_id" });

User.hasMany(List, { foreignKey: "user_id", as: "lists" });
List.belongsTo(User, { foreignKey: "user_id", as: "owner" });

List.belongsToMany(Movie, {
  through: ListItem,
  foreignKey: "list_id",
  otherKey: "movie_id",
  as: "movies",
});
Movie.belongsToMany(List, {
  through: ListItem,
  foreignKey: "movie_id",
  otherKey: "list_id",
  as: "lists",
});

ListItem.belongsTo(List, { foreignKey: "list_id" });
ListItem.belongsTo(Movie, { foreignKey: "movie_id" });
List.hasMany(ListItem, { foreignKey: "list_id", as: "items" });

User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
Review.belongsTo(User, { foreignKey: "user_id", as: "author" });

Movie.hasMany(Review, { foreignKey: "movie_id", as: "reviews" });
Review.belongsTo(Movie, { foreignKey: "movie_id" });

User.hasMany(ReviewVote, { foreignKey: "user_id" });
ReviewVote.belongsTo(User, { foreignKey: "user_id" });

Review.hasMany(ReviewVote, { foreignKey: "review_id", as: "votes" });
ReviewVote.belongsTo(Review, { foreignKey: "review_id" });

module.exports = {
  sequelize,
  User,
  Movie,
  Favorite,
  List,
  ListItem,
  Review,
  ReviewVote,
};
const { gql, UserInputError } = require("apollo-server-express");
const auth = require("../common/Auth");
const userMsg = require("../common/userMsg.json");
const typeDefs = gql`
  extend type Query {
    allCategories: [category]
  }

  type category {
    id: Int
    name: String
    sub_categories: [sub_category]
  }

  type sub_category {
    id: Int
    name: String
  }
`;

const resolvers = {
  Query: {
    allCategories: async (obj, agrs, ctx, info) => {
      auth.verifyUser(ctx.user);

      const checkUser = await ctx.db.user.findOne({
        attributes: ["id"],
        where: {
          id: ctx.user.id,
        },
      });

      if (!checkUser || checkUser === null)
        throw new UserInputError(userMsg.userNotExist);

      ctx.db.main_category.hasMany(ctx.db.sub_category, {
        foreignKey: "main_id",
      });
      const getCategory = await ctx.db.main_category.findAll({
        attributes: ["id", "name"],
        include: {
          model: ctx.db.sub_category,
          attributes: ["id", "name"],
        },
      });

      return getCategory;
    },
  },
};

module.exports = { typeDefs, resolvers };

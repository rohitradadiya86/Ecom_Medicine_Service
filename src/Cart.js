const { gql, UserInputError } = require("apollo-server-express");
const auth = require("../common/Auth");
const userMsg = require("../common/userMsg.json");
const typeDefs = gql`
  extend type Mutation {
    addToCart(medicineId: Int!, qty: Int!): String
  }
`;

const resolvers = {
  Mutation: {
    addToCart: async (obj, { medicineId, qty }, ctx, info) => {
      auth.verifyUser(ctx.user);

      const checkUser = await ctx.db.user.findOne({
        attributes: ["id"],
        where: {
          id: ctx.user.id,
        },
      });

      if (!checkUser || checkUser === null)
        throw new UserInputError(userMsg.userNotExist);

      ctx.db.product_master.hasOne(ctx.db.medicine_details, {
        foreignKey: "product_id",
      });
      const checkIsAvailable = await ctx.db.product_master.findOne({
        attributes: ["id"],

        include: {
          model: ctx.db.medicine_details,
          where: {
            id: medicineId,
          },
          attributes: ["id", "piece", "price"],
        },
      });
      console.log(checkIsAvailable.dataValues.medicine_detail.dataValues);

      if (!checkIsAvailable || checkIsAvailable === null) {
        throw new UserInputError(userMsg.errProductNotAvailable);
      }

      const checkItemInCart = await ctx.db.cart_master.findOne({
        attributes: ["id", "qty", "subtotal"],
        where: {
          medicine_id: medicineId,
        },
      });

      if (checkItemInCart) {
        await ctx.db.cart_master.update(
          {
            qty: Number(checkItemInCart.dataValues.qty) + Number(qty),
            subtotal:
              Number(checkItemInCart.dataValues.subtotal) +
              Number(
                qty *
                  checkIsAvailable.dataValues.medicine_detail.dataValues.price
              ),
          },
          {
            where: {
              id: checkItemInCart.dataValues.id,
              medicine_id: medicineId,
            },
          }
        );
      } else {
        await ctx.db.cart_master.create({
          medicine_id: medicineId,
          qty: qty,
          subtotal: Number(
            qty * checkIsAvailable.dataValues.medicine_detail.dataValues.price
          ),
        });

        return userMsg.succAddToCartProduct;
      }
    },
  },
};

module.exports = { typeDefs, resolvers };

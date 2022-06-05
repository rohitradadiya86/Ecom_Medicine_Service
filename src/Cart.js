const { gql, UserInputError } = require("apollo-server-express");
const auth = require("../common/Auth");
const userMsg = require("../common/userMsg.json");
const typeDefs = gql`
  extend type Query {
    viewCart: cartItem
  }

  type cartItem {
    cartItems: [cartDetails]
    countryList: [countryList]
  }

  type cartDetails {
    id: Int
    title: String
    sku: String
    medicine_detail: med_details
  }

  type countryList {
    id: Int
    country: String
    shipping_charge: Int
    currency: String
  }
  type med_details {
    id: Int
    price: Int
    cart_master: cart_item
  }

  type cart_item {
    id: Int
    qty: Int
    subtotal: Int
  }

  extend type Mutation {
    addToCart(medicineId: Int!, qty: Int!): String
    removeCartItem(id: Int!): String
    updateCart(id: Int!, qty: Int): String
    checkOut: String
  }
`;

const resolvers = {
  Query: {
    viewCart: async (obj, args, ctx, info) => {
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
      ctx.db.medicine_details.hasOne(ctx.db.cart_master, {
        foreignKey: "medicine_id",
      });
      const cart = await ctx.db.product_master.findAll({
        attributes: ["id", "title", "sku"],
        include: {
          model: ctx.db.medicine_details,
          attributes: ["id", "piece", "price"],
          required: true,
          include: {
            model: ctx.db.cart_master,
            attributes: ["id", "qty", "subtotal"],
            where: {
              user_id: ctx.user.id,
              is_checkout: 0,
            },
          },
        },
      });

      const countryList = await ctx.db.shipping_charge_master.findAll({
        attributes: ["id", "country", "shipping_charge", "currency"],
      });
      return { cartItems: cart, countryList: countryList };
    },
  },
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
          user_id: ctx.user.id,
          medicine_id: medicineId,
          qty: qty,
          subtotal: Number(
            qty * checkIsAvailable.dataValues.medicine_detail.dataValues.price
          ),
        });

        return userMsg.succAddToCartProduct;
      }
    },

    removeCartItem: async (obj, { id }, ctx, info) => {
      auth.verifyUser(ctx.user.id);

      const checkUser = await ctx.db.user.findOne({
        attributes: ["id"],
        where: {
          id: ctx.user.id,
        },
      });

      if (!checkUser || checkUser === null)
        throw new UserInputError(userMsg.userNotExist);

      const checkItem = await ctx.db.cart_master.findOne({
        attributes: ["id"],
        where: {
          id: id,
          user_id: ctx.user.id,
        },
      });

      if (!checkItem) throw new UserInputError(userMsg.errCartItemNotAvailable);
      await ctx.db.cart_master.destroy({
        where: {
          id: id,
          user_id: ctx.user.id,
        },
      });
      return userMsg.succRemoveCartItem;
    },

    updateCart: async (obj, { id, qty }, ctx, info) => {
      auth.verifyUser(ctx.user);

      const checkUser = await ctx.db.user.findOne({
        attributes: ["id"],
        where: {
          id: ctx.user.id,
        },
      });

      if (!checkUser || checkUser === null)
        throw new UserInputError(userMsg.userNotExist);

      ctx.db.medicine_details.hasOne(ctx.db.cart_master, {
        foreignKey: "medicine_id",
      });
      const checkItem = await ctx.db.medicine_details.findOne({
        attributes: ["id", "price"],
        include: {
          model: ctx.db.cart_master,
          where: {
            id: id,
            user_id: ctx.user.id,
          },
          attributes: ["id", "qty", "subtotal"],
        },
      });

      if (!checkItem) throw new UserInputError(userMsg.errCartItemNotAvailable);

      qty = qty ? qty : 0;
      await ctx.db.cart_master.update(
        {
          qty:
            Number(checkItem.dataValues.cart_master.dataValues.qty) +
            Number(qty),
          subtotal:
            Number(checkItem.dataValues.cart_master.dataValues.subtotal) +
            Number(qty * checkItem.dataValues.price),
        },
        { where: { id: id, user_id: ctx.user.id } }
      );

      return userMsg.succUpdateCartItem;
    },
  },
};

module.exports = { typeDefs, resolvers };

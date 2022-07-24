const { gql, UserInputError } = require("apollo-server-express");
const auth = require("../common/Auth");
const userMsg = require("../common/userMsg.json");
const typeDefs = gql`
  extend type Query {
    getCategoryProduct(mainId: Int!, subId: Int): [cateProduct]
    getSelectedProduct(productId: Int!, subId: Int): selectedList
  }

  type selectedList {
    selectedProduct: cateProduct
    relatedProduct: [cateProduct]
  }
  type cateProduct {
    id: Int
    main_cate_id: Int
    sub_cate_id: Int
    sku: String
    title: String
    status: Int
    ingredient: String
    indication: String
    manufacturer: String
    type: String
    in_pack: Int
    pack_type: String
    delivery_time_min: String
    delivery_time_max: String
    brand: String
    img_url: String
    medicine_details: [medicineDetail]
  }

  type medicineDetail {
    id: Int
    product_id: Int
    weight: Int
    weight_type: String
    med_type: String
    piece: Int
    price: Int
  }
`;

const resolvers = {
  Query: {
    getCategoryProduct: async (obj, { mainId, subId }, ctx, info) => {
      auth.verifyUser(ctx.user);

      const checkUser = await ctx.db.user.findOne({
        attributes: ["id"],
        where: {
          id: ctx.user.id,
        },
      });

      if (!checkUser || checkUser === null)
        throw new UserInputError(userMsg.userNotExist);

      const findId =
        mainId && subId
          ? { main_cate_id: mainId, sub_cate_id: subId }
          : { main_cate_id: mainId };
      ctx.db.product_master.hasMany(ctx.db.medicine_details, {
        foreignKey: "product_id",
      });
      return ctx.db.product_master.findAll({
        where: findId,
        include: {
          model: ctx.db.medicine_details,
        },
        order: [["medicine_details", "price", "ASC"]],
      });
    },

    getSelectedProduct: async (obj, { productId, subId }, ctx, info) => {
      auth.verifyUser(ctx.user);

      const checkUser = await ctx.db.user.findOne({
        attributes: ["id"],
        where: {
          id: ctx.user.id,
        },
      });

      if (!checkUser || checkUser === null)
        throw new UserInputError(userMsg.userNotExist);
      ctx.db.product_master.hasMany(ctx.db.medicine_details, {
        foreignKey: "product_id",
      });
      const selectedProduct = ctx.db.product_master.findOne({
        // attributes: ["id","sku"],
        where: {
          id: productId,
        },
        include: {
          model: ctx.db.medicine_details,
        },
        order: [["medicine_details", "price", "ASC"]],
      });

      const subID = subId ? subId : null;
      const relatedProduct = await ctx.db.product_master.findAll({
        where: {
          sub_cate_id: subID,
        },
        include: {
          model: ctx.db.medicine_details,
        },
        order: [["medicine_details", "price", "ASC"]],
      });
      const relatedProductList =
        relatedProduct.length > 0 ? relatedProduct : [];
      return {
        selectedProduct: selectedProduct,
        relatedProduct: relatedProductList,
      };
    },
  },
};

module.exports = { typeDefs, resolvers };

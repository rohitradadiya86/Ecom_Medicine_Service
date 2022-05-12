const { gql } = require("apollo-server-express");
const { UserInputError } = require("apollo-server-express");
const bcrypt = require("bcrypt");
const userMsg = require("../common/userMsg.json");
const Constant = require("../constant/constant");
const jwt = require("jsonwebtoken");
const typeDefs = gql`
  type Query {
    hello: String
  }

  type AuthPayload {
    msg: String
    token: String
    user: user
  }
  type user {
    fName: String
    lName: String
    mobile: String
    email: String
  }
  type Mutation {
    userSignUp(
      fName: String!
      lName: String!
      mobile: String!
      email: String!
      password: String!
    ): String
    userSingIn(mobile: String!, password: String!): AuthPayload
  }
`;

const resolvers = {
  Query: {
    hello: async (obj, args, ctx, info) => {
      return "Hello";
    },
  },

  Mutation: {
    userSignUp: async (
      obj,
      { fName, lName, mobile, email, password },
      ctx,
      info
    ) => {
      const user = await ctx.db.user.findOne({
        attributes: ["id"],
        where: {
          mobile: mobile,
        },
      });

      if (user) {
        throw new UserInputError(userMsg.userAlreadyExist);
      }

      const hashPassword = await bcrypt.hash(password, 10);
      password = hashPassword;

      await ctx.db.user.create({
        fName: fName,
        lName: lName,
        mobile: mobile,
        email: email,
        password: password,
      });

      return userMsg.succSignUp;
    },

    userSingIn: async (obj, { mobile, password }, ctx, info) => {
      const user = await ctx.db.user.findOne({
        where: {
          mobile: mobile,
        },
      });

      if (!user || user === null) {
        throw new UserInputError(userMsg.userNotExist);
      }

      const matchPass = await bcrypt.compare(password, user.password);

      if (!matchPass) throw new UserInputError(userMsg.errPassWrong);

      const tokenData = {
        id: user.id,
        role: Constant.User,
      };

      const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "1d",
      });

      return {
        msg: userMsg.succSignIn,
        token: token,
        user: user,
      };
    },
  },
};

module.exports = { typeDefs, resolvers };

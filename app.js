const { ApolloServer } = require("apollo-server-express");
require("dotenv").config();
const express = require("express");
const auth = require("./common/Auth");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 4001;

const db = require("./database");
const mainServer = async () => {
  const server = new ApolloServer({
    debug: true,

    modules: [
      require("./src/User"),
      require("./src/Category"),
      require("./src/Product"),
      require("./src/Cart"),
    ],

    context: async ({ req }) => {
      const tokenWithBearer = req.headers.authorization || "";
      const token = tokenWithBearer.split(" ")[1];

      const user = await auth.getUser(token);
      return { db, user };
    },
  });
  await server.start();
  server.applyMiddleware({ app });
};
mainServer();
app.listen({ port: port }, () => {
  console.log(`server start at ${port}`);
});

const userMsg = require("../common/userMsg.json");
const jwt = require("jsonwebtoken");
const getUser = async (token) => {
  try {
    if (token) {
      const user = await jwt.verify(token, process.env.TOKEN_SECRET);
      return user;
    }
  } catch (error) {
    return null;
  }
};

const verifyUser = (user) => {
  // console.log(user);
  if (!user) {
    throw new Error(userMsg.errAuthentication);
  }
};

module.exports = { verifyUser, getUser };

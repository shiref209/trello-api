import tokenModel from "../db/models/token.model.js";

// code split between verifyToken and userAuth for the Single responsibility in SOLID

const verifyToken = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(new Error("invalid authorization"));
  }
  const token = authorization.split(`Bearer `)[1];
  if (!token) {
    return next(new Error("invalid token"));
  }
  const isFound = await tokenModel.findOne({ token });
  if (isFound) {
    return res.status(401).json({ msg: "Not authorized please login" });
  }
  req.token = token;
  return next();
};

export default verifyToken;

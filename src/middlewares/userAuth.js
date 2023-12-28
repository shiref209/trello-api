import jwt from "jsonwebtoken";
import userModel from "../db/models/user.model.js";

const userAuth = async (req, res, next) => {
  const payload = jwt.verify(req.token, process.env.AUTH_TOKEN_SIGNATURE);
  if (!payload) {
    return next(new Error("invalid token"));
  }
  // check if user is not soft deleted
  // better option is to transfer soft deleted user to another model (الوقت مسمحش للاسف)
  const isFound = await userModel.findOne({
    _id: payload._id,
    isDeleted: false,
  });
  if (!isFound) {
    return next(new Error("user not found"));
  }
  req.user = payload;
  return next();
};
export default userAuth;

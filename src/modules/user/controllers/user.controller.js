import userModel from "../../../db/models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sendEmail from "../../../utilis/sendEmail.js";
import tokenModel from "../../../db/models/token.model.js";
import {
  changePasswordSchema,
  signInSchema,
  signUpSchema,
  updateUserSchema,
} from "../validation/user.validation.js";
import imageModel from "../../../db/models/image.model.js";
import taskModel from "../../../db/models/task.model.js";

export const signUp = async (req, res, next) => {
  const { username, email, age, password, gender } = req.body;
  const isValid = signUpSchema.validate(
    { username, email, age, gender, password },
    { abortEarly: false }
  );
  if (isValid.error) {
    return next(isValid.error);
  }
  const isFound = await userModel.findOne({ email, isDeleted: false });
  if (isFound) {
    return next(new Error("email already exists"));
  }
  // hash password
  const hash = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);
  //  check if deleted to change tag and update data
  let user;
  if (isFound && isFound.isDeleted) {
    user = await userModel.updateOne(
      {
        email,
      },
      {
        username,
        age,
        password: hash,
        gender,
        isDeleted: false,
      }
    );
  } else {
    user = await userModel.create({
      username,
      email,
      age,
      password: hash,
      gender,
    });
  }
  //   create sign-up token for confirm email
  const token = jwt.sign(
    {
      username,
      email,
      _id: user._id,
    },
    process.env.CONFIRM_EMAIL_SIGNATURE
  );
  // dynamic link to send in confirmation mail
  const link = `${req.protocol}://${req.headers.host}/user/confirm-email/${token}`;
  const unsubscribeLink = `${req.protocol}://${req.headers.host}/user/unsubscribe/${token}`;
  // send email of confirmation
  const isSent = await sendEmail({
    to: user.email,
    subject: "confirm email",
    text: "Confirm your email to complete your sign-up",
    html: `<a href='${link}'>click to confirm</a>
    <div><p>If you want to unsubscribe from the service or it's wrong email registered please click the following link</p>
    <br>
    <a href=${unsubscribeLink}>click to unsubscribe</a>
    </div>
    `,
  });
  return isSent?.messageId
    ? res.status(201).json({ msg: "created" })
    : res.status(500).json({ msg: "Error sending email" });
};

export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const payload = jwt.verify(token, process.env.CONFIRM_EMAIL_SIGNATURE);

  const user = await userModel.updateOne(
    { _id: payload._id },
    { confirmEmail: true }
  );

  // redirect to login page
  return user.matchedCount
    ? res.status(200).json({ msg: "success and redirected to login page" })
    : res.status(404).json({ msg: "user not found" });
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const isValid = signInSchema.validate(
    { email, password },
    { abortEarly: false }
  );
  if (isValid.error) {
    return next(isValid.error);
  }
  // chek if soft deleted, as sign in don't go through userAuth
  const user = await userModel.findOne({ email, isDeleted: false });
  if (!user) {
    return next(new Error("invalid email or password"));
  }
  const hash = bcrypt.compareSync(password, user.password);
  if (!hash) {
    return next(new Error("invalid email or password"));
  }
  const token = jwt.sign(
    {
      email: user.email,
      username: user.username,
      _id: user._id,
      confirmEmail: user.confirmEmail,
    },
    process.env.AUTH_TOKEN_SIGNATURE
  );

  return res.status(200).json({ msg: "Success", token });
};
export const changePassword = async (req, res, next) => {
  const { password, new_password } = req.body;
  const isValid = changePasswordSchema.validate(
    { password, new_password },
    { abortEarly: false }
  );
  if (isValid.error) {
    return next(isValid.error);
  }
  const isFound = await userModel.findOne({ _id: req.user._id });
  const isMatch = bcrypt.compareSync(password, isFound.password);
  if (!isMatch) {
    return next(new Error("invalid password"));
  }
  const hash = bcrypt.hashSync(new_password);
  const user = await userModel.updateOne(
    { _id: req.user._id },
    { password: hash }
  );
  if (!user.modifiedCount) {
    // user entered same old password as update
    return res.status(400).json({
      msg: "This password can't be updated, please choose another password",
    });
  }
  // expirate token and redirect to login page
  const token = await tokenModel.create({ token: req.token });
  // redirect to login page
  return res.status(200).json({ msg: "Updated and redirected to login page" });
};

export const updateUser = async (req, res, next) => {
  const { age, username } = req.body;
  const isValid = updateUserSchema.validate(
    { age, username },
    { abortEarly: false }
  );
  if (isValid.error) {
    return next(isValid.error);
  }
  const user = await userModel.updateOne(
    { _id: req.user._id },
    {
      username,
      age,
    }
  );
  // extra layer of error handling
  // user is already found from auth middleware
  if (!user.matchedCount) {
    return next(new Error("invalid user"));
  }
  return user.modifiedCount
    ? res.status(200).json({ msg: "updated" })
    : res.status(400).json({ msg: "please provide updated age or username" });
};

export const deleteUser = async (req, res, next) => {
  const user = await userModel.deleteOne({ _id: req.user._id });

  // delete images of user
  const deleteImages = await imageModel.deleteMany({ userID: req.user._id });

  // delete tasks of user
  const deleteTasks = await taskModel.deleteMany({ userID: req.user._id });
  // add token to expired tokens
  await tokenModel.create({ token: req.token });
  // if request sent multiple times, res of 404 not found is sent back
  // delete cookies to remove any tokens in user's browser
  return user.deletedCount
    ? res
        .setHeader("Clear-Site-Data", '"cookies"')
        .status(200)
        .json({ msg: "Deleted" })
    : res.status(404).json({ msg: "user not found" });
};

export const softDeleteUser = async (req, res, next) => {
  const user = await userModel.updateOne(
    { _id: req.user._id },
    { isDeleted: true }
  );

  // delete images of user
  const deleteImages = await imageModel.deleteMany({ userID: req.user._id });

  // delete tasks of user
  const deleteTasks = await taskModel.deleteMany({ userID: req.user._id });

  // add token to expired tokens
  await tokenModel.create({ token: req.token });

  // if request sent multiple times, res of 404 not found is sent back
  return user.modifiedCount
    ? res
        .setHeader("Clear-Site-Data", '"cookies"')
        .status(200)
        .json({ msg: "Deleted and redirect to login" })
    : res.status(404).json({ msg: "user not found" });
  // TODO:: json number starts with 0 error=>search
};

export const logOut = async (req, res, next) => {
  await tokenModel.create({ token: req.token });
  return res
    .setHeader("Clear-Site-Data", '"cookies"')
    .status(200)
    .json({ msg: "logged out" });
  // .redirect("http://localhost:3000/user/get-all")
};
// check for user found
// send forget password email, with token to redirect to confirm
// on confirm link he will be redirected to reset password api to change password
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const isFound = await userModel.findOne({ email });
  if (!isFound) {
    return next(new Error("user not found"));
  }
  const token = jwt.sign(
    {
      email,
      _id: isFound._id,
    },
    process.env.CONFIRM_EMAIL_SIGNATURE
  );
  const link = `${req.protocol}://${req.headers.host}/user/reset-password/${token}`;
  const unsubscribeLink = `${req.protocol}://${req.headers.host}/user/unsubscribe/${token}`;

  const isSent = await sendEmail({
    to: email,
    subject: "reset password",
    text: "Please click the following link to reset your password",
    html: `<a href='${link}'>click to reset</a>
    <div><p>If you want to unsubscribe from the service or it's wrong email registered please click the following link</p>
    <br>
    <a href=${unsubscribeLink}>click to unsubscribe</a>
    </div>
    `,
  });
  return isSent?.messageId
    ? res.status(200).json({
        msg: "Reset email has been sent succesfully,please check your email",
      })
    : res.status(500).json({ msg: "Error sending email" });
};

export const resetPassword = async (req, res, next) => {
  // confirm token
  const { token } = req.params;
  const payload = jwt.verify(token, process.env.CONFIRM_EMAIL_SIGNATURE);
  if (!payload) {
    return next(new Error("Please check your email and reset your password"));
  }
  const isFound = await userModel.findById(payload._id);
  if (!isFound) {
    return next(new Error("invalid token"));
  }
  // from here user will be redirected to change password page and change password
  return res
    .status(200)
    .json({ msg: "Confirmed and redirected to change password" });
};

export const unsubscribe = async (req, res, next) => {
  const { token } = req.params;
  const payload = jwt.verify(token, process.env.CONFIRM_EMAIL_SIGNATURE);
  req.user = payload;
  return next();
};

// upload profile pic
export const uploadProfilePic = async (req, res, next) => {
  console.log("controller fired");
  const { filename, finalDest } = req.file;
  const image = await imageModel.create({
    name: filename,
    url: finalDest,
  });
  const user = await userModel.updateOne(
    { _id: req.user._id },
    { profilePic: image._id }
  );
  return user.modifiedCount
    ? res.status(200).json({ msg: "image updated" })
    : res.status(400).json({ msg: "error" });
};

export const uploadCoverPics = async (req, res, next) => {
  const { files } = req;
  const images = files.map((file) => {
    return { name: file.filename, url: file.finalDest };
  });
  const imagesUpload = await imageModel.create(images, { new: true });
  const user = await userModel.updateOne(
    { _id: req.user._id },
    { $push: { coverPics: imagesUpload.map((image) => image._id) } }
  );
  return user.modifiedCount
    ? res.status(200).json({ msg: "success" })
    : res.status(500).json({ msg: "query error" });
};

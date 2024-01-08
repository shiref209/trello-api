import { Router } from "express";
import asyncHandler from "../../utilis/asyncHandler.js";
import {
  signUp,
  confirmEmail,
  signIn,
  updateUser,
  deleteUser,
  softDeleteUser,
  logOut,
  changePassword,
  forgetPassword,
  resetPassword,
  unsubscribe,
  uploadProfilePic,
  uploadCoverPics,
} from "./controllers/user.controller.js";
import userAuth from "../../middlewares/userAuth.js";
import verifyToken from "../../middlewares/verifyToken.js";
import uploadHandler from "../../middlewares/uploadHandler.js";
import validation from "../../middlewares/validation.js";
import {
  uploadCoverPicsSchema,
  uploadProfilePicSchema,
} from "./validation/user.validation.js";

const userRouter = Router();
userRouter.post("/sign-up", asyncHandler(signUp));
userRouter.get("/confirm-email/:token", asyncHandler(confirmEmail));
userRouter.post("/sign-in", asyncHandler(signIn));
userRouter.patch(
  "/change-password",
  asyncHandler(verifyToken),
  asyncHandler(userAuth),
  asyncHandler(changePassword)
);
userRouter.patch(
  "/",
  asyncHandler(verifyToken),
  asyncHandler(userAuth),
  asyncHandler(updateUser)
);
userRouter.delete(
  "/hard-delete",
  asyncHandler(verifyToken),
  asyncHandler(userAuth),
  asyncHandler(deleteUser)
);
// assigning soft delete to be default delete of architecture
userRouter.delete(
  "/",
  asyncHandler(verifyToken),
  asyncHandler(userAuth),
  asyncHandler(softDeleteUser)
);
// logout
userRouter.get(
  "/logout",
  asyncHandler(verifyToken),
  asyncHandler(userAuth),
  asyncHandler(logOut)
);
userRouter.post("/forget-password", asyncHandler(forgetPassword));
// when user clicks on the forget password, he will be redirected to change password controller
userRouter.get("/reset-password/:token", asyncHandler(resetPassword));
// TODO:: is this a good approach for DRY code?
// to use a controller and use it on next()
userRouter.get(
  "/unsubscribe/:token",
  asyncHandler(unsubscribe),
  asyncHandler(deleteUser)
);

// upload profile pic
userRouter.post(
  "/profile-pic",
  asyncHandler(verifyToken),
  asyncHandler(userAuth),
  // passing inside function to pass user data to create folder with id of user
  (req, res, next) => {
    const upload = uploadHandler({
      customPath: `profile/${req.user._id}`,
      isSingle: true,
    });
    upload(req, res, next);
  },
  validation(uploadProfilePicSchema),
  asyncHandler(uploadProfilePic)
);

// multiple images
userRouter.post(
  "/cover-pics",
  asyncHandler(verifyToken),
  asyncHandler(userAuth),
  // passing inside function to pass user data to create folder with id of user
  (req, res, next) => {
    const upload = uploadHandler({
      customPath: `cover/${req.user._id}`,
      isSingle: false,
    });
    upload(req, res, next);
  },
  validation(uploadCoverPicsSchema),

  asyncHandler(uploadCoverPics)
);
export default userRouter;

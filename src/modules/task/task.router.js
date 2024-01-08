import { Router } from "express";
import asyncHandler from "../../utilis/asyncHandler.js";
import verifyToken from "../../middlewares/verifyToken.js";
import userAuth from "../../middlewares/userAuth.js";
import {
  addTask,
  deleteTask,
  getTasks,
  getTasksPassedDeadline,
  getUserTasks,
  updateTask,
  uploadAttachment,
} from "./controllers/task.controller.js";
import uploadHandler from "../../middlewares/uploadHandler.js";
import validation from "../../middlewares/validation.js";
import { uploadAttachmentSchema } from "./validation/task.validation.js";
const taskRouter = Router();
taskRouter.post(
  "/",
  asyncHandler(verifyToken),
  asyncHandler(userAuth),
  asyncHandler(addTask)
);
taskRouter.patch(
  "/:id",
  asyncHandler(verifyToken),
  asyncHandler(userAuth),
  asyncHandler(updateTask)
);
taskRouter.delete(
  "/:id",
  asyncHandler(verifyToken),
  asyncHandler(userAuth),
  asyncHandler(deleteTask)
);
// get all tasks with user data
taskRouter.get("/", asyncHandler(getTasks));
// get user all tasks
taskRouter.get(
  "/user-tasks",
  asyncHandler(verifyToken),
  asyncHandler(userAuth),
  asyncHandler(getUserTasks)
);
// get tasks passed deadline
taskRouter.get("/passed-deadline", asyncHandler(getTasksPassedDeadline));

// upload attachemnt
taskRouter.patch(
  "/upload-attachment/:id",
  asyncHandler(verifyToken),
  asyncHandler(userAuth),
  (req, res, next) => {
    const upload = uploadHandler({
      // this should be changed with task id -بس الوقت مسمحش-
      customPath: `attachment/${req.user._id}`,
      isSingle: true,
      uploadType: "pdf",
    });
    upload(req, res, next);
  },
  validation(uploadAttachmentSchema),
  asyncHandler(uploadAttachment)
);

export default taskRouter;

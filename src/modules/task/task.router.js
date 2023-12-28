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
} from "./controllers/task.controller.js";
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

export default taskRouter;

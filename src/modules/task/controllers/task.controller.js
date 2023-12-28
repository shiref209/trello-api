import taskModel from "../../../db/models/task.model.js";
import {
  addTaskSchema,
  updateTaskSchema,
} from "../validation/task.validation.js";

export const addTask = async (req, res, next) => {
  const { title, description, status, assignTo, deadline } = req.body;
  const isValid = addTaskSchema.validate({
    title,
    description,
    status,
    assignTo,
    deadline,
  });
  if (isValid.error) {
    return next(isValid.error);
  }
  const task = await taskModel.create({
    title,
    description,
    status,
    userID: req.user._id,
    deadline,
  });
  return res.status(200).json({ msg: "Created", task });
};
export const updateTask = async (req, res, next) => {
  const { title, description, status, assignTo } = req.body;
  const { id } = req.params;
  const isValid = updateTaskSchema.validate({
    title,
    description,
    status,
    assignTo,
  });
  if (isValid.error) {
    return next(isValid.error);
  }
  const task = await taskModel.updateOne(
    { _id: id, userID: req.user._id },
    { title, description, status, assignTo },
    { new: true }
  );
  //   either task not found or user updating is not creator
  if (!task.matchedCount) {
    return next(new Error("invalid id"));
  }
  return task.modifiedCount
    ? res.status(200).json({ msg: "Updated", task })
    : res.status(400).json({ msg: "please enter valid update values" });
};
export const deleteTask = async (req, res, next) => {
  const { id } = req.params;

  const task = await taskModel.deleteOne({ _id: id, userID: req.user._id });
  //   either task not found or user updating is not creator

  return task.deletedCount
    ? res.status(200).json({ msg: "deleted" })
    : res.status(400).json({ msg: "invalid id" });
};

export const getTasks = async (req, res, next) => {
  // TODO:: it returns id extra field =>fix
  const tasks = await taskModel
    .find({})
    .populate("user", ["username", "email"]);
  return res.status(200).json({ msg: "Success", tasks });
};
// get all user tasks
export const getUserTasks = async (req, res, next) => {
  const tasks = await taskModel.find({ userID: req.user._id });
  //   tasks.unshift({ user: req.user });
  //   another solution is to use populate but less performant
  return res.status(200).json({ msg: "Success", user: req.user, tasks });
};

// get tasks passed deadline
export const getTasksPassedDeadline = async (req, res, next) => {
  const d = new Date();
  const tasks = await taskModel.find({
    deadline: {
      $lte: d,
    },
  });
  return res.status(200).json({ msg: "Success", tasks });
};

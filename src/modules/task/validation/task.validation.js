import joi from "joi";

export const addTaskSchema = joi
  .object({
    title: joi.string().min(3).max(30).required(),
    description: joi.string().min(3).max(200),
    status: joi.string().valid("ToDo", "Doing", "Done"),
    assignTo: joi.string().alphanum(),
    deadline: joi.date(),
  })
  .required();

export const updateTaskSchema = joi.object({
  title: joi.string().min(3).max(30),
  description: joi.string().min(3).max(200),
  status: joi.string().valid("ToDo", "Doing", "Done"),
  assignTo: joi.string().alphanum(),
});

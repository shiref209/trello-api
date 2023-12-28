import joi from "joi";

export const signUpSchema = joi
  .object({
    username: joi.string().min(3).max(30).alphanum().required(),
    email: joi.string().email().required(),
    password: joi.string().min(5).max(20).required(),
    age: joi.number(),
    gender: joi.string().valid("male", "female"),
  })
  .required();

export const signInSchema = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().min(5).max(20).required(),
  })
  .required();

export const changePasswordSchema = joi
  .object({
    new_password: joi.string().min(5).max(20).required(),
    password: joi.string().min(5).max(20).required(),
  })
  .required();

export const updateUserSchema = joi
  .object({
    username: joi.string().min(3).max(30).alphanum().required(),
    age: joi.number(),
  })
  .required();

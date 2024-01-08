import joi from "joi";
export const fileSchema = {
  size: joi.number().positive().required(),
  path: joi.string().required(),
  filename: joi.string().required(),
  destination: joi.string().required(),
  mimetype: joi.string().required(),
  encoding: joi.string().required(),
  originalname: joi.string().required(),
  fieldname: joi.string().required(),
  finalDest: joi.string().required(),
};

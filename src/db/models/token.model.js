import { Schema, model } from "mongoose";

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      // TODO:: data type different from _id in user=> Search
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const tokenModel = model("Token", tokenSchema);

export default tokenModel;

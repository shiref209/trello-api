import { Schema, Types, model } from "mongoose";

const imageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  {}
);

const imageModel = model("Image", imageSchema);

export default imageModel;

import { Schema, Types, model } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: Number,
  age: Number,
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  confirmEmail: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  profilePic: {
    type: Types.ObjectId,
    ref: "Image",
  },
  coverPics: {
    type: [Types.ObjectId],
    ref: "Image",
  },
});

const userModel = model("User", userSchema);

export default userModel;

import mongoose, { Schema, Types, model } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enums: ["ToDo,Done,Doing"],
      default: "ToDo",
      required: true,
    },
    userID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignTo: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    deadline: {
      type: Date,
    },
    attachment: {
      type: Types.ObjectId,
      ref: "Attachment",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);
// virtual to get user data
taskSchema.virtual("user", {
  ref: "User",
  localField: "userID",
  foreignField: "_id",
  justOne: true,
});

const taskModel = model("Task", taskSchema);
export default taskModel;

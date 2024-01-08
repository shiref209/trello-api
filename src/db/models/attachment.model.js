import { Schema, Types, model } from "mongoose";

const attachmentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  taskId: {
    type: Types.ObjectId,
    ref: "Task",
  },
});

const attachmentModel = model("Attachment", attachmentSchema);

export default attachmentModel;

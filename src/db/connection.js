import mongoose from "mongoose";
const connection = async () => {
  await mongoose
    .connect(process.env.URI)
    .then(() => console.log("connected to db"))
    .catch((error) => {
      console.log("db error: ", error);
    });
};

export default connection;

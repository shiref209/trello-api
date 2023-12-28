import connection from "./db/connection.js";
import taskRouter from "./modules/task/task.router.js";
import userRouter from "./modules/user/user.router.js";
import globalErrorHandler from "./utilis/globalErrorHandler.js";

const bootstrap = (app, express) => {
  connection();
  app.use(express.json());
  app.use("/user", userRouter);
  app.use("/task", taskRouter);
  app.use("*", (req, res, next) => {
    return res.json({ msg: "invalid routing" });
  });
  app.use(globalErrorHandler);
};
export default bootstrap;

// TODO:: share profile qr code

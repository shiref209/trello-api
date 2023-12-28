const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      console.log(error.message, error.stack);
      return res
        .status(500)
        .json({ msg: "internal server error", error: error.message });
    });
  };
};

export default asyncHandler;

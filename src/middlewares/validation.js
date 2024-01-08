const validation = (schema) => {
  return (req, res, next) => {
    const { authentication } = req.headers;
    let data;
    if (authentication) {
      data = { ...req.body, ...req.params, ...req.query, authentication };
    } else {
      data = { ...req.body, ...req.params, ...req.query };
    }
    if (req.file) {
      data = { ...data, file: req.file };
    }

    if (req.files) {
      data = { ...data, files: req.files };
    }
    const validationResults = schema.validate(data, { abortEarly: false });
    if (validationResults.error) {
      return res.json({ message: "validation error", validationResults });
    }
    next();
  };
};
export default validation;

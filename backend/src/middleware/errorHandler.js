const errorHandler = (err, req, res, _next) => {
  console.error("Erro:", err);

  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    return res.status(400).json({
      error: "Erro de validação",
      details:
        err.errors?.map((e) => ({ field: e.path, message: e.message })) ||
        err.message,
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Erro interno do servidor",
  });
};

module.exports = errorHandler;
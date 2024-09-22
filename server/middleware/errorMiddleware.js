// errorMiddleware.js
const errorMiddleware = (err, req, res, next) => {
  const defaultError = {
    statusCode: 500, // Set default to 500 for server errors
    success: false,
    message: err.message || "An unexpected error occurred.",
  };

  // Handle validation errors (e.g., Mongoose validation errors)
  if (err?.name === "ValidationError") {
    defaultError.statusCode = 400;
    defaultError.message = Object.values(err.errors)
      .map((el) => el.message)
      .join(", ");
  }

  // Handle duplicate key errors (e.g., unique fields in the database)
  if (err.code && err.code === 11000) {
    defaultError.statusCode = 400;
    defaultError.message = `${Object.keys(err.keyValue)} field must be unique!`;
  }

  // Return the error response
  res.status(defaultError.statusCode).json({
    success: defaultError.success,
    message: defaultError.message,
  });
};

export default errorMiddleware;

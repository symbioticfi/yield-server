class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Prevent the constructor function from appearing in the error stack trace.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

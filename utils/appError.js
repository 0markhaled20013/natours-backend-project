class appError extends Error {
  // extend the built-in Error class to create a custom error class
  constructor(message, statusCode) {
    super(message); // call the parent class constructor  Error with the message parameter only
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // if statusCode starts with 4 set status to fail else set it to error
    this.isOperational = true; // to distinguish between operational errors and programming errors
    Error.captureStackTrace(this, this.constructor); // to exclude this constructor from the stack trace
  }
}
module.exports = appError;

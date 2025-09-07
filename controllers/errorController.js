/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

let AppError = require('../utils/appError');

// Function to handle specific Mongoose errors (e.g., invalid IDs)
let handleCastErrorDB = (err) => {
  // Handle Mongoose "CastError" (invalid ID format, etc.)
  let message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Function to send detailed error response in DEVELOPMENT environment
let sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status, // e.g. 'fail' or 'error'
    message: err.message, // error message describing what went wrong
    stack: err.stack, // stack trace (helps developers debug the error)
    error: err, // the full error object for debugging
    // In development we show everything to help find bugs quickly
  });
};

// Function to send LIMITED error response in PRODUCTION environment
let sendErrorProd = (err, res) => {
  // If error is "operational" → trusted error we expected (e.g., invalid user input, wrong ID format, etc.)
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status, // 'fail' or 'error'
      message: err.message, // safe message to show client
    });
  } else {
    // If error is not operational → programming bug or unknown issue
    // We don't leak internal details to the client
    console.error('ERROR 💥', err); // log full error for developers (server console)

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!', // generic message for client
    });
  }
};

// Exporting a GLOBAL ERROR HANDLER middleware function for Express
module.exports = (err, req, res, next) => {
  // Express recognizes this as error-handling middleware
  // because it has 4 arguments (err, req, res, next)

  // If error does not already have a status code → set default = 500 (Internal Server Error)
  err.statusCode = err.statusCode || 500;

  // If error does not already have a status → set default = 'error'
  err.status = err.status || 'error';

  // Different behavior depending on the environment
  if (process.env.NODE_ENV === 'development') {
    // In development, send detailed error (with stack trace, object, etc.)
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // In production, send only safe error messages
    sendErrorProd(err, res);

    // Create a copy of the error object to avoid mutating the original
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    sendErrorProd(error, res);
  }
};

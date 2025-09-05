module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
/**
 * ✅ How it works:

Defines a higher-order function catchAsync:

It takes an async function (fn) and returns a new function.

If an error occurs in fn, instead of using try...catch, it automatically forwards the error to Express’ next(err).

In getTour, you no longer write try...catch.

Errors get passed to a centralized global error-handling middleware.
 */

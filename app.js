/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let express = require('express');
let morgan = require('morgan');

let AppError = require(`${__dirname}/utils/appError`);
let globalErrorHandler = require(`${__dirname}/controllers/errorController`);
let toursRouter = require(`${__dirname}/routes/tourRoutes`);
let usersRouter = require(`${__dirname}/routes/userRoutes`);
let app = express();
console.log(process.env.ASMY); // CHECK that i can access any environment variable from anywhere in the app
// 1) middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // morgan is a middleware to log requests in the console, 'dev' is the format of the log
}
app.use(express.json()); // dah al middleware aly btgeb al data from client in json format to req.body
app.use(express.static(`${__dirname}/public`)); // serve static files from the public directory

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log('hi from middleware 🫰');
  next();
});

//////////////////////////////////////////////////
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createNewTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
// mmkn b2a a3ml altre2a aly fo2 deh w mmkn deh

// 3) routes

// let toursRouter = express.Router(); // 5tohom fe file lw7dohom

// toursRouter.route('/').get(getAllTours).post(createNewTour);
// toursRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// let usersRouter = express.Router();
// usersRouter.route('/').get(getAllUsers).post(createUser);
// usersRouter.route('/:id').get(getUser).post(updateUser).delete(deleteUser);

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.all('*', (req, res, next) => {
  // app.all means all http methods get post patch delete etc
  // catch all for unhandled routes and must be at the end of all routes because it matches everything first
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can not find   ${req.originalUrl}  on this server`,
  // });

  // let err = new Error(`can not find   ${req.originalUrl}  on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`can not find   ${req.originalUrl}  on this server`, 404)); // 34an a3ml pass ll error ll global error handling middleware ta7tl app.all 34an y3ml handle ll error
});

app.use(globalErrorHandler); // global error handling middleware
module.exports = app; // export the app to use it in server.js

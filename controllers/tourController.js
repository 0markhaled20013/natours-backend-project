/* eslint-disable no-unused-vars */
// let fs = require('fs');
const Tour = require('../models/tourModel');
const apiFeatures = require('../utils/apiFeature');
const catchAsync = require('../utils/catchAsync');
// let tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  // req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  // // 1) Filtering
  // console.log(req.query);
  // let objQuery = { ...req.query };
  // let excludedFields = ['page', 'sort', 'limit', 'fields']; // fields to be excluded out from the query
  // excludedFields.forEach((el) => delete objQuery[el]); // delete the excluded fields from the query object
  // console.log(objQuery);

  // // 2) Advanced Filtering
  // let queryStr = JSON.stringify(objQuery);
  // queryStr = queryStr.replace(
  //   // to add $ before gt, gte, lt, lte, eq for mongoose query
  //   /\b(gt|gte|lt|lte|eq)\b/g, // \b means word boundary, g means global to replace all occurrences in the string
  //   (match) => `$${match}` // add $ before the match
  // );
  // console.log(queryStr);

  // let query = Tour.find(JSON.parse(queryStr)); // find() returns a query object so we can chain other methods to it
  // // .sort('-maxGroupSize'); // sort the result by maxGroupSize in descending order
  // // .limit(2) // limit the result to 2 documents

  // if (req.query.sort) {
  //   let sortBy = req.query.sort.split(',').join(' '); // convert comma separated string to space separated string
  //   console.log(sortBy);
  //   query = query.sort(sortBy); // sort the result by the sortBy fields
  // } else {
  //   query = query.sort('-createdAt'); // sort the result by createdAt in descending order
  // }

  // if (req.query.fields) {
  //   let fields = req.query.fields.split(',').join(' '); // convert comma separated string to space separated string
  //   console.log(fields);
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v'); // exclude the __v field from the result
  // }

  // // 3) Pagination
  // let page = req.query.page * 1 || 1; // convert string to number
  // let limit = req.query.limit * 1 || 100; // convert string to number
  // let skip = (page - 1) * limit; // calculate skip value

  // query = query.skip(skip).limit(limit); // apply pagination
  // if (req.query.page) {
  //   let numTours = await Tour.countDocuments(); // count the total number of documents in the collection
  //   if (skip >= numTours) throw new Error('This page does not exist'); // if skip value is greater than total number of documents, throw an error
  // }

  // EXECUTE QUERY

  let features = new apiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  console.log('features.queryyyyyyyyyyyyyyyyyyyyy', features.query);
  let tours = await features.query; // await the execution of the query to get the result set as an array of documents from the collection

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.createNewTour = catchAsync(async (req, res, next) => {
  let newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
// const newTour = new Tour({});
// newTour.save().then((tour) => {
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// }).catch((err) => {
//   res.status(400).json({
//     status: 'fail',
//     message: err.message,
//   });
// });// old way without async/await
exports.getTour = catchAsync(async (req, res, next) => {
  let tour = await Tour.findOne({ name: req.body.name });
  // let tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new Error('No tour found with that ID')); // to skip the remaining code and go to the global error handling middleware
  }
  res.status(200).json({
    status: 'success',
    tour: tour,
  });
});
exports.updateTour = catchAsync(async (req, res, next) => {
  let updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({
    status: 'updated successfully',
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  let updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updatedTour) {
    return next(new Error('No tour found with that ID')); // to skip the remaining code and go to the global error handling middleware
  }
  res.status(200).json({
    status: 'updated successfully',
    data: {
      tour: updatedTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  let deletedTour = await Tour.findByIdAndDelete(req.params.id);
  if (!deletedTour) {
    return next(new Error('No tour found with that ID')); // to skip the remaining code and go to the global error handling middleware
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// no longer need it because we are using mongoose that checks the id automatically
// exports.checkId = (req, res, next, value) => {
//   console.log(`Tour id is: ${value}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'error',
//       message: 'invalid id',
//     });
//   }
//   next();
// };

// no longer need it because we are using mongoose that checks the body automatically
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

exports.getTourStats = catchAsync(async (req, res, next) => {
  let stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, // match stage to filter documents
    },
    {
      $group: {
        // group stage to group documents by a specified field
        _id: { $toUpper: '$difficulty' }, // group by difficulty field and convert it to uppercase
        numTours: { $sum: 1 }, // count the number of tours in each group
        numRatings: { $sum: '$ratingsQuantity' }, // sum the ratingsQuantity field in each group
        avgRating: { $avg: '$ratingsAverage' }, // calculate the average of ratingsAverage field in each group
        avgPrice: { $avg: '$price' }, // calculate the average of price field in each group
        minPrice: { $min: '$price' }, // calculate the minimum of price field in each group
        maxPrice: { $max: '$price' }, // calculate the maximum of price field in each group
      },
    },
    {
      $sort: { avgPrice: 1 }, // sort stage to sort the documents by avgPrice in ascending order
      // and you must use the name of the field exactly as it is defined in the group stage not the original field name in the document
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, // match stage to filter out documents with _id equal to 'EASY'
    //   // also you can repeat the match stage as many times as you want
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats: stats,
    },
  });
});

// Controller function to get monthly plan of tours for a given year
exports.getMonthlyPlan = async (req, res, next) => {
  try {
    // Extract year from request params (e.g., /api/v1/tours/monthly-plan/2025)
    // Multiplying by 1 converts string -> number
    let year = req.params.year * 1;

    // Use MongoDB Aggregation Pipeline on the Tour collection
    let plan = await Tour.aggregate([
      {
        // 1) unwind: Deconstructs the "startDates" array
        // Each element in startDates will become its own document
        $unwind: '$startDates',
      },
      {
        // 2) match: Filters tours to only those within the given year
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`), // From Jan 1 of that year
            $lte: new Date(`${year}-12-31`), // To Dec 31 of that year
          },
        },
      },
      {
        // 3) group: Groups tours by month number extracted from "startDates"
        $group: {
          _id: { $month: '$startDates' }, // e.g., 1=Jan, 2=Feb...
          numTourStarts: { $sum: 1 }, // Counts number of tours in that month
          tours: { $push: '$name' }, // Collects all tour names into an array
        },
      },
      {
        // 4) addFields: Adds a "month" field equal to the _id (month number)
        $addFields: { month: '$_id' },
      },
      {
        // 5) project: Exclude the _id field (keep results clean)
        $project: { _id: 0 },
      },
      {
        // 6) sort: Sort months by number of tour starts (descending)
        $sort: { numTourStarts: -1 },
      },
      {
        // 7) limit: Only include max 12 results (1 per month)
        $limit: 12,
      },
    ]);

    // Send successful response
    res.status(200).json({
      status: 'success',
      data: {
        plan: plan, // array of monthly stats
      },
    });
  } catch (err) {
    // Handle errors
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

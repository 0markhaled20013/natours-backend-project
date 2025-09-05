let mongoose = require('mongoose');
let slugify = require('slugify');
// let validator = require('validator');
let tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A tour must have a name'],
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], // validator package
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: String,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: String,
      required: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() but not on .insertMany() or .update()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); // create slug from name field and convert it to lowercase to use in URL
  next();
});
// tourSchema.pre('save', (next) => {
//   console.log('Will save document...');
//   next();
// });
// tourSchema.post('save', (doc, next) => { // runs after .save() and .create() only (not on .insertMany() or .update())
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE: runs before and after any find query
tourSchema.pre(/^find/, function (next) {
  // /^find/ is a regular expression to match all find queries (find, findOne, findById, etc.)
  // this points to the current query

  this.find({ secretTour: { $ne: true } }); // exclude secret tours from any find query
  this.start = Date.now();

  next();
});
tourSchema.post(/^find/, function (docs, next) {
  // docs are the documents returned by the query from the database
  console.log(`Query took ${Date.now() - this.start} milliseconds!`); // start is set in the pre middleware above
  next();
});

// AGGREGATION MIDDLEWARE: runs before and after any aggregation
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // exclude secret tours from any aggregation pipeline
  // pipleline() returns the aggregation array and unshift() adds the $match stage at the beginning of the array
  console.log(this.pipeline()); // this points to the current aggregation object
  next();
});

// Document middleware vs Query middleware →
//          pre('save') works only with .save() or .create(), not with updateOne.
//          Use pre('findOneAndUpdate') for updates.
// ✅ Quick Recap:
// Document Middleware → pre('save'), post('save')
// Query Middleware → pre('find'), post('find')
// Aggregate Middleware → pre('aggregate')

let Tour = mongoose.model('Tour', tourSchema);
// let testTour = new Tour({
//   name: 'The Park Camper2222',
//   price: 997,
//   rating: 4.7,
// });
// testTour
//   .save()
//   .then((e) => {
//     console.log('saved ');
//     console.log(e);
//   })
//   .catch((err) => {
//     console.log('Error saving tour:', err);
//   });

module.exports = Tour;

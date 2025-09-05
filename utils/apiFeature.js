class apiFeatures {
  constructor(query, queryString) {
    this.query = query; // Mongoose query object (e.g. Tour.find())
    this.queryString = queryString; // req.query (from Express)
  }

  filter() {
    // 1) Filtering
    console.log(this.queryString);
    let objQuery = { ...this.queryString };
    let excludedFields = ['page', 'sort', 'limit', 'fields']; // fields to be excluded out from the query
    excludedFields.forEach((el) => delete objQuery[el]); // delete the excluded fields from the query object
    console.log(objQuery);

    // 2) Advanced Filtering
    let queryStr = JSON.stringify(objQuery);
    queryStr = queryStr.replace(
      // to add $ before gt, gte, lt, lte, eq for mongoose query
      /\b(gt|gte|lt|lte|eq)\b/g, // \b means word boundary, g means global to replace all occurrences in the string
      (match) => `$${match}` // add $ before the match
    );
    console.log(queryStr);

    this.query = this.query.find(JSON.parse(queryStr)); // find() returns a query object so we can chain other methods to it
    return this; // return the entire object to allow chaining methods
  }

  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort.split(',').join(' '); // convert comma separated string to space separated string
      console.log(sortBy);
      this.query = this.query.sort(sortBy); // sort the result by the sortBy fields
    } else {
      this.query = this.query.sort('-createdAt'); // sort the result by createdAt in descending order
    }
    return this;
  }

  limitFields() {
    // 4) Field Limiting
    // full example: ?fields=name,duration,difficulty,price
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(',').join(' '); // convert comma separated string to space separated string
      console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // exclude the __v field from the result
    }
    return this;
  }

  paginate() {
    // 3) Pagination
    // example : ?page=2&limit=10 → skip 10, return next 10.
    let page = this.queryString.page * 1 || 1; // convert string to number
    let limit = this.queryString.limit * 1 || 100; // convert string to number
    let skip = (page - 1) * limit; // calculate skip value

    this.query = this.query.skip(skip).limit(limit); // apply pagination

    return this;
  }
}
module.exports = apiFeatures;

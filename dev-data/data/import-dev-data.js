/* eslint-disable no-undef */
let dotenv = require('dotenv');
let fs = require('fs');
let tour = require('../../models/tourModel');
let mongoose = require('mongoose');
dotenv.config({ path: './config.env' }); // Load environment variables from config.env file

// 1) connect to database
let DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('DB connection successful!');
  })
  .catch((err) => {
    console.log('DB connection failed!');
    console.log(err);
  });

//read jsonn file
let tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

//import data into db
const importData = async () => {
  try {
    await tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//delete all data
const deleteData = async () => {
  try {
    await tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
// node dev-data\data\import-dev-data.js --import
// node dev-data\data\import-dev-data.js --delete

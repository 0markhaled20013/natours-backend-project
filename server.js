/* eslint-disable no-undef */
let dotenv = require('dotenv');
let mongoose = require('mongoose');
dotenv.config({ path: './config.env' }); // Load environment variables from config.env file
let app = require('./app');
let PORT = process.env.PORT || 3000;
// console.log(process.env); // CHECK environment variable
console.log(process.env.ASMY); // CHECK environment variable

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

// 4) start server
app.listen(PORT, () => {
  console.log('web server is running on port ' + PORT);
  console.log('http://localhost:' + PORT);
});

// hello this comment from ndb
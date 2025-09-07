const User = require('../models/userModel');
let catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res) => {
  let newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
// exports.login = (req, res) => {};);

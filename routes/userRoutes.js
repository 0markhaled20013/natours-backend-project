let express = require('express');
let router = express.Router();
const authController = require('../controllers/authController');

let {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.login);
router.post('/resetPassword', authController.login);
router.route('/').get(authController.protect, getAllUsers).post(createUser);
router
  .route('/:id') // ex: /api/v1/users/234234
  .get(getUser)
  .post(updateUser)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    deleteUser
  );

module.exports = router;

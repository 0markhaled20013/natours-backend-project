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
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).post(updateUser).delete(deleteUser);

module.exports = router;

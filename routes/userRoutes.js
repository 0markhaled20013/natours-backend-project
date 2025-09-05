let express = require('express');
let router = express.Router();
let {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).post(updateUser).delete(deleteUser);

module.exports = router;

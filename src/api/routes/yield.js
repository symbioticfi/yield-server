const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const yieldControllers = require('../controllers/yield');

const router = express.Router();

router.route('/chart/:pool').get(asyncHandler(yieldControllers.getYieldHistory));
router
  .route('/chartLendBorrow/:pool')
  .get(asyncHandler(yieldControllers.getYieldLendBorrowHistory));
router.route('/volume/:pool').get(asyncHandler(yieldControllers.getVolumeHistory));

module.exports = router;

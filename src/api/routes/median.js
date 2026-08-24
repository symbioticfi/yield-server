const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const router = express.Router();
const median = require('../controllers/median');

router.route('/median').get(asyncHandler(median.getMedian));
router.route('/medianProject/:project').get(asyncHandler(median.getMedianProject));

module.exports = router;

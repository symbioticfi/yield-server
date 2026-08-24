const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const router = express.Router();
const lsd = require('../controllers/lsd');

router.route('/lsdRates').get(asyncHandler(lsd.getLsd));

module.exports = router;

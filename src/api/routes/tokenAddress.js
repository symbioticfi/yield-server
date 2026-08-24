const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const router = express.Router();
const tokenAddress = require('../controllers/tokenAddress');

router.route('/tokenAddress').get(asyncHandler(tokenAddress.getTokenAddress));

module.exports = router;

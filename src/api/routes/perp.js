const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const router = express.Router();
const perp = require('../controllers/perp');

router.route('/perps').get(asyncHandler(perp.getPerp));

module.exports = router;

const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const config = require('../controllers/config');

const router = express.Router();

router.route('/url').get(asyncHandler(config.getUrl));
router.route('/distinctID').get(asyncHandler(config.getDistinctID));
router.route('/configPool/:configID').get(asyncHandler(config.getConfigPool));
router.route('/allPools').get(asyncHandler(config.getAllPools));

module.exports = router;

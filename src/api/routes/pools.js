const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const router = express.Router();
const pools = require('../controllers/pools');

router.route('/pools').get(asyncHandler(pools.getPools));
router.route('/lendBorrow').get(asyncHandler(pools.getLendBorrow));

module.exports = router;

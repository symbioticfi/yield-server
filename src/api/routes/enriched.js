const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const enriched = require('../controllers/enriched');

const router = express.Router();

router.route('/poolsEnriched').get(asyncHandler(enriched.getPoolEnriched));
router.route('/poolsPro').get(asyncHandler(enriched.getPoolsEnrichedPro));
router.route('/poolsOld').get(
  (req, res, next) => {
    res.set('Link', '</poolsPro>; rel="successor-version"');
    res.set('X-Preferred-Route', '/poolsPro');
    res.set('X-Notice', 'Prefer /poolsPro; this alias remains available.');
    next();
  },
  asyncHandler(enriched.getPoolsEnrichedPro)
);
router.route('/poolsBorrow').get(asyncHandler(enriched.getPoolsBorrow));

module.exports = router;

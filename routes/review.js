const express = require("express");
const router = express.Router({mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview  , isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");



// reviews

// 1.post review route

router.post("/",
   isLoggedIn,
    validateReview, 
  wrapAsync(reviewController.createReview)
);

// 2. delete review route
router.delete(
"/:reviewId",
isLoggedIn,
isReviewAuthor,
wrapAsync(reviewController.destroyReview)
);

module.exports = router;


const express = require("express");
const router = express.Router();
const advertizementController = require("../controllers/advertizement.controller");
const authorize = require("../middleware/authorize");

router.get("/get", advertizementController.getAdvertizementList);
router.use(authorize.authorization);
router.post(
  "/addEditAdvertizement",
  advertizementController.addEditAdvertizement
);
router.delete("/delete/:id", advertizementController.deleteAdvertizement);

module.exports = router;

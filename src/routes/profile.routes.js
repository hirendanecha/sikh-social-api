const express = require("express");
const router = express.Router();
const profileController = require("./../controllers/profile.controller");
const authorize = require("../middleware/authorize");

router.get("/getGroupBasicDetails/:uniqueLink", profileController.getGroupBasicDetails);
router.use(authorize.authorization);
router.get("/groupsAndPosts", profileController.groupsAndPosts);
router.get("/getGroups", profileController.getGroups);
router.get("/getGroupPostById/:id", profileController.getGroupPostById);
router.get("/getGroupFileResourcesById/:id", profileController.getGroupFileResourcesById);
router.post("/groupsLists", profileController.groupsLists);
router.post("/create-group", profileController.createGroup);
router.put("/edit-group/:id", profileController.editGroups);
router.post("/join-group", profileController.joinGroup);
router.post("/leave-group", profileController.leaveGroup);
router.delete("/delete-group/:id", profileController.deleteGroup);
module.exports = router;
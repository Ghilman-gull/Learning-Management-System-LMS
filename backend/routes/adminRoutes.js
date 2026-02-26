const express = require("express");
const router = express.Router();

const { deleteNow , scheduleDelete , getPendingTeachers, approveTeacher} = require("../controller/adminController");
const authAdmin = require('../middleware/authAdmin')

router.delete("/students/delete-now", deleteNow);

router.post("/students/delete-later", scheduleDelete);


router.get('/teachers', authAdmin, getPendingTeachers)

router.patch('/teachers/:id/approve', authAdmin, approveTeacher)

module.exports = router;

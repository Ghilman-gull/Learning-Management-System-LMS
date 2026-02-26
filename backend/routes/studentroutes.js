const express = require('express')
const {
  addStudent,
  getMyStudents,
  studentLogin,
  getStudentDashboard,
  uploadProfilePic,
 getAllStudentsForAdmin } = require('../controller/studentController')

const teacherAuth = require('../middleware/authMiddleware')  
const studentAuth = require('../middleware/studentAuthMiddleware')  
const upload = require('../middleware/upload') 

const router = express.Router()

router.post('/add', teacherAuth, addStudent)
router.get('/my-students', teacherAuth, getMyStudents)

router.post('/login', studentLogin)
router.get('/me', studentAuth, getStudentDashboard)

router.post(
  '/upload-profile-pic',
  studentAuth,  
  upload.single('image'),
  uploadProfilePic       
 )

router.get('/admin/all-students', getAllStudentsForAdmin)


module.exports = router

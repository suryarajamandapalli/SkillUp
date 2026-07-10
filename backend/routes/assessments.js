const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const auth = require('../middleware/auth');

// @route   POST api/assessments
// @desc    Submit assessment form and predict career path
// @access  Private
router.post('/', auth, assessmentController.submitAssessment);

// @route   GET api/assessments
// @desc    Get assessment history for active user
// @access  Private
router.get('/', auth, assessmentController.getUserAssessments);

// @route   GET api/assessments/all
// @desc    Get all assessments (Admin panel dashboard)
// @access  Private
router.get('/all', auth, assessmentController.getAllAssessments);

// @route   GET api/assessments/analytics
// @desc    Get counts and average scores
// @access  Private
router.get('/analytics', auth, assessmentController.getAnalytics);

// @route   GET api/assessments/:id/pdf
// @desc    Download assessment PDF report
// @access  Private
router.get('/:id/pdf', auth, assessmentController.downloadReportPDF);

module.exports = router;

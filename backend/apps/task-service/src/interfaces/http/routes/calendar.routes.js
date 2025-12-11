import express from 'express';
import * as calendarController from '../controllers/calendar.controller.js';

const router = express.Router();

/**
 * @swagger
 * /calendar/feed.ics:
 *   get:
 *     summary: Get iCalendar subscription feed
 *     tags: [Calendar]
 *     responses:
 *       200:
 *         description: Returns .ics file
 */
router.get('/feed.ics', calendarController.getCalendarFeed);

export default router;

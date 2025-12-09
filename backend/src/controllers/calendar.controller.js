import * as calendarService from '../services/calendar.service.js';

export const getCalendarFeed = async (req, res) => {
    try {
        const calendar = await calendarService.generateCalendarFeed();
        
        res.set('Content-Type', 'text/calendar; charset=utf-8');
        res.set('Content-Disposition', 'attachment; filename="calendar.ics"');

        res.send(calendar.toString());
        
    } catch (error) {
        console.error('Calendar Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
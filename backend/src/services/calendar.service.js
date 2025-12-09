import ical from 'ical-generator';
import * as calendarRepository from '../repositories/calendar.repository.js';

export const generateCalendarFeed = async () => {
    const tasks = await calendarRepository.findTasksForCalendar();
    const PORT = process.env.PORT ?? 3000;
    const calendar = ical({
        name: 'Task Management Calendar',
        timezone: 'Asia/Jakarta',
    });

    tasks.forEach(task => {
        const eventData = {
            start: new Date(task.dueDate),
            allDay: true,
            summary: `[${task.priority.toUpperCase()}] ${task.title}`,
            description: `${task.description}\n\nStatus: ${task.status}`,
            uid: task.id,
            url: `http://localhost:${PORT}/tasks/${task.id}`
        };

        if (task.reminderAt) {
            const dueDateObj = new Date(task.dueDate);
            const reminderObj = new Date(task.reminderAt);
            const triggerSeconds = (dueDateObj.getTime() - reminderObj.getTime()) / 1000;

            if (triggerSeconds > 0) {
                eventData.alarms = [
                    {
                        type: 'display',
                        trigger: triggerSeconds,
                    }
                ];
            }
        }

        calendar.createEvent(eventData);
    });

    return calendar;
};
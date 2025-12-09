import prisma from '../config/database.js';

export const findTasksForCalendar = async () => {
    return await prisma.taskManagement.findMany({
        where: {
            deletedAt: null,
            dueDate: { not: null } // Hanya ambil yang punya tanggal
        },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            reminderAt: true 
        }
    });
};
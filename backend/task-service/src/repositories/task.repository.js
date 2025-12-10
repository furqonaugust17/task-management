import prisma from '../config/database.js';

export const findAllTasks = async () => {
    return await prisma.taskManagement.findMany({
        where: {
            deletedAt: null
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const findTaskById = async (id) => {
    return await prisma.taskManagement.findFirst({
        where: {
            id: id,
            deletedAt: null
        }
    });
};
export const createTask = async (data) => {
    return await prisma.taskManagement.create({
        data
    });
};

export const updateTask = async (id, data) => {
    return await prisma.taskManagement.update({
        where: { id },
        data
    });
};

export const deleteTask = async (id) => {
    return await prisma.taskManagement.update({
        where: { id },
        data: {
            deletedAt: new Date()
        }
    });
};

export const restoreTask = async (id) => {
    return await prisma.taskManagement.update({
        where: { id },
        data: { deletedAt: null }
    });
};
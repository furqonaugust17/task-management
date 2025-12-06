import * as taskRepository from '../repositories/task.repository.js';
import { isEmpty, isValidDate, hasRequiredFields, isValueInEnum } from '../utils/validation.utils.js';
import { pick } from '../utils/object.utils.js'; 

const TaskStatus = {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    DONE: 'done'
};

const TaskPriority = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

export const getAllTasks = async () => {
    return await taskRepository.findAllTasks();
};

export const getTaskById = async (id) => {
    const task = await taskRepository.findTaskById(id);
    if (!task) {
        throw new Error('Task not found');
    }
    return task;
};

export const createNewTask = async (data) => {
    if (isEmpty(data)) {
        throw new Error('Data payload cannot be empty');
    }

    const required = ['title', 'description'];
    if (!hasRequiredFields(data, required)) {
        throw new Error('Title and Description are required');
    }

    if (data.status && !isValueInEnum(data.status, TaskStatus)) {
        throw new Error('Invalid status value');
    }
    if (data.priority && !isValueInEnum(data.priority, TaskPriority)) {
        throw new Error('Invalid priority value');
    }

    if (data.dueDate && !isValidDate(data.dueDate)) {
        throw new Error('Invalid due date format');
    }

    const payload = {
        title: data.title,
        description: data.description,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        owner: data.owner || null
    };

    return await taskRepository.createTask(payload);
};

export const updateTask = async (id, data) => {
    await getTaskById(id);

    if (isEmpty(data)) {
        throw new Error('No data provided for update');
    }

    if (data.dueDate && !isValidDate(data.dueDate)) {
        throw new Error('Invalid due date format');
    }

    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'owner'];
    const payload = pick(data, allowedFields);

    if (payload.dueDate) {
        payload.dueDate = new Date(payload.dueDate);
    }

    return await taskRepository.updateTask(id, payload);
};

export const deleteTask = async (id) => {
    await getTaskById(id);
    return await taskRepository.deleteTask(id);
};

export const restoreTask = async (id) => {
    try {
        return await taskRepository.restoreTask(id);
    } catch (error) {
        if (error.code === 'P2025') {
            throw new Error('Task not found or already restored');
        }
        throw error;
    }
};
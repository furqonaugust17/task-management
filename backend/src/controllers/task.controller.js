import * as taskService from '../services/task.service.js';
import { isEmpty } from '../utils/validation.utils.js';

export const getTasks = async (req, res) => {
    try {
        const tasks = await taskService.getAllTasks();
        res.json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTask = async (req, res) => {
    try {
        const task = await taskService.getTaskById(req.params.id);
        res.json({ success: true, data: task });
    } catch (error) {
        if (error.message === 'Task not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createTask = async (req, res) => {
    try {
        if (isEmpty(req.body)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Request body cannot be empty' 
            });
        }

        const newTask = await taskService.createNewTask(req.body);
        res.status(201).json({ success: true, data: newTask });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        if (isEmpty(req.body)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Request body cannot be empty' 
            });
        }

        const updatedTask = await taskService.updateTask(req.params.id, req.body);
        res.json({ success: true, data: updatedTask });
    } catch (error) {
        const status = error.message === 'Task not found' ? 404 : 400;
        res.status(status).json({ success: false, message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        await taskService.deleteTask(req.params.id);
        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        const status = error.message === 'Task not found' ? 404 : 500;
        res.status(status).json({ success: false, message: error.message });
    }
};

export const restoreTask = async (req, res) => {
    try {
        await taskService.restoreTask(req.params.id);
        res.json({ 
            success: true, 
            message: 'Task restored successfully' 
        });
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 500;
        res.status(status).json({ 
            success: false, 
            message: error.message 
        });
    }
};
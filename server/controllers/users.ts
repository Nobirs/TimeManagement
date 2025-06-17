import {Request, Response} from 'express';
import prisma from '../services/prisma';
import { User } from '@time-management/shared-types';

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
    try{
        const users = await prisma.user.findMany();
        res.json({data: users});
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({error: 'Failed to fetch users'});
    }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const user = await prisma.user.findUnique({where: {id}});
        if (!user) {
            res.status(404).json({error: 'User not found'});
            return;
        }
        res.json({data: user});
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({error: 'Failed to fetch user'});
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = req.body;
        const newUser = await prisma.user.create({data: user});
        res.status(201).json({data: newUser});
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({error: 'Failed to create user'});
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        let user = req.body;
        const updatedUser = await prisma.user.update({where: {id}, data: user});
        res.json({data: updatedUser});
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({error: 'Failed to update user'});
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const user = await prisma.user.delete({where: {id}});
        if (!user) {
            res.status(404).json({error: 'User not found'});
        }
        res.json({success: true});
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({error: 'Failed to delete user'});
    }
};
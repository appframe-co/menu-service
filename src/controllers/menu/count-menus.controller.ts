import Menu from '@/models/menu.model';
import {TErrorResponse, TParameters} from '@/types/types';

type TMenuInput = {
    userId: string;
    projectId: string;
}

type TMenuFilter = {
    userId: string;
    projectId: string;
}

export default async function CountMenus(menuInput: TMenuInput, parameters: TParameters = {}): Promise<TErrorResponse | {count: number}> {
    try {
        const {userId, projectId} = menuInput;

        if (!userId || !projectId) {
            throw new Error('userId & projectId query required');
        }

        const filter: TMenuFilter = {userId, projectId};
        const count: number = await Menu.countDocuments(filter);

        return {count};
    } catch (error) {
        throw error;
    }
}
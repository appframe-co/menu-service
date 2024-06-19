import Item from '@/models/item.model';
import {TErrorResponse, TParameters} from '@/types/types';

type TItemInput = {
    userId: string;
    projectId: string;
    menuId: string;
}

type TItemFilter = {
    userId: string;
    projectId: string;
    menuId: string;
}

export default async function CountItems(itemInput: TItemInput, parameters: TParameters = {}): Promise<TErrorResponse | {count: number}> {
    try {
        const {userId, projectId, menuId} = itemInput;

        if (!userId || !projectId || !menuId) {
            throw new Error('userId & projectId & menuId query required');
        }

        const filter: TItemFilter = {userId, projectId, menuId};
        const count: number = await Item.countDocuments(filter);

        return {count};
    } catch (error) {
        throw error;
    }
}
import Item from '@/models/item.model';
import { TErrorResponse, TItemModel } from '@/types/types';

type TItemInput = {
    userId: string;
    projectId: string; 
    id: string;
}
export default async function DeleteItem(sectionInput: TItemInput): Promise<TErrorResponse | {}> {
    try {
        const {userId, projectId, id} = sectionInput;

        if (!id) {
            throw new Error('invalid request');
        }

        const item: TItemModel|null  = await Item.findOneAndDelete({
            userId, 
            projectId, 
            _id: id
        }, {});
        if (!item) {
            throw new Error('invalid item');
        }

        return {};
    } catch (error) {
        throw error;
    }
}
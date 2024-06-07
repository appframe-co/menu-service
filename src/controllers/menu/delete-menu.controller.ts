import Menu from '@/models/menu.model';
import { TMenuModel, TErrorResponse } from '@/types/types';

type TMenuInput = {userId: string, projectId: string, id: string};

export default async function DeleteMenuController(menuInput: TMenuInput): Promise<TErrorResponse | {}> {
    try {
        const {userId, projectId, id} = menuInput;
        if (!id) {
            throw new Error('invalid request');
        }

        const menu: TMenuModel|null = await Menu.findOneAndDelete({
            userId, 
            projectId, 
            _id: id
        }, {});
        if (!menu) {
            throw new Error('invalid menu');
        }

        return {};
    } catch (error) {
        throw error;
    }
}
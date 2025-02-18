import Item from '@/models/item.model';
import Menu from '@/models/menu.model';
import { TErrorResponse, TItemModel, TMenuModel } from '@/types/types';

type TItemInput = {
    userId: string;
    projectId: string; 
    menuId: string; 
    id: string;
}

type TItemOutput = {
    menu: {
        id: string;
        code: string;
    }|null;
}

export default async function DeleteItem(itemInput: TItemInput): Promise<TErrorResponse | TItemOutput> {
    try {
        const {userId, projectId, menuId, id} = itemInput;

        if (!id) {
            throw new Error('invalid request');
        }

        const menu: TMenuModel|null = await Menu.findOne({userId, projectId, _id: menuId});
        if (!menu) {
            throw new Error('invalid menu');
        }

        const item: TItemModel|null  = await Item.findOneAndDelete({
            userId, 
            projectId, 
            _id: id
        }, {});
        if (!item) {
            throw new Error('invalid item');
        }

        return {
            menu: {
                id: menu.id,
                code: menu.code
            }
        };
    } catch (error) {
        throw error;
    }
}
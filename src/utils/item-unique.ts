import { TItemModel } from "@/types/types";
import Item from '@/models/item.model';

type TPayload = {
    projectId: string;
    menuId: string;
    itemId?:string;
    key: string;
}

export async function checkItemUnique(value: string|null, payload: TPayload): Promise<boolean|null> {
    try {
        const {projectId, menuId, key, itemId} = payload;

        if (!projectId || !key) {
            throw new Error('projectId & key is required');
        }

        const filter: {[key:string]: any} = {projectId, menuId, [key]: value};
        if (itemId) {
            filter['_id'] = {$ne: itemId};
        }
        const item: TItemModel|null = await Item.findOne(filter);
        if (item) {
            return false;
        }

        return true;
    } catch (e) {
        return null;
    }
}
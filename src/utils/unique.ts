import { TMenuModel } from "@/types/types";
import Menu from '@/models/menu.model';

type TPayload = {
    projectId: string;
    menuId?: string;
    key: string;
}

export async function checkUnique(value: string|null, payload: TPayload): Promise<boolean|null> {
    try {
        const {projectId, menuId, key} = payload;

        if (!projectId || !key) {
            throw new Error('projectId & key is required');
        }

        const filter: {[key:string]: any} = {projectId, [key]: value};
        if (menuId) {
            filter['_id'] = {$ne: menuId};
        }
        const menu: TMenuModel|null = await Menu.findOne(filter);
        if (menu) {
            return false;
        }

        return true;
    } catch (e) {
        return null;
    }
}
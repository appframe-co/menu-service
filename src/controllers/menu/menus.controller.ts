import Menu from '@/models/menu.model';
import {TMenu, TMenusInput, TErrorResponse, TMenuModel, TParameters} from '@/types/types';

export default async function Menus(menuInput: TMenusInput, parameters: TParameters = {}): Promise<TErrorResponse | {menus: TMenu[]}>{
    try {
        const {userId, projectId} = menuInput;

        if (!userId || !projectId) {
            throw new Error('userId & projectId query required');
        }

        const defaultLimit = 10;

        const filter: any = {userId, projectId};
        let {sinceId, limit=defaultLimit, page=1, ids} = parameters;

        if (limit > 250) {
            limit = defaultLimit;
        }
        if (sinceId) {
            filter['_id'] = {$gt: sinceId};
        }
        if (ids) {
            filter['_id'] = {$in: ids.split(',')};
        }

        const skip = (page - 1) * limit;
        const menus: TMenuModel[] = await Menu.find(filter).skip(skip).limit(limit);
        if (!menus) {
            throw new Error('invalid menus');
        }

        const output = menus.map(menu => ({
            id: menu.id,
            userId: menu.userId,
            projectId: menu.projectId,
            title: menu.title,
            handle: menu.handle,
            items: menu.items,
            createdAt: menu.createdAt
        }));

        return {menus: output};
    } catch (error) {
        throw error;
    }
}
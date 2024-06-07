import Menu from '@/models/menu.model';
import { TErrorResponse, TMenu, TMenuModel } from '@/types/types'

export default async function MenuController(
    {userId, projectId, id}: 
    {userId: string, projectId: string, id: string}
    ): Promise<TErrorResponse | {menu: TMenu}> {
    try {
        const menu: TMenuModel|null = await Menu.findOne({_id: id, userId, projectId});
        if (!menu) {
            throw new Error('invalid menu');
        }

        const output = {
            id: menu.id,
            projectId: menu.projectId,
            title: menu.title, 
            handle: menu.handle,
            items: menu.items
        };

        return {menu: output};
    } catch (error) {
        throw error;
    }
}
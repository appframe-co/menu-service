import Menu from '@/models/menu.model';
import { TField, TErrorResponse, TMenu, TMenuModel } from '@/types/types'

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
            userId: menu.userId,
            projectId: menu.projectId,
            name: menu.name,
            code: menu.code,
            translations: menu.translations,
            items: {
                fields: menu.items.fields.map((field: TField) => ({
                    id: field.id,
                    type: field.type,
                    name: field.name,
                    key: field.key,
                    description: field.description,
                    validations: field.validations.map(v => ({
                        type: v.type,
                        code: v.code,
                        value: v.value
                    })),
                    system: field.system
                }))
            }
        };

        return {menu: output};
    } catch (error) {
        throw error;
    }
}
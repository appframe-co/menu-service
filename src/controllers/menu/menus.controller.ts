import Menu from '@/models/menu.model';
import {TMenu, TMenusInput, TErrorResponse, TMenuModel, TParameters, TField, TSort} from '@/types/types';

type TMenusFilter = {
    userId: string;
    projectId: string;
    code?: string;
}

export default async function Menus(menuInput: TMenusInput, parameters: TParameters = {}): Promise<TErrorResponse | {menus: TMenu[]}>{
    try {
        const {userId, projectId} = menuInput;

        if (!userId || !projectId) {
            throw new Error('userId & projectId query required');
        }

        const sort: TSort = {};
        const defaultLimit = 10;
        const filter: TMenusFilter = {userId, projectId};
        let {limit=defaultLimit, code} = parameters;

        if (limit > 250) {
            limit = defaultLimit;
        }
        if (code) {
            filter.code = code;
        }

        sort['_id'] = 'asc';

        const menus: TMenuModel[] = await Menu.find(filter).limit(limit).sort(sort);
        if (!menus) {
            throw new Error('invalid menus');
        }

        const output = menus.map(menu => ({
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
        }));

        return {menus: output};
    } catch (error) {
        throw error;
    }
}
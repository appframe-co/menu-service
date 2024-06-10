import Menu from '@/models/menu.model';
import { TMenuInput, TMenu, TMenuModel } from '@/types/types';
import { validateArray } from '@/utils/validators/array.validator';
import { validateBoolean } from '@/utils/validators/boolean.validator';
import { validateDate } from '@/utils/validators/date.validator';
import { validateDateTime } from '@/utils/validators/datetime.validator';
import { validateNumber } from '@/utils/validators/number.validator';
import { validateString } from '@/utils/validators/string.validator';

import { checkUnique } from '@/utils/unique';

function isErrorMenu(data: null|TMenuModel): data is null {
    return (data as null) === null;
}

export default async function CreateMenu(menuInput: TMenuInput): Promise<{menu: TMenu|null, userErrors: any}> {
    try {
        const {userId, projectId, ...menuBody} = menuInput;

        if (!userId || !projectId) {
            throw new Error('userId & projectId required');
        }

        const {errors: errorsForm, data: validatedData} = await (async (data) => {
            try {
                const errors: any = [];
                const output: any = {};

                output.menu = await (async function() {
                    const menu: any = {};

                    const {title} = data;
                    const [errorsTitle, valueTitle] = validateString(title, {required: true, min: 3, max: 255});
                    if (errorsTitle.length > 0) {
                        errors.push({field: ['title'], message: errorsTitle[0]}); 
                    }
                    menu.title = valueTitle;

                    const {handle} = data;
                    const [errorsHandle, valueHandle] = validateString(handle, {
                        required: true,
                        min: 3,
                        max: 255,
                        regex: [
                            new RegExp('^[a-z0-9\-_]+$'),
                            "Handle can’t include spaces or special characters (i.e. $ # !)"
                        ]
                    });
                    if (errorsHandle.length > 0) {
                        errors.push({field: ['handle'], message: errorsHandle[0]}); 
                    }
                    const isUniquie: boolean|null = await checkUnique(valueHandle, {projectId, key: 'handle'});
                    if (isUniquie === false) {
                        errors.push({field: ['handle'], message: 'Handle must be unique'});
                    }
                    menu.handle = valueHandle;

                    const {items} = data;
                    const [errorsItems, valueItems] = validateArray(items, {required: false, max: 100});
                    if (errorsItems.length > 0) {
                        errors.push({field: ['items'], message: errorsItems[0]});
                    }
                    menu.items = valueItems.map((v:any, k:number) => {
                        const {type, title, url, subject, subjectId} = v;

                        const [errorsType, valueType] = validateString(type,
                            {required: true, choices: [['http', 'ref']]}
                        );
                        if (errorsType.length > 0) {
                            errors.push({field: ['items', k, 'type'], message: errorsType[0]});
                        }

                        const [errorsTitle, valueTitle] = validateString(title, {required: true, max: 255});
                        if (errorsTitle.length > 0) {
                            errors.push({field: ['items', k, 'title'], message: errorsTitle[0]}); 
                        }

                        const [errorsUrl, valueUrl] = validateString(url, {required: true, max: 655});
                        if (errorsUrl.length > 0) {
                            errors.push({field: ['items', k, 'url'], message: errorsUrl[0]}); 
                        }

                        const [errorsSubject, valueSubject] = validateString(subject,
                            {required: false, choices: [['structure']]}
                        );
                        if (errorsSubject.length > 0) {
                            errors.push({field: ['items', k, 'subject'], message: errorsSubject[0]});
                        }

                        const [errorsSubjectId, valueSubjectId] = validateString(subjectId, {required: false, max: 255});
                        if (errorsSubjectId.length > 0) {
                            errors.push({field: ['items', k, 'subjectId'], message: errorsSubjectId[0]}); 
                        }

                        return {
                            type: valueType,
                            title: valueTitle,
                            url: valueUrl,
                            subject: valueSubject,
                            subjectId: valueSubjectId
                        };
                    });

                    return menu;
                }());

                return {errors, data: output};
            } catch (e) {
                let message = 'Error';
                if (e instanceof Error) {
                    message = e.message;
                }

                return {errors: [{message}]};
            }
        })(menuBody);
        if (Object.keys(errorsForm).length > 0) {
            return {
                menu: null,
                userErrors: errorsForm
            };
        }

        const {errors: errorsDB, data: savedData} = await (async (data) => {
            try {
                const errors: any = [];
                const output: any = {};

                const menu: TMenuModel|null = await Menu.create({
                    userId, 
                    projectId,
                    createdBy: userId,
                    updatedBy: userId, 
                    ...data.menu
                });
                if (isErrorMenu(menu)) {
                    throw new Error('invalid menu');
                }

                const {id: menuId} = menu;
                output.menuId = menuId;

                if (errors.length > 0) {
                    return {errors};
                }

                return {errors, data: output};
            } catch (e) {
                let message;
                if (e instanceof Error) {
                    message = e.message;
                }
                return {errors: [{message}]};
            }
        })(validatedData);
        if (Object.keys(errorsDB).length > 0) {
            return {
                menu: null,
                userErrors: errorsDB
            }
        }

        const {errors: errorsRes, data: obtainedData} = await (async (data): Promise<{errors: any, data: {menu: TMenu|null}}> => {
            try {
                const errors: any = [];
                let output: {menu: TMenu|null} = {menu: null};

                const {menuId} = data;

                const menu: TMenuModel|null = await Menu.findOne({userId, projectId, _id: menuId});
                if (isErrorMenu(menu)) {
                    output.menu = null;
                } else {
                    output.menu = {
                        id: menu.id, 
                        projectId: menu.projectId,
                        title: menu.title, 
                        handle: menu.handle,
                        items: menu.items
                    }
                }

                return {errors, data: output};
            } catch (e) {
                let message;
                if (e instanceof Error) {
                    message = e.message;
                }
                return {errors: [{message}], data: {menu: null}};
            }
        })(savedData);
        if (Object.keys(errorsRes).length > 0) {
            return {
                menu: null,
                userErrors: errorsRes
            }
        }

        return {
            menu: obtainedData.menu,
            userErrors: []
        };
    } catch (e) {
        let message;
        if (e instanceof Error) {
            message = e.message;
        }
        return {
            menu: null,
            userErrors: [{message}]
        };
    }
}
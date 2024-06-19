import Menu from '@/models/menu.model';
import { TMenuInput, TMenu, TMenuModel, TField } from '@/types/types';
import { checkUnique } from '@/utils/unique';
import { validateArray } from '@/utils/validators/array.validator';
import { validateBoolean } from '@/utils/validators/boolean.validator';
import { validateDate } from '@/utils/validators/date.validator';
import { validateDateTime } from '@/utils/validators/datetime.validator';
import { validateNumber } from '@/utils/validators/number.validator';
import { validateString } from '@/utils/validators/string.validator';

function isErrorMenu(data: null|TMenuModel): data is null {
    return (data as null) === null;
}

export default async function UpdateMenu(menuInput: TMenuInput): Promise<{menu: TMenu|null, userErrors: any}> {
    try {
        const {userId, projectId, ...menuBody} = menuInput;

        if (!userId || !projectId) {
            throw new Error('userId & projectId required');
        }

        if (!menuBody.id) {
            throw new Error('Invalid menu id');
        }

        const menu = await Menu.findOne({_id: menuBody.id, userId, projectId});
        if (!menu) {
            throw new Error('Menu not found');
        }

        const menuId = menu.id;

        const {errors: errorsForm, data: validatedData} = await (async (data, payload) => {
            try {
                const errors: any = [];
                const output: any = {};

                const {menuId}: {menuId:string} = payload;

                output.menu = await (async function(menuId) {
                    const menu: any = {};

                    if (data.hasOwnProperty('name')) {
                        const {name} = data;
                        if (name !== undefined && name !== null) {
                            const [errorsName, valueName] = validateString(name, {required: true, min: 3, max: 255});
                            if (errorsName.length > 0) {
                                errors.push({field: ['name'], message: errorsName[0]}); 
                            }
                            menu.name = valueName;
                        }
                    }
                    if (data.hasOwnProperty('code')) {
                        const {code} = data;
                        if (code !== undefined && code !== null) {
                            const [errorsCode, valueCode] = validateString(code, {
                                required: true,
                                min: 3,
                                max: 255,
                                regex: [
                                    new RegExp('^[a-z0-9\-_]+$'),
                                    "Code can’t include spaces or special characters (i.e. $ # !)"
                                ]
                            });
                            if (errorsCode.length > 0) {
                                errors.push({field: ['code'], message: errorsCode[0]}); 
                            }
                            const isUniquie: boolean|null = await checkUnique(valueCode, {projectId, menuId, key: 'code'});
                            if (isUniquie === false) {
                                errors.push({field: ['code'], message: 'Code must be unique'});
                            }
                            menu.code = valueCode;
                        }
                    }
                    if (data.hasOwnProperty('items')) {
                        const {items} = data;
                        if (items !== undefined && items !== null) {
                            menu['items'] = {};

                            if (items.hasOwnProperty('fields')) {
                                const {fields} = items;
                                if (fields !== undefined && fields !== null) {
                                    const [errorsFields, valueFields] = validateArray(fields, {required: true, max: 10});
                                    if (errorsFields.length > 0) {
                                        errors.push({field: ['fields'], message: errorsFields[0]});
                                    }
            
                                    menu.items.fields = valueFields.map((v:any, k:number) => {
                                        const {id, type, name, key, description, validations, system} = v;

                                        const [errorsType, valueType] = validateString(type,
                                            {required: true, choices: [[
                                                'single_line_text', 'multi_line_text',
                                                'number_integer', 'number_decimal', 'boolean', 'money',
                                                'date_time', 'date',
                                                'file_reference',
                                                'list.single_line_text', 'list.date_time', 'list.date', 'list.file_reference',
                                                'url_handle'
                                            ]]}
                                        );
                                        if (errorsType.length > 0) {
                                            errors.push({field: ['items', 'fields', k, 'type'], message: errorsType[0]});
                                        }
                
                                        const [errorsName, valueName] = validateString(name, {required: true, max: 255});
                                        if (errorsName.length > 0) {
                                            errors.push({field: ['items', 'fields', k, 'name'], message: errorsName[0]}); 
                                        }
                
                                        const [errorsKey, valueKey] = validateString(key, {
                                            required: true, 
                                            min: 3,
                                            max: 64,
                                            regex: [
                                                new RegExp('^[a-z0-9\-_]+$'),
                                                "Key can’t include spaces or special characters (i.e. $ # !)"
                                            ]
                                        });
                                        if (errorsKey.length > 0) {
                                            errors.push({field: ['items', 'fields', k, 'key'], message: errorsKey[0]}); 
                                        }
                                        if (valueFields.filter((v:any) => v.key === valueKey).length > 1) {
                                            errors.push({field: ['items', 'fields', k, 'key'], message: 'Value must be unique'});
                                        }
                
                                        const [errorsDescription, valueDescription] = validateString(description, {max: 100});
                                        if (errorsDescription.length > 0) {
                                            errors.push({field: ['items', 'fields', k, 'description'], message: errorsDescription[0]}); 
                                        }
                
                                        const validatedValidations = validations.map((v:any, j:number) => {
                                            const {code, value, type} = v;
                
                                            const codes = ['required', 'unique', 'choices', 'max', 'min', 'regex', 'max_precision', 'field_reference', 'transliteration'];
                                            const [errorsCode, valueCode] = validateString(code, {required: true, choices: [codes]});
                                            if (errorsCode.length > 0) {
                                                errors.push({field: ['items', 'fields', k, 'validations', j, 'code'], message: errorsCode[0]});
                                            }
                
                                            const types = ['checkbox', 'text', 'number', 'date_time', 'date', 'list.text'];
                                            const [errorsType, valueType] = validateString(type, {required: true, choices: [types]});
                                            if (errorsType.length > 0) {
                                                errors.push({field: ['items', 'fields', k, 'validations', j, 'type'], message: errorsType[0]});
                                            }
                
                                            const [errorsValue, valueValue] = (function() {
                                                if (valueCode === 'required') {
                                                    return validateBoolean(value);
                                                }
                                                if (valueCode === 'unique') {
                                                    return validateBoolean(value);
                                                }
                                                if (valueCode === 'min') {
                                                    if (v.type === 'date_time') {
                                                        return validateDateTime(value);
                                                    }
                                                    if (v.type === 'date') {
                                                        return validateDate(value);
                                                    }
                                                    return validateNumber(value, {min: [0, "Validations contains an invalid value: 'min' must be positive."]});
                                                }
                                                if (valueCode === 'max') {
                                                    if (v.type === 'date_time') {
                                                        return validateDateTime(value);
                                                    }
                                                    if (v.type === 'date') {
                                                        return validateDate(value);
                                                    }
                                                    return validateNumber(value, {min: [0, "Validations contains an invalid value: 'max' must be positive."]});
                                                }
                                                if (valueCode === 'max_precision') {
                                                    return validateNumber(value, {
                                                        max: [9, "Validations 'max_precision' can't exceed the precision of 9."], 
                                                        min: [0, "Validations 'max_precision' can't be a negative number."]
                                                    });
                                                }
                                                if (valueCode === 'regex') {
                                                    return validateString(value, {max: 255});
                                                }
                                                if (valueCode === 'choices') {
                                                    return validateArray(value, {
                                                        unique: [true, "Validations has duplicate choices."], 
                                                        max: [5, "Validations contains a lot of choices."],
                                                        value: ['string', {
                                                            max: [255, "Validations contains an invalid value."]
                                                        }]
                                                    });
                                                }
                                                if (valueCode === 'field_reference') {
                                                    return validateString(value);
                                                }
                                                if (valueCode === 'transliteration') {
                                                    return validateBoolean(value);
                                                }
                
                                                return [[], null];
                                            }());
                                            if (errorsValue.length > 0) {
                                                if (valueCode === 'choices') {
                                                    for (let i=0; i < errorsValue.length; i++) {
                                                        if (!errorsValue[i]) {
                                                            continue;
                                                        }
                                                        errors.push({field: ['items', 'fields', k, 'validations', j, 'value', i], message: errorsValue[i]}); 
                                                    }
                                                } else {
                                                    errors.push({field: ['items', 'fields', k, 'validations', j, 'value'], message: errorsValue[0]}); 
                                                }
                                            }
                
                                            return {
                                                type: valueType,
                                                code: valueCode,
                                                value: valueValue,
                                            };
                                        });

                                        const [errorsSystem, valueSystem] = validateBoolean(system);
                                        if (errorsSystem.length > 0) {
                                            errors.push({field: ['items', 'fields', k, 'system'], message: errorsSystem[0]}); 
                                        }

                                        return {
                                            id,
                                            type: valueType,
                                            name: valueName,
                                            key: valueKey,
                                            description: valueDescription,
                                            validations: validatedValidations,
                                            system: valueSystem
                                        };
                                    });
                                }
                            }
                        }
                    }
                    if (data.hasOwnProperty('translations')) {
                        const {translations} = data;
                        if (translations !== undefined && translations !== null) {
                            const [errorsEnabled, valueEnabled] = validateBoolean(translations.enabled);
                            if (errorsEnabled.length > 0) {
                                errors.push({field: ['translations', 'enabled'], message: errorsEnabled[0]}); 
                            }
        
                            menu['translations'] = {
                                enabled: valueEnabled
                            };
                        }
                    }

                    return menu;
                }(menuId));

                return {errors, data: output};
            } catch (e) {
                let message = 'Error';
                if (e instanceof Error) {
                    message = e.message;
                }

                return {errors: [{message}]};
            }
        })(menuBody, {menuId});
        if (Object.keys(errorsForm).length > 0) {
            return {
                menu: null,
                userErrors: errorsForm
            };
        }

        const {errors: errorsDB, data: savedData} = await (async (data, payload) => {
            try {
                const {menuId} = payload;

                const errors: any = [];
                const output: any = {menuId};

                const menu: TMenuModel|null = await Menu.findOneAndUpdate({
                    userId, 
                    projectId, 
                    _id: menuId
                }, 
                {
                    createdBy: userId,
                    updatedBy: userId, 
                    ...data.menu
                });
                if (isErrorMenu(menu)) {
                    throw new Error('invalid menu');
                }

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
        })(validatedData, {menuId});
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
                                }))
                            }))
                        },
                        userId: menu.userId,
                        projectId: menu.projectId
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
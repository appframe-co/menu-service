import slugify from 'slugify';

import Item from '@/models/item.model';
import Menu from '@/models/menu.model';
import { TItemModel, TItem, TItemInput, TMenuModel } from '@/types/types';

import { validateString } from '@/utils/validators/string.validator';
import { validateNumber } from '@/utils/validators/number.validator';
import { validateArray } from '@/utils/validators/array.validator';
import { validateDate } from '@/utils/validators/date.validator';
import { validateDateTime } from '@/utils/validators/datetime.validator';
import { checkItemUnique } from '@/utils/item-unique';

function isErrorItem(data: null|TItem): data is null {
    return (data as null) === null;
}

export default async function UpdateItem(itemInput: TItemInput): Promise<{item: TItem|null, userErrors: any}> {
    try {
        const {id, projectId, menuId, userId, ...itemBody} = itemInput;

        if (!id) {
            throw new Error('id required');
        }

        if (!projectId || !menuId || !userId) {
            throw new Error('projectId & menuId & userId required');
        }

        // GET menu
        const menu: TMenuModel|null = await Menu.findOne({userId, projectId, _id: menuId});
        if (!menu) {
            throw new Error('invalid menu');
        }

        // compare item to menu-item
        const schemaDataBody = menu.items.fields.map(b => ({key: b.key, type: b.type, validations: b.validations}));

        const {errors: errorsForm, data: validatedData} = await (async (data, payload) => {
            try {
                const errors: any = [];
                const output: any = {};

                const {schemaDataBody, id: itemId} = payload;

                output.item = await (async function(itemId) {
                    const item: any = {};

                    if (data.hasOwnProperty('subject')) {
                        const {subject} = data;
                        if (subject !== undefined && subject !== null) {
                            const [errorsSubject, valueSubject] = validateString(subject,
                                {required: false, choices: [['content']]}
                            );
                            if (errorsSubject.length > 0) {
                                errors.push({field: ['subject'], message: errorsSubject[0]});
                            }
    
                            item.subject = valueSubject;
                        }
                    }
                    if (data.hasOwnProperty('subjectId')) {
                        const {subjectId} = data;
                        if (subjectId !== undefined && subjectId !== null) {
                            const [errorsSubjectId, valueSubjectId] = validateString(subjectId);
                            if (errorsSubjectId.length > 0) {
                                errors.push({field: ['subjectId'], message: errorsSubjectId[0]});
                            }
    
                            item.subjectId = valueSubjectId;
                        }
                    }

                    if (data.hasOwnProperty('doc')) {
                        item['doc'] = {};

                        const {doc} = data;
                        if (doc !== undefined && doc !== null) {
                            for (const schemaData of schemaDataBody) {
                                const valueData = doc[schemaData.key];
        
                                const options = schemaData.validations.reduce((acc: any, v) => {
                                    acc[v.code] = [v.value];
                                    return acc;
                                }, {});
        
                                if (schemaData.type === 'single_line_text' || schemaData.type === 'multi_line_text' || schemaData.type === 'rich_text') {
                                    const [errorsValue, valueValue] = validateString(valueData, options);
        
                                    if (Array.isArray(options.unique) ? options.unique[0] : options.unique) {
                                        const isUniquie: boolean|null = await checkItemUnique(valueValue, {itemId, projectId, menuId, key: 'doc.'+schemaData.key});
                                        if (isUniquie === false) {
                                            errors.push({field: ['doc', schemaData.key], message: 'Value must be unique'}); 
                                        }
                                    }

                                    if (errorsValue.length > 0) {
                                        errors.push({field: ['doc', schemaData.key], message: errorsValue[0]}); 
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'number_integer' || schemaData.type === 'number_decimal' || 
                                    schemaData.type === 'dimension' || schemaData.type === 'volume' || schemaData.type === 'weight') {
                                    const [errorsValue, valueValue] = validateNumber(valueData, options);
          
                                    if (errorsValue.length > 0) {
                                        errors.push({field: ['doc', schemaData.key], message: errorsValue[0]}); 
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'boolean') {
                                    const [errorsValue, valueValue] = validateString(valueData, options);
        
                                    if (errorsValue.length > 0) {
                                        errors.push({field: ['doc', schemaData.key], message: errorsValue[0]}); 
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'date_time') {
                                    const [errorsValue, valueValue] = validateDateTime(valueData, options);
        
                                    if (errorsValue.length > 0) {
                                        errors.push({field: ['doc', schemaData.key], message: errorsValue[0]}); 
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'date') {
                                    const [errorsValue, valueValue] = validateDate(valueData, options);
        
                                    if (errorsValue.length > 0) {
                                        errors.push({field: ['doc', schemaData.key], message: errorsValue[0]}); 
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'file_reference') {
                                    const [errorsValue, valueValue] = validateString(valueData, options);
        
                                    if (errorsValue.length > 0) {
                                        errors.push({field: ['doc', schemaData.key], message: errorsValue[0]}); 
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'list.single_line_text') {
                                    const {required, ...restOptions} = options;
                                    const [errorsValue, valueValue] = validateArray(valueData, {
                                        required,
                                        value: ['string', restOptions]
                                    });
        
                                    if (errorsValue.length > 0) {
                                        if (valueValue.length) {
                                            for (let i=0; i < errorsValue.length; i++) {
                                                if (!errorsValue[i]) {
                                                    continue;
                                                }
                                                errors.push({field: ['doc', schemaData.key, i], message: errorsValue[i]}); 
                                            }
                                        } else {
                                            errors.push({field: ['doc', schemaData.key], message: errorsValue[0]});
                                        }
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'list.number_integer' || schemaData.type === 'list.number_decimal' || 
                                    schemaData.type === 'list.dimension' || schemaData.type === 'list.volume' || schemaData.type === 'list.weight') {
                                    const {required, ...restOptions} = options;
                                    const [errorsValue, valueValue] = validateArray(valueData, {
                                        required,
                                        value: ['number', restOptions]
                                    });
        
                                    if (errorsValue.length > 0) {
                                        if (valueValue.length) {
                                            for (let i=0; i < errorsValue.length; i++) {
                                                if (!errorsValue[i]) {
                                                    continue;
                                                }
                                                errors.push({field: ['doc', schemaData.key, i], message: errorsValue[i]}); 
                                            }
                                        } else {
                                            errors.push({field: ['doc', schemaData.key], message: errorsValue[0]});
                                        }
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'list.date_time') {
                                    const {required, ...restOptions} = options;
                                    const [errorsValue, valueValue] = validateArray(valueData, {
                                        required,
                                        value: ['datetime', restOptions]
                                    });
        
                                    if (errorsValue.length > 0) {
                                        if (valueValue.length) {
                                            for (let i=0; i < errorsValue.length; i++) {
                                                if (!errorsValue[i]) {
                                                    continue;
                                                }
                                                errors.push({field: ['doc', schemaData.key, i], message: errorsValue[i]}); 
                                            }
                                        } else {
                                            errors.push({field: ['doc', schemaData.key], message: errorsValue[0]});
                                        }
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'list.date') {
                                    const {required, ...restOptions} = options;
                                    const [errorsValue, valueValue] = validateArray(valueData, {
                                        required,
                                        value: ['date', restOptions]
                                    });
        
                                    if (errorsValue.length > 0) {
                                        if (valueValue.length) {
                                            for (let i=0; i < errorsValue.length; i++) {
                                                if (!errorsValue[i]) {
                                                    continue;
                                                }
                                                errors.push({field: ['doc', schemaData.key, i], message: errorsValue[i]}); 
                                            }
                                        } else {
                                            errors.push({field: ['doc', schemaData.key], message: errorsValue[0]});
                                        }
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'list.file_reference') {
                                    const {required, ...restOptions} = options;
                                    const [errorsValue, valueValue] = validateArray(valueData, {
                                        required,
                                        value: ['string', restOptions]
                                    });
        
                                    if (errorsValue.length > 0) {
                                        if (valueValue.length) {
                                            for (let i=0; i < errorsValue.length; i++) {
                                                if (!errorsValue[i]) {
                                                    continue;
                                                }
                                                errors.push({field: ['doc', schemaData.key, i], message: errorsValue[i]}); 
                                            }
                                        } else {
                                            errors.push({field: ['doc', schemaData.key], message: errorsValue[0]});
                                        }
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'money') {
                                    const {required, ...restOptions} = options;
        
                                    const [errorsValue, valueValue] = validateArray(valueData, {
                                        required: true,
                                        max: 3
                                    });
                                    if (errorsValue.length) {
                                        errors.push({field: ['doc', schemaData.key], message: errorsValue[0]});
                                    }
        
                                    valueValue.map((v:any, k:number) => {
                                        const {amount, currencyCode} = v;
        
                                        const [errorsAmount, valueAmount] = validateNumber(amount, {required});
                                        if (errorsAmount.length > 0) {
                                            errors.push({field: ['doc', schemaData.key, k, 'amount'], message: errorsAmount[0]});
                                        }
                                        const [errorsCurrencyCode, valueCurrencyCode] = validateString(currencyCode, {required});
                                        if (errorsCurrencyCode.length > 0) {
                                            errors.push({field: ['doc', schemaData.key, k, 'currencyCode'], message: errorsCurrencyCode[0]});
                                        }
                                    });
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'url_handle') {
                                    const fieldRef = schemaData.validations.find(v => v.code === 'field_reference');
                                    const valueOfFieldRef: string|null = fieldRef ? doc[fieldRef.value] : null;
        
                                    let handle: string = valueData;
                                    if (!handle && valueOfFieldRef) {
                                        handle = slugify(valueOfFieldRef, {lower: true});
                                    }
        
                                    const [errorsValue, valueValue] = validateString(handle, {required: true, ...options});

                                    const isUniquie: boolean|null = await checkItemUnique(valueValue, {itemId, projectId, menuId, key: 'doc.'+schemaData.key});
                                    if (isUniquie === false) {
                                        errors.push({field: ['doc', schemaData.key], message: 'Value must be unique', value: valueValue}); 
                                    }
        
                                    if (errorsValue.length > 0) {
                                        errors.push({field: ['doc', schemaData.key], message: errorsValue[0]}); 
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'color') {
                                    const [errorsValue, valueValue] = validateString(valueData, options);

                                    if (errorsValue.length > 0) {
                                        errors.push({field: ['doc', schemaData.key], message: errorsValue[0]}); 
                                    }

                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'list.color') {
                                    const {required, ...restOptions} = options;
                                    const [errorsValue, valueValue] = validateArray(valueData, {
                                        required,
                                        value: ['string', restOptions]
                                    });
        
                                    if (errorsValue.length > 0) {
                                        if (valueValue.length) {
                                            for (let i=0; i < errorsValue.length; i++) {
                                                if (!errorsValue[i]) {
                                                    continue;
                                                }
                                                errors.push({field: ['doc', schemaData.key, i], message: errorsValue[i]}); 
                                            }
                                        } else {
                                            errors.push({field: ['doc', schemaData.key], message: errorsValue[0]});
                                        }
                                    }
        
                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'url') {
                                    const [errorsValue, valueValue] = validateString(valueData, options);

                                    if (valueValue) {
                                        const isPrefix = new RegExp(/(http|https|mailto|sms|tel):/).test(valueValue);
                                        if (!isPrefix) {
                                            errors.push({field: ['doc', schemaData.key], message: 'Value cannot have an empty scheme (protocol), must include one of the following URL schemes: ["http", "https", "mailto", "sms", "tel"].', value: valueValue}); 
                                        }
                                    }

                                    if (errorsValue.length > 0) {
                                        errors.push({field: ['doc', schemaData.key], message: errorsValue[0]}); 
                                    }

                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                                if (schemaData.type === 'list.url') {
                                    const {required, ...restOptions} = options;
                                    const [errorsValue, valueValue] = validateArray(valueData, {
                                        required,
                                        value: ['string', restOptions]
                                    });

                                    if (valueValue) {
                                        valueValue.forEach((v:string, i:number) => {
                                            const isPrefix = new RegExp(/(http|https|mailto|sms|tel):/).test(v);
                                            if (!isPrefix) {
                                                errors.push({field: ['doc', schemaData.key, i], message: 'Value cannot have an empty scheme (protocol), must include one of the following URL schemes: ["http", "https", "mailto", "sms", "tel"].'}); 
                                            }
                                        });
                                    }

                                    if (errorsValue.length > 0) {
                                        if (valueValue && valueValue.length) {
                                            for (let i=0; i < errorsValue.length; i++) {
                                                if (!errorsValue[i]) {
                                                    continue;
                                                }
                                                errors.push({field: ['doc', schemaData.key, i], message: errorsValue[i]}); 
                                            }
                                        } else {
                                            errors.push({field: ['doc', schemaData.key], message: errorsValue[0]});
                                        }
                                    }

                                    if (valueValue !== null && valueValue !== undefined) {
                                        item['doc'][schemaData.key] = valueValue;
                                    }
                                }
                            }
                        }
                    }

                    return item;
                }(itemId));

                return {errors, data: output};
            } catch (e) {
                let message = 'Error';
                if (e instanceof Error) {
                    message = e.message;
                }

                return {errors: [{message}]};
            }
        })(itemBody, {schemaDataBody, id});
        if (Object.keys(errorsForm).length > 0) {
            return {
                item: null,
                userErrors: errorsForm
            };
        }

        const {errors: errorsDB, data: savedData} = await (async (data) => {
            try {
                const errors: any = [];
                const output: any = {};

                const updatedAt = new Date();
                const item: TItemModel|null = await Item.findOneAndUpdate({userId, projectId, _id: id}, {...data.item, updatedAt, updatedBy: userId});
                if (isErrorItem(item)) {
                    throw new Error('Failed to update item');
                }

                const {id: itemId} = item;
                output.itemId = itemId;

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
                item: null,
                userErrors: errorsDB
            }
        }

        const {errors: errorsRes, data: obtainedData} = await (async (data): Promise<{errors: any, data: {item: TItem|null}}> => {
            try {
                const errors: any = [];
                let output: {item: TItem|null} = {item: null};

                const {itemId} = data;

                const item: TItemModel|null = await Item.findOne({_id: itemId, projectId, menuId, userId});
                if (isErrorItem(item)) {
                    output.item = null;
                } else {
                    output.item = {
                        id: item.id,
                        userId: item.userId,
                        projectId: item.projectId,
                        menuId: item.menuId,
                        parentId: item.parentId,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        createdBy: item.createdBy,
                        updatedBy: item.updatedBy,
                        doc: item.doc,
                        subject: item.subject,
                        subjectId: item.subjectId
                    }
                }

                return {errors, data: output};
            } catch (e) {
                let message;
                if (e instanceof Error) {
                    message = e.message;
                }
                return {errors: [{message}], data: {item: null}};
            }
        })(savedData);
        if (Object.keys(errorsRes).length > 0) {
            return {
                item: null,
                userErrors: errorsRes
            }
        }

        return {
            item: obtainedData.item,
            userErrors: []
        };
    } catch (e) {
        let message;
        if (e instanceof Error) {
            message = e.message;
        }
        return {
            item: null,
            userErrors: [{message}]
        };
    }
}
import Translation from '@/models/translation.model';
import Menu from '@/models/menu.model';
import { TMenuModel, TTranslation, TTranslationModel, TValueTranslation } from '@/types/types';

import { validateString } from '@/utils/validators/string.validator';
import { validateArray } from '@/utils/validators/array.validator';

function isErrorTranslation(data: null|TTranslation): data is null {
    return (data as null) === null;
}

type TTranslationInput = {
    id: string;
    userId: string; 
    projectId: string;
    menuId: string;
    subjectId: string;
    subject: string;
    key: string;
    value: TValueTranslation;
    lang: string;
}

export default async function UpdateTranslation(translationInput: TTranslationInput): Promise<{translation: TTranslation|null, userErrors: any}> {
    try {
        const {id, userId, projectId, menuId, subjectId, ...translationBody} = translationInput;

        if (!id) {
            throw new Error('id required');
        }

        if (!userId || !projectId || !menuId || !subjectId) {
            throw new Error('projectId & menuId & userId & subjectId required');
        }

        // GET menu
        const menu: TMenuModel|null = await Menu.findOne({userId, projectId, _id: menuId});
        if (!menu) {
            throw new Error('invalid menu');
        }

        // compare translation by menu
        const schemaDataBody = menu.items.fields.map(b => ({key: b.key, type: b.type, validations: b.validations}));

        const {errors: errorsForm, data: validatedData} = await (async (data, payload) => {
            try {
                const errors: any = [];
                const output: any = {};

                output.translation = await (async function() {
                    const translation: any = {};

                    const {value={}} = data;
                    const valueAfterValidate:TValueTranslation = {};
                    for (const k of Object.keys(value)) {
                        if (!Array.isArray(value[k])) {
                            const [errorsValue, valueValue] = validateString(value[k]);
                            if (errorsValue.length > 0) {
                                errors.push({field: [k], message: errorsValue[0]}); 
                            }
                            valueAfterValidate[k] = valueValue;
                        } else {
                            const [errorsValue, valueValue] = validateArray(value[k], {
                                value: ['string', {}]
                            });
                            if (errorsValue.length > 0) {
                                if (valueValue.length) {
                                    for (let i=0; i < errorsValue.length; i++) {
                                        if (!errorsValue[i]) {
                                            continue;
                                        }
                                        errors.push({field: [k, i], message: errorsValue[i]}); 
                                    }
                                } else {
                                    errors.push({field: [k], message: errorsValue[0]});
                                }
                            }
                            if (valueValue !== null && valueValue !== undefined) {
                                valueAfterValidate[k] = valueValue;
                            }
                        }
                    }
                    translation.value = valueAfterValidate;

                    return translation;
                }());

                return {errors, data: output};
            } catch (e) {
                let message = 'Error';
                if (e instanceof Error) {
                    message = e.message;
                }

                return {errors: [{message}]};
            }
        })(translationBody, {schemaDataBody});
        if (Object.keys(errorsForm).length > 0) {
            return {
                translation: null,
                userErrors: errorsForm
            };
        }

        const {errors: errorsDB, data: savedData} = await (async (data) => {
            try {
                const errors: any = [];
                const output: any = {};

                const translation: TTranslationModel|null = await Translation.findOneAndUpdate({userId, projectId, _id: id}, {...data.translation});
                if (isErrorTranslation(translation)) {
                    throw new Error('Failed to update translation');
                }

                const {id: translationId} = translation;
                output.translationId = translationId;

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
                translation: null,
                userErrors: errorsDB
            }
        }

        const {errors: errorsRes, data: obtainedData} = await (async (data): Promise<{errors: any, data: {translation: TTranslation|null}}> => {
            try {
                const errors: any = [];
                let output: {translation: TTranslation|null} = {translation: null};

                const {translationId} = data;

                const translation: TTranslationModel|null = await Translation.findOne({_id: translationId, userId, projectId, menuId, subjectId});
                if (isErrorTranslation(translation)) {
                    output.translation = null;
                } else {
                    output.translation = {
                        id: translation.id,
                        userId: translation.userId,
                        projectId: translation.projectId,
                        menuId: translation.menuId,
                        subjectId: translation.subjectId,
                        subject: translation.subject,
                        createdAt: translation.createdAt,
                        lang: translation.lang,
                        key: translation.key,
                        value: translation.value,
                    }
                }

                return {errors, data: output};
            } catch (e) {
                let message;
                if (e instanceof Error) {
                    message = e.message;
                }
                return {errors: [{message}], data: {translation: null}};
            }
        })(savedData);
        if (Object.keys(errorsRes).length > 0) {
            return {
                translation: null,
                userErrors: errorsRes
            }
        }

        return {
            translation: obtainedData.translation,
            userErrors: []
        };
    } catch (e) {
        let message;
        if (e instanceof Error) {
            message = e.message;
        }
        return {
            translation: null,
            userErrors: [{message}]
        };
    }
}
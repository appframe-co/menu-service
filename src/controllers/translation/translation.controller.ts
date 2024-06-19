import Translation from '@/models/translation.model';
import Menu from '@/models/menu.model';
import {TErrorResponse, TTranslationInput, TTranslation, TTranslationModel, TValueTranslation, TMenuModel} from '@/types/types';

export default async function TranslationController(translationInput: TTranslationInput): Promise<TErrorResponse | {translation: TTranslation}> {
    try {
        const {id, userId, projectId, menuId, subjectId, lang} = translationInput;

        const translation: TTranslationModel|null = await Translation.findOne({_id: id, userId, projectId, menuId, subjectId, lang});
        if (!translation) {
            throw new Error('invalid translation');
        }

        // GET menu
        const menu: TMenuModel|null = await Menu.findOne({userId, projectId, _id: menuId});
        if (!menu) {
            throw new Error('invalid menu');
        }

        // compare translation by menu
        const keys = menu.items.fields.map(b => b.key);
        const doc: TValueTranslation = {};
        if (translation.value) {
            keys.forEach(key => {
                doc[key] = translation.value.hasOwnProperty(key) ? translation.value[key] : null;
            });
        }

        const output = {
            id: translation.id,
            userId: translation.userId,
            projectId: translation.projectId,
            menuId: translation.menuId,
            subject: translation.subject,
            subjectId: translation.subjectId,
            lang: translation.lang,
            key: translation.key,
            value: translation.value,
            createdAt: translation.createdAt,
        };
        return {translation: output};
    } catch (error) {
        throw error;
    }
}
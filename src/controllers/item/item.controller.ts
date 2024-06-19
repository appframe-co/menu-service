import Item from '@/models/item.model';
import Menu from '@/models/menu.model';
import {TErrorResponse, TDoc, TFile, TItem, TItemModel, TMenuModel} from '@/types/types';

type TSectionInput = {
    userId: string;
    projectId: string; 
    menuId: string; 
    id: string;
}

export default async function ItemController(sectionInput: TSectionInput): Promise<TErrorResponse | {item: TItem, files: TFile[]}> {
    try {
        const {id, projectId, userId, menuId} = sectionInput;

        const item: TItemModel|null = await Item.findOne({userId, projectId, _id: id, menuId});
        if (!item) {
            throw new Error('invalid item');
        }

        // GET menu
        const menu: TMenuModel|null = await Menu.findOne({userId, projectId, _id: menuId});
        if (!menu) {
            throw new Error('invalid menu');
        }

        // compare item to menu-item
        const keys = menu.items.fields.map(b => b.key);
        const doc: TDoc = {};
        if (item.doc) {
            keys.forEach(key => {
                doc[key] = item.doc.hasOwnProperty(key) ? item.doc[key] : null;
            });
        }

        let fileIds: string[] = [];
        const types = ['file_reference', 'list.file_reference'];
        const keyListFile = menu.items.fields.filter(b => types.includes(b.type)).map(b => b.key);
        for (const key of keyListFile) {
            if (!doc[key]) {
                continue;
            }

            if (Array.isArray(doc[key])) {
                fileIds = [...fileIds, ...doc[key]];
            } else {
                fileIds = [...fileIds, doc[key]];
            }
        }

        const resFetchFiles = await fetch(
            `${process.env.URL_FILE_SERVICE}/api/get_files_by_ids?projectId=${projectId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({fileIds})
        });
        const {files}: {files: TFile[]} = await resFetchFiles.json();

        const output = {
            id: item.id,
            userId: item.userId,
            projectId: item.projectId,
            menuId: item.menuId,
            parentId: item.parentId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            createdBy: item.createdBy,
            updatedBy: item.updatedBy,
            doc,
            subject: item.subject,
            subjectId: item.subjectId
        };
        return {item: output, files};
    } catch (error) {
        throw error;
    }
}
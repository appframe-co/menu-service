import Item from '@/models/item.model';
import Menu from  '@/models/menu.model'
import {TDoc, TErrorResponse, TFile, TParameters, TField, TItemInput, TMenuModel, TItem, TItemModel} from '@/types/types';

type TProps = {
    items: TItem[];
    names: string[];
    keys: string[];
    parent: TItem|null;
}

type TFilter = {
    userId: string;
    projectId: string;
    menuId: string;
    _id?: any;
    parentId?: string|null;
}


export default async function Items(itemInput: TItemInput, parameters: TParameters = {}): Promise<TErrorResponse | TProps>{
    try {
        const {userId, projectId, menuId} = itemInput;

        if (!userId || !projectId || !menuId) {
            throw new Error('userId & projectId & menuId query required');
        }

        const defaultLimit = 10;
        const defaultDepthLevel = 3;

        const filter: TFilter = {userId, projectId, menuId};
        let {sinceId, limit=defaultLimit, page=1, ids, parentId=null, depthLevel=1} = parameters;

        if (limit > 250) {
            limit = defaultLimit;
        }
        if (sinceId) {
            filter['_id'] = {$gt: sinceId};
        }
        if (ids) {
            filter['_id'] = {$in: ids.split(',')};
        }
        filter['parentId'] = parentId;

        depthLevel = depthLevel > 3 ? defaultDepthLevel : depthLevel;

        const skip = (page - 1) * limit;

        // GET menu
        const menu: TMenuModel|null = await Menu.findOne({userId, projectId, _id: menuId});
        if (!menu) {
            throw new Error('invalid menu');
        }

        // COMPARE items to menu-items
        const names = menu.items.fields.map(b => b.name);
        const keys = menu.items.fields.map(b => b.key);

        const parent: TItem|null = await (async function() {
            try {
                const item: TItemModel|null = await Item.findOne({userId, projectId, menuId, _id: parentId});
                if (!item) {
                    return null;
                }
    
                const doc = keys.reduce((acc: TDoc, key: string) => {
                    acc[key] = item.doc.hasOwnProperty(key) ? item.doc[key] : null
        
                    return acc;
                }, {});
        
                return {
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
            } catch(e) {
                return null;
            }
        })();

        const items: TItem[] = await getItems(filter, keys, menu.items.fields, projectId);

        return {items, names, keys, parent};
    } catch (error) {
        throw error;
    }
}

async function getItems(filter:TFilter, keys:string[], fields: TField[], projectId:string):Promise<TItem[]> {
    try {
        const items: TItemModel[] = await Item.find(filter).skip(0).limit(50);
        if (!items) {
            throw new Error('invalid items');
        }

        const result = items.map(item => {
            const doc = keys.reduce((acc: TDoc, key: string) => {
                acc[key] = item.doc.hasOwnProperty(key) ? item.doc[key] : null

                return acc;
            }, {});

            return {
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
        });

        let fileIds: string[] = [];
        const types = ['file_reference', 'list.file_reference'];
        const keyListFile = fields.filter(b => types.includes(b.type)).map(b => b.key);

        for (const r of result) {
            for (const key of keyListFile) {
                if (!r.doc[key]) {
                    continue;
                }

                if (Array.isArray(r.doc[key])) {
                    fileIds = [...fileIds, ...r.doc[key]];
                } else {
                    fileIds = [...fileIds, r.doc[key]];
                }
            }
        }

        // MERGE files with item
        const resFetchFiles = await fetch(
            `${process.env.URL_FILE_SERVICE}/api/get_files_by_ids?projectId=${projectId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({fileIds})
        });
        const {files}: {files: TFile[]} = await resFetchFiles.json();

        for (const r of result) {
            for (const key of keyListFile) {
                if (!r.doc[key]) {
                    continue;
                }

                if (Array.isArray(r.doc[key])) {
                    r.doc[key] = files.filter(file => r.doc[key].includes(file.id));
                } else {
                    r.doc[key] = files.find(file => r.doc[key].includes(file.id));
                }
                
            }
        }

        return result;
    } catch {
        return [];
    }
}
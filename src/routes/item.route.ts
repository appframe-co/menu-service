import express, { Request, Response, NextFunction } from 'express'
import ItemsController from '@/controllers/item/items.controller'
import ItemController from '@/controllers/item/item.controller'
import NewItemController from '@/controllers/item/new-item.controller'
import EditItemController from '@/controllers/item/edit-item.controller'
import CountItemController from '@/controllers/item/count-items.controller'
import DeleteItemController from '@/controllers/item/delete-item.controller'
import { TItemInput, TParameters } from '@/types/types'

const router = express.Router();

type TQueryGet = {
    userId: string;
    projectId: string;
    menuId: string;
    limit: string;
    page: string;
    sinceId: string;
    ids: string;
    parent_id: string;
    depth_level: string;
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId, menuId, limit, page, sinceId, ids, parent_id:parentId, depth_level:depthLevel } = req.query as TQueryGet;

        const parameters: TParameters = {};
        if (limit) {
            parameters.limit = +limit;
        }
        if (page) {
            parameters.page = +page;
        }
        if (sinceId) {
            parameters.sinceId = sinceId;
        }
        if (ids) {
            parameters.ids = ids;
        }
        if (parentId) {
            parameters.parentId = parentId;
        }
        if (depthLevel) {
            parameters.depthLevel = +depthLevel;
        }

        const data = await ItemsController({
            userId,
            projectId,
            menuId
        }, 
        parameters);

        res.json(data);
    } catch (e) {

        let message = String(e);

        if (e instanceof Error) {
            message = e.message; 
        }

        res.json({error: 'server_error', description: message});
    }
});

router.get('/count', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId, menuId } = req.query as {userId: string, projectId: string, menuId: string};

        const data = await CountItemController({
            userId,
            projectId,
            menuId,
        });

        res.json(data);
    } catch (e) {
        let message = String(e);

        if (e instanceof Error) {
            message = e.message; 
        }

        res.json({error: 'server_error', description: message});
    }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let {userId, projectId, menuId, parentId, doc, subject, subjectId}: TItemInput = req.body;

        const data = await NewItemController({
            projectId,
            menuId,
            parentId,
            userId,
            doc, subject, subjectId
        });

        res.json(data);
    } catch (e) {
        let message = String(e);

        if (e instanceof Error) {
            message = e.message; 
        }

        res.json({error: 'server_error', description: message});
    }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let {id, userId, projectId, menuId, doc, subject, subjectId}: TItemInput = req.body;

        if (req.params.id !== id) {
            throw new Error('id invalid');
        }

        const data = await EditItemController({
            id,
            projectId,
            menuId,
            userId,
            doc, subject, subjectId
        });

        res.json(data);
    } catch (e) {
        let message = String(e);

        if (e instanceof Error) {
            message = e.message; 
        }

        res.json({error: 'server_error', description: message});
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId, menuId} = req.query as {userId: string, projectId: string, menuId: string};
        const { id } = req.params;

        const data = await ItemController({
            userId,
            projectId,
            menuId,
            id
        });

        res.json(data);
    } catch (e) {
        let message = String(e);

        if (e instanceof Error) {
            message = e.message; 
        }

        res.json({error: 'server_error', description: message});
    }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId, menuId} = req.query as {userId: string, projectId: string, menuId: string};
        const { id } = req.params;

        const data = await DeleteItemController({
            userId,
            projectId,
            menuId,
            id
        });

        res.json(data);
    } catch (e) {
        let message = String(e);

        if (e instanceof Error) {
            message = e.message; 
        }

        res.json({error: 'server_error', description: message});
    }
});

export default router;
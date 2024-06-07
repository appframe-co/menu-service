import express, { Request, Response, NextFunction } from 'express'
import MenusController from '@/controllers/menu/menus.controller'
import NewMenuController from '@/controllers/menu/new-menu.controller'
import EditMenuController from '@/controllers/menu/edit-menu.controller'
import DeleteMenuController from '@/controllers/menu/delete-menu.controller'
import MenuController from '@/controllers/menu/menu.controller'
import CountMenuController from '@/controllers/menu/count-menus.controller'
import { TParameters } from '@/types/types'

const router = express.Router();

type TQueryGet = {
    userId: string;
    projectId: string;
    limit: string;
    page: string;
    sinceId: string;
    ids: string;
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId, limit, page, sinceId, ids } = req.query as TQueryGet;

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

        const data = await MenusController({
            userId,
            projectId
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
        const { userId, projectId } = req.query as {userId: string, projectId: string};

        const data = await CountMenuController({
            userId,
            projectId
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
        const { userId, projectId } = req.query as {userId: string, projectId: string};
        let { title, handle } = req.body;

        const data = await NewMenuController({
            userId,
            projectId,
            title,
            handle,
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
        const { userId, projectId } = req.query as {userId: string, projectId: string};
        let { id, title, handle } = req.body;

        if (id !== req.params.id) {
            throw new Error('Menu ID error');
        }

        const data = await EditMenuController({
            userId,
            projectId,
            id,
            title,
            handle,
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
        const { userId, projectId } = req.query as {userId: string, projectId: string};
        const {id} = req.params;

        const data = await MenuController({
            userId,
            projectId,
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
        const { userId, projectId } = req.query as {userId: string, projectId: string};
        const { id } = req.params;

        const data = await DeleteMenuController({
            userId,
            projectId,
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
import { RoutesInput } from '@/types/types'
import menu from './menu.route'
import item from './item.route'
import translation from './translation.route'

export default ({ app }: RoutesInput) => {
    app.use('/api/menus', menu);
    app.use('/api/items', item);
    app.use('/api/translations', translation);
};
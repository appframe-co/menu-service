import { RoutesInput } from '@/types/types'
import menu from './menu.route'

export default ({ app }: RoutesInput) => {
    app.use('/api/menus', menu);
};
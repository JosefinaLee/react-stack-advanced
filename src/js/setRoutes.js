/**
 * Created by Liqi on 18/4/26.
 */

// import {LRouteF} from "./LRoute";
import {LRoute} from "./LRoute";


/* 两种方式，慢慢体会下优缺点
export const routeHome = new LRoute({});
export const routeHome = LRouteF({});
*/

// export const routeHome = new LRoute({
//     path: '/home',
//     component: () => import('./pages/PageHome'),
// });

export const routeReactPortal = new LRoute({
    path: '/react-portal',
    component: () => import('./pages/PageReactPortal')
});

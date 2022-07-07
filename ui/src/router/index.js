import { createRouter, createWebHashHistory } from "vue-router";

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: () => import('../components/HomePage.vue')
        },
        {
            path: '/:project',
            component: () => import('../components/Ora2PgConfig.vue'),
            props: true
        },
        {
            path: '/:project/details',
            component: () => import('../components/ProjectDetails.vue'),
            props: true
        }
    ]
});

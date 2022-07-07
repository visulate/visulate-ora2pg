import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('../components/HomePage.vue')
        },
        {
            path: '/projects',
            redirect: '/'
        },
        {
            path: '/projects/:project',
            component: () => import('../components/Ora2PgConfig.vue'),
            props: true
        },
        {
            path: '/projects/:project/details',
            component: () => import('../components/ProjectDetails.vue'),
            props: true
        }
    ]
});

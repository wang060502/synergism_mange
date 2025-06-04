import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
      component: () => import('@/views/layout/index.vue'),
      children: [
        {
          path: '/dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: {
            title: '首页',
            icon: 'HomeFilled',
          },
        },
        {
          path: '/user/info',
          component: () => import('@/views/user/index.vue'),
          meta: {
            title: '个人信息',
            icon: 'User',
          },
        },
        // 账密管理
        {
          path: '/account/list',
          component: () => import('@/views/account/list.vue'),
          meta: {
            title: '账密列表',
            icon: 'Key',
          },
        },

        // 通知管理
        {
          path: '/notice/list',
          component: () => import('@/views/notice/list.vue'),
          meta: {
            title: '通知列表',
            icon: 'Bell',
          },
        },
        {
          path: '/notice/my',
          component: () => import('@/views/notice/my.vue'),
          meta: {
            title: '我的通知',
            icon: 'Message',
          },
        },
        // 系统管理
        {
          path: '/system',
          meta: {
            title: '系统管理',
            icon: 'Setting',
          },
          children: [
            {
              path: 'user',
              component: () => import('@/views/system/user/index.vue'),
              meta: {
                title: '用户管理',
                icon: 'User',
              },
            },
            {
              path: 'role',
              component: () => import('@/views/system/role/index.vue'),
              meta: {
                title: '角色管理',
                icon: 'UserFilled',
              },
            },
            {
              path: 'menu',
              component: () => import('@/views/system/menu/index.vue'),
              meta: {
                title: '菜单管理',
                icon: 'Menu',
              },
            },
            {
              path: 'department',
              component: () => import('@/views/system/department/index.vue'),
              meta: {
                title: '部门管理',
                icon: 'OfficeBuilding',
              },
            },
            {
              path: 'log',
              component: () => import('@/views/system/log/index.vue'),
              meta: {
                title: '操作日志',
                icon: 'Document',
              },
            },
          ],
        },
      ],
    },
    {
      path: '/login',
      component: () => import('@/views/login/index.vue'),
    },
  ],
})

export default router

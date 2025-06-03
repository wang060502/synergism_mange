import request from '@/utils/request'

// 获取账号密码列表
export function getAccountPasswords() {
  return request({
    url: '/api/account-passwords',
    method: 'get'
  });
}

// 创建账号密码
export function createAccountPassword(data: {
  account_name?: string;
  password?: string;
  url?: string;
  description?: string;
}) {
  return request({
    url: '/api/account-passwords',
    method: 'post',
    data
  });
}

// 获取单个账号密码详情
export function getAccountPasswordById(id: number) {
  return request({
    url: `/api/account-passwords/${id}`,
    method: 'get'
  });
}

// 更新账号密码
export function updateAccountPassword(
  id: number,
  data: {
    account_name?: string;
    password?: string;
    url?: string;
    description?: string;
  }
) {
  return request({
    url: `/api/account-passwords/${id}`,
    method: 'put',
    data
  });
}

// 删除账号密码
export function deleteAccountPassword(id: number) {
  return request({
    url: `/api/account-passwords/${id}`,
    method: 'delete'
  });
}


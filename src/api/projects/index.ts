import request from '@/utils/request';

// 创建新项目
export interface CreateProjectParams {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  leader_id?: number;
  doc_file_url?: string;
  status?: number;
  doc_file_name?: string;
}

export function createProject(data: CreateProjectParams) {
  return request({
    url: '/api/projects',
    method: 'post',
    data,
  });
}

// 获取项目列表（支持分页和条件查询）
export function getProjectList(params?: {
  page?: number
  pageSize?: number
  name?: string
  status?: string | number
}) {
  return request({
    url: '/api/projects',
    method: 'get',
    params,
  })
}

// 获取项目详情
export function getProjectDetail(id: number) {
  return request({
    url: `/api/projects/${id}`,
    method: 'get',
  });
}

// 更新项目信息
export function updateProject(id: number, data: CreateProjectParams) {
  return request({
    url: `/api/projects/${id}`,
    method: 'put',
    data,
  });
}

// 删除项目
export function deleteProject(id: number) {
  return request({
    url: `/api/projects/${id}`,
    method: 'delete',
  });
}

// 添加项目成员
export interface AddProjectMemberParams {
  user_id: number;
  role_label?: string;
}

export function addProjectMember(id: number, data: AddProjectMemberParams) {
  return request({
    url: `/api/projects/${id}/members`,
    method: 'post',
    data,
  });
}

// 获取项目成员列表
export function getProjectMembers(id: number) {
  return request({
    url: `/api/projects/${id}/members`,
    method: 'get',
  });
}

// 移除项目成员
export function removeProjectMember(id: number, userId: number) {
  return request({
    url: `/api/projects/${id}/members/${userId}`,
    method: 'delete',
  });
}


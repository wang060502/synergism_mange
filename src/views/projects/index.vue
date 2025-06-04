<template>
  <el-card class="projects-container">
    <div class="projects-header">
      <div class="projects-header-title">项目列表</div>
      <el-button type="primary" @click="openCreateDialog">新建项目</el-button>
    </div>
    <div class="projects-header-search">
        <el-input v-model="searchName" placeholder="项目名称" style="width: 180px; margin-right: 8px;" clearable />
        <el-select v-model="searchStatus" placeholder="状态" style="width: 120px; margin-right: 8px;" clearable>
          <el-option v-for="(label, value) in statusMap" :key="value" :label="label" :value="value" />
        </el-select>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>

      </div>
    <el-table :data="projectList" style="width: 100%; margin-top: 20px;">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="name" label="项目名称" />
      <el-table-column prop="start_date" label="开始日期">
        <template #default="scope">
          {{ formatDate(scope.row.start_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="end_date" label="结束日期">
        <template #default="scope">
          {{ formatDate(scope.row.end_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="leader_nickname" label="负责人" />
      <el-table-column prop="duration_days" label="工期（天）" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="statusColorMap[scope.row.status] || 'default'">
            {{ statusMap[scope.row.status as number] ?? '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="360">
        <template #default="scope">
          <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
          <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="small" @click="openMemberDialog(scope.row)">成员管理</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 16px; text-align: right"
      background
      layout="total, prev, pager, next, sizes"
      :total="total"
      :page-size="pageSize"
      :current-page="page"
      @current-change="onPageChange"
      @size-change="onSizeChange"
    />
  </el-card>

  <!-- 新建/编辑项目弹窗 -->
  <el-dialog v-model="projectDialogVisible" :title="isEdit ? '编辑项目' : '新建项目'">
    <el-form :model="projectForm" label-width="90px">
      <el-form-item label="项目名称" required>
        <el-input v-model="projectForm.name" />
      </el-form-item>
      <el-form-item label="项目描述">
        <el-input v-model="projectForm.description" />
      </el-form-item>
      <el-form-item label="开始日期" required>
        <el-date-picker v-model="projectForm.start_date" type="date" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="结束日期" required>
        <el-date-picker v-model="projectForm.end_date" type="date" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="负责人">
        <el-select v-model="projectForm.leader_id" placeholder="请选择负责人" filterable>
          <el-option
            v-for="user in userList"
            :key="user.user_id"
            :label="user.real_name || user.username"
            :value="user.user_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" v-if="isEdit">
        <el-select v-model="projectForm.status" placeholder="请选择状态">
          <el-option v-for="(label, value) in statusMap" :key="value" :label="label" :value="Number(value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="文档URL">
        <el-upload
          :show-file-list="false"
          :http-request="handleFileUpload"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
        >
          <el-button type="primary">上传文件</el-button>
        </el-upload>
        <div v-if="projectForm.doc_file_url" style="margin-top: 8px; word-break: break-all;">
          <el-link :href="projectForm.doc_file_url" target="_blank">{{ projectForm.doc_file_url }}</el-link>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="projectDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitProject">确定</el-button>
    </template>
  </el-dialog>

  <!-- 项目详情弹窗 -->
  <el-dialog v-model="detailDialogVisible" title="项目详情" width="500px">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="项目名称">{{ projectDetail?.name }}</el-descriptions-item>
      <el-descriptions-item label="项目描述">{{ projectDetail?.description }}</el-descriptions-item>
      <el-descriptions-item label="开始日期">{{ formatDate(projectDetail?.start_date) }}</el-descriptions-item>
      <el-descriptions-item label="结束日期">{{ formatDate(projectDetail?.end_date) }}</el-descriptions-item>
      <el-descriptions-item label="工期">{{ projectDetail.duration_days }}天</el-descriptions-item>
      <el-descriptions-item label="负责人">{{ projectDetail?.leader_nickname }}</el-descriptions-item>
      <el-descriptions-item label="文档URL">
        <el-link v-if="projectDetail?.doc_file_url && projectDetail?.doc_file_name" :href="projectDetail.doc_file_url" target="_blank" download>
          {{ projectDetail.doc_file_name }}
        </el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusColorMap[projectDetail?.status as number] || 'default'">
          {{ statusMap[projectDetail?.status as number] ?? '未知' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="成员列表" :span="2">
        <el-table
          v-if="projectDetail?.members && projectDetail.members.length"
          :data="projectDetail.members"
          size="small"
          border
          style="width: 100%;"
        >
          <el-table-column prop="real_name" label="姓名" />
          <el-table-column prop="role_label" label="角色" />
        </el-table>
        <span v-else>暂无成员</span>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="detailDialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 成员管理弹窗 -->
  <el-dialog v-model="memberDialogVisible" title="成员管理" width="600px">
    <div style="margin-bottom: 16px;">
      <el-select v-model="newMember.user_id" placeholder="请选择用户" filterable style="width: 180px; margin-right: 8px;">
        <el-option
          v-for="user in userList"
          :key="user.user_id"
          :label="user.real_name || user.username"
          :value="user.user_id"
        />
      </el-select>
      <el-input v-model="newMember.role_label" placeholder="角色标签" style="width: 120px; margin-right: 8px;" />
      <el-button type="primary" @click="addMember">添加成员</el-button>
    </div>
    <el-table :data="memberList" style="width: 100%;">
      <el-table-column prop="real_name" label="姓名" />
      <el-table-column prop="role_label" label="角色标签" />
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button size="small" type="danger" @click="removeMember(scope.row)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="memberDialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  getProjectList,
  createProject,
  getProjectDetail,
  updateProject,
  deleteProject,
  addProjectMember,
  getProjectMembers,
  removeProjectMember
} from '@/api/projects'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CreateProjectParams } from '@/api/projects'
import { uploadFile } from '@/api/upload/upload'
import type { UploadRequestOptions } from 'element-plus'
import { getUserList } from '@/api/system/user'
import dayjs from 'dayjs'

interface Project {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  leader_id?: number;
  doc_file_url?: string;
  status?: number;
  leader_nickname?: string;
  duration_days?: number;
  doc_file_name?: string;
}

interface ProjectMember {
  user_id: number;
  role_label?: string;
}

interface User {
  user_id: number
  username: string
  real_name?: string
}

const projectList = ref<Project[]>([])
const projectDialogVisible = ref(false)
const isEdit = ref(false)
const projectForm = reactive<Partial<Project>>({})
const editingId = ref<number | null>(null)

const detailDialogVisible = ref(false)
const projectDetail = ref<Project | null>(null)

const memberDialogVisible = ref(false)
const memberList = ref<ProjectMember[]>([])
const currentProjectId = ref<number | null>(null)
const newMember = reactive<{ user_id: number | null, role_label: string }>({ user_id: null, role_label: '' })

const userList = ref<User[]>([])

const statusMap = {
  0: '进行中',
  1: '已完成',
  2: '已延期',
  3: '已取消'
}

const statusColorMap: Record<number, string> = {
  0: 'primary',   // 进行中
  1: 'success',   // 已完成
  2: 'warning',   // 已延期
  3: 'info'       // 已取消
}

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchName = ref('')
const searchStatus = ref('')

// 获取项目列表
const fetchProjects = async () => {
  const res = await getProjectList({
    page: page.value,
    pageSize: pageSize.value,
    name: searchName.value,
    status: searchStatus.value
  })
  projectList.value = res.data?.list || res.data || []
  total.value = res.data?.pagination.total || 0
}

// 获取用户列表
const fetchUsers = async () => {
  const res = await getUserList({ limit: 1000 }) // 可根据实际分页
  userList.value = res.users || []
}

// 新建项目
const openCreateDialog = () => {
  isEdit.value = false
  Object.assign(projectForm, { name: '', description: '', start_date: '', end_date: '', leader_id: null, doc_file_url: '' })
  projectDialogVisible.value = true
  fetchUsers()
}

// 编辑项目
const openEditDialog = (row: Project) => {
  isEdit.value = true
  editingId.value = row.id
  Object.assign(projectForm, row)
  projectDialogVisible.value = true
  fetchUsers()
}

// 提交新建/编辑
const submitProject = async () => {
  if (!projectForm.name || !projectForm.start_date || !projectForm.end_date) {
    ElMessage.error('请填写必填项')
    return
  }
  const payload: CreateProjectParams = {
    name: projectForm.name!,
    start_date: projectForm.start_date!,
    end_date: projectForm.end_date!,
    description: projectForm.description,
    leader_id: projectForm.leader_id,
    doc_file_url: projectForm.doc_file_url,
    status: projectForm.status,
  }
  if (isEdit.value && editingId.value) {
    const res = await updateProject(editingId.value, payload)
    if (res.code === 200) {
      ElMessage.success(res.message || '更新成功')
      projectDialogVisible.value = false
      isEdit.value = false
      fetchProjects()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } else {
    const res = await createProject(payload)
    if (res.code === 200) {
      ElMessage.success(res.message || '创建成功')
      projectDialogVisible.value = false
      isEdit.value = false
      fetchProjects()
    } else {
      ElMessage.error(res.message || '创建失败')
    }
  }
}

// 删除项目
const handleDelete = (row: Project) => {
  ElMessageBox.confirm('确定要删除该项目吗？', '提示', { type: 'warning' })
    .then(async () => {
      await deleteProject(row.id)
      ElMessage.success('删除成功')
      fetchProjects()
    })
    .catch(() => {})
}

// 查看详情
const viewDetail = async (row: Project) => {
  const res = await getProjectDetail(row.id)
  projectDetail.value = res.data
  detailDialogVisible.value = true
}

// 成员管理
const openMemberDialog = async (row: Project) => {
  currentProjectId.value = row.id
  await fetchMembers(row.id)
  await fetchUsers()
  memberDialogVisible.value = true
}

const fetchMembers = async (projectId: number) => {
  const res = await getProjectMembers(projectId)
  memberList.value = res.data || []
}

const addMember = async () => {
  if (!currentProjectId.value || !newMember.user_id) {
    ElMessage.error('请输入用户ID')
    return
  }
  await addProjectMember(currentProjectId.value, { user_id: newMember.user_id, role_label: newMember.role_label })
  ElMessage.success('添加成功')
  newMember.user_id = null
  newMember.role_label = ''
  fetchMembers(currentProjectId.value)
}

const removeMember = async (row: ProjectMember) => {
  if (!currentProjectId.value) return
  await removeProjectMember(currentProjectId.value, row.user_id)
  ElMessage.success('移除成功')
  fetchMembers(currentProjectId.value)
}

// 文件上传处理
const handleFileUpload = async (option: UploadRequestOptions) => {
  try {
    const res = await uploadFile(option.file as File)
    // 取 file.url
    projectForm.doc_file_url = res.file?.url
    ElMessage.success('文件上传成功')
    if (option.onSuccess) option.onSuccess(res)
  } catch (e) {
    ElMessage.error('文件上传失败')
    if (option.onError) option.onError(e)
  }
}

const formatDate = (date?: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : ''
}

const onSearch = () => {
  page.value = 1
  fetchProjects()
}

const onReset = () => {
  searchName.value = ''
  searchStatus.value = ''
  page.value = 1
  fetchProjects()
}

const onPageChange = (val: number) => {
  page.value = val
  fetchProjects()
}

const onSizeChange = (val: number) => {
  pageSize.value = val
  page.value = 1
  fetchProjects()
}

fetchProjects()
</script>

<style scoped>
.projects-container {
  border-radius: 12px;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.projects-header .projects-header-title {
  font-size: 18px;
  font-weight: bold;
}
.projects-header-search{
  margin-top: 20px;
}
</style>

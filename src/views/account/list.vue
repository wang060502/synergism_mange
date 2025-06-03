<template>
  <el-card class="account-list-container">
    <div class="account-list-header">
      <div class="title">账密列表</div>
      <el-button type="primary" @click="openCreateDialog">新增账号密码</el-button>
    </div>
    <el-table :data="accountList" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="account_name" label="账号名称" />
      <!-- <el-table-column prop="password" label="密码" /> -->
      <el-table-column prop="url" label="URL" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button size="small" @click="viewDetail(scope.row.id)">详情</el-button>
          <el-button size="small" type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible">
      <el-form :model="form" label-width="80px">
        <el-form-item label="账号名称">
          <el-input v-model="form.account_name" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" />
        </el-form-item>
        <el-form-item label="URL">
          <el-input v-model="form.url" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">{{ isEdit ? '保存' : '创建' }}</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog title="账号密码详情" v-model="detailDialogVisible" width="400px">
      <el-descriptions :column="1" v-if="detail">
        <el-descriptions-item label="账号名称">{{ detail.account_name }}</el-descriptions-item>
        <el-descriptions-item label="密码">{{ detail.password }}</el-descriptions-item>
        <el-descriptions-item label="URL">{{ detail.url }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ detail.description }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ detail.creator_name }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ dayjs(detail.created_at).format('YYYY-MM-DD HH:mm:ss') }}</el-descriptions-item>
        <el-descriptions-item label="操作">
          <el-button
            type="primary"
            size="small"
            @click="copyAccountAndPassword"
          >一键复制账密</el-button>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  getAccountPasswords,
  createAccountPassword,
  getAccountPasswordById,
  updateAccountPassword,
  deleteAccountPassword
} from '@/api/account/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

interface AccountPassword {
  id?: number
  account_name?: string
  password?: string | null
  url?: string
  description?: string
  created_by?: number
  created_at?: string
  updated_at?: string | null
  creator_name?: string
}

const accountList = ref<AccountPassword[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增账号密码')
const isEdit = ref(false)
const form = reactive<AccountPassword>({
  account_name: '',
  password: '',
  url: '',
  description: ''
})
const editId = ref<number | null>(null)

const detailDialogVisible = ref(false)
const detail = ref<AccountPassword | null>(null)

function fetchList() {
  getAccountPasswords().then(res => {
    accountList.value = res.data || []
  })
}

function openCreateDialog() {
  dialogTitle.value = '新增账号密码'
  isEdit.value = false
  Object.assign(form, { account_name: '', password: '', url: '', description: '' })
  dialogVisible.value = true
  editId.value = null
}

function openEditDialog(row: AccountPassword) {
  dialogTitle.value = '编辑账号密码'
  isEdit.value = true
  editId.value = row.id || null
  if (editId.value !== null) {
    getAccountPasswordById(editId.value).then(res => {
      // 只取需要的字段，避免类型不兼容
      const data = res.data || {}
      Object.assign(form, {
        account_name: data.account_name ?? '',
        password: data.password ?? '',
        url: data.url ?? '',
        description: data.description ?? ''
      })
      dialogVisible.value = true
    })
  }
}

function handleSubmit() {
  if (isEdit.value && editId.value !== null) {
    updateAccountPassword(editId.value, form).then(() => {
      dialogVisible.value = false
      fetchList()
    })
  } else {
    createAccountPassword(form).then(() => {
      dialogVisible.value = false
      fetchList()
    })
  }
}

function handleDelete(id: number) {
  ElMessageBox.confirm('确定要删除该账号密码吗？', '提示', {
    type: 'warning'
  }).then(() => {
    deleteAccountPassword(id).then(() => {
      ElMessage.success('删除成功')
      fetchList()
    })
  }).catch(() => {})
}

function viewDetail(id: number) {
  getAccountPasswordById(id).then(res => {
    detail.value = res.data || null
    detailDialogVisible.value = true
  })
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

function copyAccountAndPassword() {
  if (!detail.value) return
  const account = detail.value.account_name ?? ''
  const password = detail.value.password ?? ''
  const text = `账号：${account}\n密码：${password}`
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('账密已复制')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.account-list-container {
  border-radius: 12px;
}

.account-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-list-header .title {
  font-size: 18px;
  font-weight: bold;
}
</style>
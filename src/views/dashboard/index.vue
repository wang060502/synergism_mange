<template>
  <el-card class="dashboard-container">
    <div class="dashboard-header">
      <div>首页</div>
    </div>
    <el-dialog
      v-model="showUnreadDialog"
      title="未读通知提醒"
      width="340px"
      :close-on-click-modal="false"
      :show-close="true"
    >
      <div style="font-size: 16px; color: #e6a23c; text-align: center;">
        您有 <b style="font-size: 22px; color: #f56c6c;">{{ unreadCount }}</b> 条未读通知，请及时处理！
      </div>
      <template #footer>
        <el-button type="primary" @click="snooze">暂不提醒（1小时）</el-button>
        <el-button type="primary" @click="goToNoticePage">去处理</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUnreadNotificationCount } from '@/api/notice';
import { useRouter } from 'vue-router';

const router = useRouter();

const showUnreadDialog = ref(false);
const unreadCount = ref(0);
const SNOOZE_KEY = 'unread_notice_snooze_until';

const snooze = () => {
  showUnreadDialog.value = false;
  const until = Date.now() + 60 * 60 * 1000; // 1小时后
  localStorage.setItem(SNOOZE_KEY, until.toString());
};

const checkUnreadNotifications = async () => {
  try {
    const snoozeUntil = parseInt(localStorage.getItem(SNOOZE_KEY) || '0', 10);
    if (snoozeUntil > Date.now()) return;
    const res = await getUnreadNotificationCount();
    const count = res.data?.unread_count ?? 0;
    if (count > 0) {
      unreadCount.value = count;
      showUnreadDialog.value = true;
    }
  } catch {
    // 可选：忽略错误或提示
  }
};

const goToNoticePage = () => {
  showUnreadDialog.value = false;
  router.push('/notice/my');
};

onMounted(() => {
  checkUnreadNotifications();
});

// 可选：跳转到通知页面
// import { useRouter } from 'vue-router';
// const router = useRouter();
// const goToNoticePage = () => {
//   showUnreadDialog.value = false;
//   router.push('/notice/my');
// };
</script>

<style scoped>
.dashboard-container {
  border-radius: 12px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header div {
  font-size: 18px;
  font-weight: bold;
}

</style>

<template>
  <div class="home-page">
    <!-- 版本标记 - 用于确认部署版本 -->
    <div style="background: linear-gradient(135deg, #EF4444, #F97316); padding: 8px; text-align: center; font-weight: bold; font-size: 14px; border-radius: 8px; margin: 10px;">
      正式首页版本 2026-03-12
    </div>
    <div class="liquid-bg"></div>
    <div class="liquid-orb liquid-orb-1"></div>
    <div class="liquid-orb liquid-orb-2"></div>
    <div class="liquid-orb liquid-orb-3"></div>

    <div class="status-bar">
      <div class="user-info">
        <span class="user-name">你好，战士</span>
        <span class="user-motto">{{ getMotto() }}</span>
      </div>
      <div class="settings-icon" @click="showSettings = true">
        <span>S</span>
      </div>
    </div>

    <div class="streak-section">
      <div class="streak-card glass-card">
        <span class="streak-label">戒色天数</span>
        <div class="streak-display">
          <span class="streak-days gradient-text">{{ streakData.days }}</span>
          <span class="streak-unit">天</span>
        </div>
        <div class="streak-time">
          <span>{{ streakData.hours }}小时 {{ streakData.minutes }}分钟</span>
        </div>
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-value">{{ stats.timeSaved }}</span>
            <span class="stat-label">节省时间</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.currentStreak }}</span>
            <span class="stat-label">当前连续</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalDays }}</span>
            <span class="stat-label">总计天数</span>
          </div>
        </div>
      </div>
    </div>

    <div class="progress-section">
      <div class="section-header">
        <span class="section-title">里程碑进度</span>
        <span class="section-action" @click="showMilestones = true">查看全部</span>
      </div>

      <!-- 进度条 -->
      <div class="progress-bar-container glass-card">
        <div class="progress-info">
          <span class="progress-label">距离下一个里程碑</span>
          <span class="progress-value">{{ nextMilestone.days - streakData.days }} 天</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill-quitter" :style="{ width: progressToNextMilestone + '%' }"></div>
        </div>
        <div class="milestone-markers">
          <span>第{{ currentMilestone.days }}天</span>
          <span>第{{ nextMilestone.days }}天</span>
        </div>
      </div>

      <!-- 里程碑徽章 -->
      <div class="milestones">
        <div v-for="milestone in milestones" :key="milestone.days" class="milestone-item" :class="{ achieved: streakData.days >= milestone.days }">
          <div class="milestone-icon">
            <span v-if="streakData.days >= milestone.days">{{ milestone.icon }}</span>
            <span v-else>{{ milestone.days }}</span>
          </div>
          <span class="milestone-days">{{ milestone.days }}天</span>
        </div>
      </div>
    </div>

    <div class="calendar-section">
      <div class="section-header">
        <span class="section-title">进度日历</span>
      </div>
      <div class="calendar-container glass-card">
        <!-- 月份导航 -->
        <div class="calendar-nav">
          <span class="calendar-month">{{ currentMonthName }}</span>
        </div>
        <!-- 日历头部 -->
        <div class="calendar-weekdays">
          <span>日</span>
          <span>一</span>
          <span>二</span>
          <span>三</span>
          <span>四</span>
          <span>五</span>
          <span>六</span>
        </div>
        <!-- 日历网格 -->
        <div class="calendar-grid">
          <div
            v-for="day in monthCalendarDays"
            :key="day.date"
            class="calendar-day"
            :class="{
              'completed': day.completed,
              'today': day.isToday,
              'future': day.isFuture,
              'has-entry': day.mood,
              'other-month': day.isOtherMonth
            }"
            @click="selectCalendarDay(day)"
          >
            <span class="day-number">{{ day.dayNum }}</span>
            <span v-if="day.mood" class="day-mood">{{ day.mood }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 日历日期详情弹窗 -->
    <div v-if="showCalendarDay" class="modal-overlay" @click="showCalendarDay = false">
      <div class="calendar-day-modal glass-card" @click.stop>
        <h3 class="modal-title">{{ selectedDayTitle }}</h3>

        <div v-if="selectedDayEntries.length > 0" class="day-entries">
          <div v-for="entry in selectedDayEntries" :key="entry.id" class="day-entry">
            <div v-if="entry.topic" class="entry-topic">
              <span class="topic-badge">主题：{{ entry.topic }}</span>
            </div>
            <div class="entry-time-mood">
              <span class="entry-mood-large">{{ getMoodEmoji(entry.mood) }}</span>
              <span class="entry-time-text">{{ formatEntryTime(entry.date) }}</span>
            </div>
            <p class="entry-content">{{ entry.text }}</p>
          </div>
        </div>

        <div v-else class="no-entries">
          <span class="no-entries-emoji">📝</span>
          <p>这一天没有日记记录</p>
        </div>

        <button class="close-btn" @click="showCalendarDay = false">关闭</button>
      </div>
    </div>

    <div class="quick-actions">
      <div class="action-item glass-card" @click="router.push('/plan')">
        <span class="action-icon">C</span>
        <span class="action-text">90天计划</span>
      </div>
      <div class="action-item glass-card" @click="showJournal = true">
        <span class="action-icon">J</span>
        <span class="action-text">日记</span>
      </div>
      <div class="action-item glass-card" @click="showStats = true">
        <span class="action-icon">S</span>
        <span class="action-text">详细统计</span>
      </div>
    </div>

    <div class="invite-center-section">
      <div class="section-header">
        <span class="section-title">邀请返现</span>
        <span class="section-action" @click="goToProfile">进入中心</span>
      </div>

      <div class="invite-center-card glass-card">
        <div class="invite-center-top">
          <div class="invite-center-code-block">
            <span class="invite-center-label">我的邀请码</span>
            <span class="invite-center-code">{{ invitePreviewCode }}</span>
          </div>
          <button
            class="invite-copy-btn"
            :disabled="!homeInviteCode"
            @click.stop="copyHomeInviteCode"
          >
            复制
          </button>
        </div>

        <div class="invite-center-stats">
          <div class="invite-stat-item">
            <span class="invite-stat-value">{{ homeInviteSummary.totalInvited }}</span>
            <span class="invite-stat-label">累计邀请</span>
          </div>
          <div class="invite-stat-item">
            <span class="invite-stat-value available">¥{{ homeInviteSummary.withdrawableAmount }}</span>
            <span class="invite-stat-label">可提现</span>
          </div>
        </div>

        <div class="invite-center-actions">
          <button class="invite-center-btn primary" @click="goToProfile">查看收益</button>
          <button class="invite-center-btn secondary" @click="goToWithdraw">去提现</button>
        </div>
      </div>
    </div>

    <div class="bottom-section">
      <div class="panic-section">
        <span class="panic-label">需要帮助？</span>
        <div class="panic-button" @click="router.push('/panic')">
          <span class="panic-icon">P</span>
          <span class="panic-text">紧急求助</span>
        </div>
      </div>
    </div>

    <div v-if="showMilestones" class="modal-overlay" @click="showMilestones = false">
      <div class="milestones-modal glass-card" @click.stop>
        <h3 class="modal-title">里程碑</h3>
        <div class="milestones-list">
          <div v-for="m in allMilestones" :key="m.days" class="milestone-row" :class="{ achieved: streakData.days >= m.days }">
            <span class="milestone-badge">{{ m.icon }}</span>
            <div class="milestone-info">
              <span class="milestone-name">{{ m.name }}</span>
              <span class="milestone-desc">{{ m.desc }}</span>
            </div>
            <span v-if="streakData.days >= m.days" class="milestone-check">完成</span>
            <span v-else class="milestone-progress">{{ Math.min(100, Math.round((streakData.days / m.days) * 100)) }}%</span>
          </div>
        </div>
        <button class="close-btn" @click="showMilestones = false">关闭</button>
      </div>
    </div>

    <div v-if="showJournal" class="modal-overlay" @click="showJournal = false">
      <div class="journal-modal glass-card" @click.stop>
        <h3 class="modal-title">日记</h3>

        <!-- 心情选择 -->
        <div class="mood-section">
          <span class="mood-label">今天心情如何？</span>
          <div class="mood-selector">
            <div
              v-for="mood in moods"
              :key="mood.value"
              class="mood-item"
              :class="{ selected: selectedMood === mood.value }"
              @click="selectedMood = mood.value"
            >
              <span class="mood-emoji">{{ mood.emoji }}</span>
              <span class="mood-text">{{ mood.label }}</span>
            </div>
          </div>
        </div>

        <!-- 写作提示 -->
        <div class="prompt-section" v-if="!journalText && !selectedTopic">
          <div class="prompt-card">
            <span class="prompt-text">{{ currentPrompt }}</span>
            <div class="prompt-actions">
              <span class="prompt-shuffle" @click.stop="shufflePrompt">换一条</span>
              <span class="prompt-confirm" @click.stop="confirmTopic">使用此主题</span>
            </div>
          </div>
        </div>

        <!-- 已选主题提示 -->
        <div v-if="selectedTopic" class="topic-selected">
          <span class="topic-label">主题：</span>
          <span class="topic-text">{{ selectedTopic }}</span>
          <span class="topic-clear" @click="clearTopic">清除</span>
        </div>

        <div class="journal-input">
          <textarea
            v-model="journalText"
            placeholder="写下你的想法..."
            class="journal-textarea"
          ></textarea>
        </div>

        <button class="save-journal-btn glass-button" @click="saveJournal">
          {{ editingEntryId ? '更新' : '保存' }}
        </button>

        <button v-if="editingEntryId" class="cancel-edit-btn" @click="cancelEdit">
          取消编辑
        </button>

        <!-- 日记列表 -->
        <div class="journal-entries">
          <h4>历史记录</h4>
          <div v-if="groupedJournalEntries.length === 0" class="empty-journal">
            <span class="empty-emoji">📝</span>
            <p>还没有日记记录</p>
            <p class="empty-hint">记录你的第一天日记吧</p>
          </div>

          <div v-for="group in groupedJournalEntries" :key="group.label" class="journal-group">
            <div class="group-header">{{ group.label }}</div>
            <div v-for="entry in group.entries" :key="entry.id" class="journal-entry">
              <div v-if="entry.topic" class="entry-topic-inline">
                <span class="topic-label">主题：</span>
                <span class="topic-value">{{ entry.topic }}</span>
              </div>
              <div class="entry-header">
                <span class="entry-mood">{{ getMoodEmoji(entry.mood) }}</span>
                <span class="entry-time">{{ formatRelativeTime(entry.createdAt) }}</span>
                <div class="entry-actions">
                  <span class="action-edit" @click="editEntry(entry)">编辑</span>
                  <span class="action-delete" @click="deleteEntry(entry.dateKey)">删除</span>
                </div>
              </div>
              <p class="entry-text">{{ entry.content }}</p>
            </div>
          </div>
        </div>
        <button class="close-btn" @click="showJournal = false">关闭</button>
      </div>
    </div>

    <div v-if="showStats" class="modal-overlay" @click="showStats = false">
      <div class="stats-modal glass-card" @click.stop>
        <h3 class="modal-title">统计数据</h3>
        <div class="stats-detail">
          <div class="stat-detail-row">
            <span class="stat-detail-label">当前连续</span>
            <span class="stat-detail-value">{{ streakData.days }} 天</span>
          </div>
          <div class="stat-detail-row">
            <span class="stat-detail-label">开始日期</span>
            <span class="stat-detail-value">{{ formatDate(startDate) }}</span>
          </div>
          <div class="stat-detail-row">
            <span class="stat-detail-label">总时长</span>
            <span class="stat-detail-value">{{ totalTime }}</span>
          </div>
          <div class="stat-detail-row">
            <span class="stat-detail-label">完成任务</span>
            <span class="stat-detail-value">{{ completedTasks }}</span>
          </div>
        </div>
        <button class="close-btn" @click="showStats = false">关闭</button>
      </div>
    </div>

    <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
      <div class="settings-modal glass-card" @click.stop>
        <h3 class="modal-title">设置</h3>
        <div class="settings-item" @click="resetStreak">
          <span class="settings-text">重置连续</span>
          <span class="settings-arrow">></span>
        </div>
        <div class="settings-item" @click="startNewJourney">
          <span class="settings-text">新旅程</span>
          <span class="settings-arrow">></span>
        </div>
        <div class="settings-item" @click="showGoals = true">
          <span class="settings-text">设定目标</span>
          <span class="settings-arrow">></span>
        </div>
        <div class="settings-item" @click="logout">
          <span class="settings-text">退出登录</span>
          <span class="settings-arrow">></span>
        </div>
        <button class="close-button" @click="showSettings = false">关闭</button>
      </div>
    </div>

    <div v-if="showGoals" class="modal-overlay" @click="showGoals = false">
      <div class="goals-modal glass-card" @click.stop>
        <h3 class="modal-title">目标</h3>
        <div class="goal-input-group">
          <label>你的目标</label>
          <input v-model="userGoal" class="glass-input" placeholder="输入你的目标..." />
        </div>
        <div class="goal-motivations">
          <h4>动力</h4>
          <div v-for="(motivation, idx) in motivations" :key="idx" class="motivation-item" @click="selectMotivation(motivation)">
            {{ motivation }}
          </div>
        </div>
        <button class="save-goals-btn glass-button" @click="saveGoals">保存</button>
        <button class="close-btn" @click="showGoals = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getSyncState, refreshDailySyncState, resetDailySyncState, useDailySyncState } from '../composables/useDailySync'

// 导入统一数据系统
import {
  getTodayKey,
  formatDateKey,
  parseDateKey,
  formatDisplayDate,
  getDateKeysInRange,
  STORAGE_KEYS
} from '../utils/dateUtils'
import {
  getAllJournalEntries,
  getJournalByDate,
  saveJournalByDate,
  deleteJournalByDate,
  getJournalDateList,
  initUserTimeState,
  getAllCalendarStatus,
  getCalendarStatusByDate,
  checkInDate,
  clearAuth,
  getUserInfo,
  isLoggedIn,
  useAppCacheState,
  setCachedUserGoal,
  getJourneyHistoryCache,
  setJourneyHistoryCache
} from '../utils/storage'
import {
  getInviteSummary,
  syncAuthenticatedSession,
  restartJourney,
  updateAppState,
  ensureDailyRecordLoaded,
  saveDailyRecord,
  deleteDailyJournal
} from '../services/api'

const router = useRouter()

const showSettings = ref(false)
const showMilestones = ref(false)
const showJournal = ref(false)
const showStats = ref(false)
const showGoals = ref(false)
const timer = ref(null)
const journalText = ref('')
const userGoal = ref('')
const { appStartDate } = useDailySyncState()
const { currentGoal: cachedGoal } = useAppCacheState()
const startDateKey = computed(() => appStartDate.value || '')
const homeInviteCode = ref(getUserInfo()?.inviteCode || '')
const homeInviteSummary = ref({
  totalInvited: 0,
  withdrawableAmount: 0
})
const invitePreviewCode = computed(() => homeInviteCode.value || '暂未生成')

watch(cachedGoal, (goal) => {
  if (!showGoals.value) {
    userGoal.value = goal || ''
  }
}, { immediate: true })

const refreshInviteCenterData = async () => {
  const cachedUserInfo = getUserInfo() || {}
  if (cachedUserInfo.inviteCode) {
    homeInviteCode.value = cachedUserInfo.inviteCode
  }

  if (!isLoggedIn()) {
    return
  }

  try {
    const result = await getInviteSummary()
    if (result.success && result.data) {
      homeInviteSummary.value = {
        totalInvited: result.data.totalInvited || 0,
        withdrawableAmount: result.data.withdrawableAmount || 0
      }

      if (result.data.myInviteCode) {
        homeInviteCode.value = result.data.myInviteCode
      }
    }
  } catch (error) {
    console.error('[Home] 加载邀请返现信息失败:', error)
  }
}

const goToProfile = () => {
  router.push('/profile')
}

const goToWithdraw = () => {
  router.push('/withdraw')
}

const copyHomeInviteCode = async () => {
  if (!homeInviteCode.value) return

  try {
    await navigator.clipboard.writeText(homeInviteCode.value)
  } catch (error) {
    const textarea = document.createElement('textarea')
    textarea.value = homeInviteCode.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert('邀请码已复制')
  }
}

// 日历相关
const showCalendarDay = ref(false)
const selectedDayTitle = ref('')
const selectedDayEntries = ref([])
const selectedDate = ref(null)

// 心情相关
const selectedMood = ref(3)
const editingEntryId = ref(null)
const currentPromptIndex = ref(0)
const selectedTopic = ref('')

const confirmTopic = () => {
  selectedTopic.value = currentPrompt.value
}

const clearTopic = () => {
  selectedTopic.value = ''
}

const moods = [
  { value: 1, emoji: '😢', label: '很差' },
  { value: 2, emoji: '😔', label: '不好' },
  { value: 3, emoji: '😐', label: '一般' },
  { value: 4, emoji: '😊', label: '不错' },
  { value: 5, emoji: '😄', label: '很好' }
]

const writingPrompts = [
  '今天是什么触发了你的冲动？',
  '列出三件你感激的事情',
  '今天你的能量水平与昨天相比如何？',
  '你明天的主要目标是什么？',
  '今天你克服了什么困难？',
  '有什么事情让你感到自豪？',
  '描述一下今天让你微笑的事情',
  '今天你学到了什么？',
  '有什么事情你想要改变吗？',
  '你对明天有什么期望？',
  '今天你最感激身边的谁？',
  '描述一下你现在的感受',
  '今天遇到的最大挑战是什么？',
  '你觉得自己今天表现如何？',
  '有什么事情让你感到平静？'
]

const currentPrompt = computed(() => writingPrompts[currentPromptIndex.value])

const shufflePrompt = () => {
  currentPromptIndex.value = (currentPromptIndex.value + 1) % writingPrompts.length
}

const getMoodEmoji = (mood) => {
  const found = moods.find(m => m.value === mood)
  return found ? found.emoji : '😐'
}

const formatRelativeTime = (timestamp) => {
  const now = Date.now()
  const ts = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime()
  if (isNaN(ts)) return ''
  const diff = now - ts
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`

  const date = new Date(ts)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const groupedJournalEntries = computed(() => {
  const entries = journalEntries.value
  const groups = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayEntries = []
  const yesterdayEntries = []
  const olderEntries = []

  entries.forEach(entry => {
    const entryDate = new Date(entry.createdAt)
    entryDate.setHours(0, 0, 0, 0)

    if (entryDate.getTime() === today.getTime()) {
      todayEntries.push(entry)
    } else if (entryDate.getTime() === yesterday.getTime()) {
      yesterdayEntries.push(entry)
    } else {
      olderEntries.push(entry)
    }
  })

  if (todayEntries.length > 0) {
    groups.push({ label: '今天', entries: todayEntries })
  }
  if (yesterdayEntries.length > 0) {
    groups.push({ label: '昨天', entries: yesterdayEntries })
  }
  if (olderEntries.length > 0) {
    groups.push({ label: '更早', entries: olderEntries })
  }

  return groups
})

const editEntry = (entry) => {
  editingEntryId.value = entry.dateKey
  journalText.value = entry.content
  selectedMood.value = entry.mood || 3
  selectedTopic.value = entry.topic || ''
}

const cancelEdit = () => {
  editingEntryId.value = null
  journalText.value = ''
  selectedMood.value = 3
  selectedTopic.value = ''
}

const showActionError = (message) => {
  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(message)
  }
}

// 使用统一存储系统删除日记
const deleteEntry = async (id) => {
  if (confirm('确定要删除这条日记吗？')) {
    if (id) {
      if (isLoggedIn()) {
        try {
          const result = await deleteDailyJournal(id)
          if (!result.success) {
            throw new Error(result.error?.message || '删除失败')
          }
        } catch (error) {
          console.error('[Home] 删除云端日记失败:', error)
          showActionError('删除失败，请稍后重试')
          return
        }
      } else {
        deleteJournalByDate(id)
      }
    }

    loadJournalEntries()
  }
}

const motivations = [
  '为了自信',
  '为了更好的生活',
  '为了家人',
  '为了自我提升',
  '为了梦想',
  '为了健康'
]

const getMotto = () => {
  const mottos = [
    '今天继续加油',
    '每一步都重要',
    '坚持就是胜利',
    '相信自己',
    '你很棒',
    '比昨天更好'
  ]
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % mottos.length
  return mottos[dayIndex]
}

// 使用统一数据系统计算连续天数
const streakData = computed(() => {
  const activeStartDate = startDateKey.value

  if (!activeStartDate) {
    return { days: 0, hours: 0, minutes: 0 }
  }

  const now = Date.now()
  const startTimestamp = new Date(`${activeStartDate}T00:00:00`).getTime()
  const diff = now - startTimestamp

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes }
})

const stats = computed(() => {
  const days = streakData.value.days
  return {
    timeSaved: `${days * 2}+ 小时`,
    currentStreak: `${days} 天`,
    totalDays: `${days} 天`
  }
})

const totalTime = computed(() => {
  const { days, hours } = streakData.value
  return `${days}d ${hours}h`
})

// 使用统一数据系统的开始日期
const startDate = computed(() => {
  return startDateKey.value ? new Date(`${startDateKey.value}T00:00:00`).getTime() : Date.now()
})

// 使用统一数据系统获取完成任务数
const completedTasks = computed(() => {
  if (!startDateKey.value) return 0

  const todayKey = getTodayKey()
  const allStatus = getAllCalendarStatus()

  // 计算从开始到今天的天数中，已打卡的次数
  let count = 0
  const startDate = parseDateKey(startDateKey.value)
  const today = parseDateKey(todayKey)

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateKey = formatDateKey(d)
    if (allStatus[dateKey]?.checked) {
      count++
    }
  }

  return count
})

const journalEntries = ref([])

// 使用统一存储系统加载日记数据
const loadJournalEntries = () => {
  const allEntries = getAllJournalEntries()
  // 转换为数组格式并按日期降序排列
  const entriesArray = Object.values(allEntries).sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  )
  journalEntries.value = entriesArray
}

// 初始加载
loadJournalEntries()

const milestones = ref([
  { days: 3, icon: '3' },
  { days: 7, icon: '7' },
  { days: 30, icon: '30' },
  { days: 60, icon: '60' },
  { days: 90, icon: '90' }
])

// 当前里程碑
const currentMilestone = computed(() => {
  const days = streakData.value.days
  let current = milestones.value[0]
  for (const m of milestones.value) {
    if (days >= m.days) {
      current = m
    }
  }
  return current
})

// 下一个里程碑
const nextMilestone = computed(() => {
  const days = streakData.value.days
  for (const m of milestones.value) {
    if (days < m.days) {
      return m
    }
  }
  return milestones.value[milestones.value.length - 1]
})

// 距离下一个里程碑的进度百分比
const progressToNextMilestone = computed(() => {
  const days = streakData.value.days
  const current = currentMilestone.value
  const next = nextMilestone.value

  if (days >= next.days) return 100

  const total = next.days - current.days
  const progress = days - current.days

  return Math.min(100, Math.max(0, Math.round((progress / total) * 100)))
})

const allMilestones = ref([
  { days: 1, icon: '1', name: '第1天', desc: '开启新旅程' },
  { days: 3, icon: '2', name: '第3天', desc: '初步习惯' },
  { days: 7, icon: '3', name: '第7天', desc: '习惯形成中' },
  { days: 14, icon: '4', name: '第14天', desc: '神经变化' },
  { days: 21, icon: '5', name: '第21天', desc: '21天习惯' },
  { days: 30, icon: '6', name: '第30天', desc: '里程碑' },
  { days: 45, icon: '7', name: '第45天', desc: '持续进步' },
  { days: 60, icon: '8', name: '第60天', desc: '重大突破' },
  { days: 75, icon: '9', name: '第75天', desc: '即将成功' },
  { days: 90, icon: '10', name: '第90天', desc: '完成目标' }
])

// 使用统一数据系统的日历数据
const calendarDays = computed(() => {
  const days = []
  const today = new Date()
  const startDateVal = startDateKey.value ? new Date(`${startDateKey.value}T00:00:00`).getTime() : Date.now()
  const allStatus = getAllCalendarStatus()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = formatDateKey(date)
    const dayNum = date.getDate()
    const isToday = i === 0
    const isFuture = i > 0

    const daySinceStart = Math.floor((today.getTime() - startDateVal) / (1000 * 60 * 60 * 24))
    const dayNumber = daySinceStart - i + 1
    const completed = allStatus[dateKey]?.checked && dayNumber > 0

    days.push({
      date: dateKey,
      dayNum,
      isToday,
      isFuture,
      completed
    })
  }
  return days
})

// 获取日记中的心情数据 - 使用统一存储系统
const journalMoodMap = computed(() => {
  const allEntries = getAllJournalEntries()
  const map = {}
  Object.entries(allEntries).forEach(([dateKey, entry]) => {
    if (!map[dateKey] && entry.mood) {
      map[dateKey] = entry.mood
    }
  })
  return map
})

// 当前月份的日历
const currentMonthName = computed(() => {
  const today = new Date()
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  return `${today.getFullYear()}年 ${monthNames[today.getMonth()]}`
})

// 月历显示 - 使用统一数据系统
const monthCalendarDays = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDateVal = startDateKey.value ? new Date(`${startDateKey.value}T00:00:00`).getTime() : Date.now()
  const allStatus = getAllCalendarStatus()

  const days = []

  // 添加上月末尾的空白日期
  const firstDayWeekday = firstDay.getDay()
  if (firstDayWeekday > 0) {
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      days.push({
        dayNum: prevMonthLastDay - i,
        isOtherMonth: true,
        date: '',
        isToday: false,
        isFuture: false,
        mood: null,
        completed: false
      })
    }
  }

  // 添加当月日期 - 使用统一存储系统
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    const dateKey = formatDateKey(date)
    const isToday = date.toDateString() === today.toDateString()
    const isFuture = date > today

    const daySinceStart = Math.floor((today.getTime() - startDateVal) / (1000 * 60 * 60 * 24))
    const dayNumber = daySinceStart - (today.getDate() - i) + 1
    const completed = allStatus[dateKey]?.checked && dayNumber > 0 && !isFuture

    // 获取当天的心情 - 使用统一存储的journalMoodMap
    const mood = journalMoodMap.value[dateKey]

    days.push({
      dayNum: i,
      date: dateKey,
      isOtherMonth: false,
      isToday,
      isFuture,
      mood: mood ? getMoodEmoji(mood) : null,
      completed,
      moodValue: mood
    })
  }

  // 添加下月开头的空白日期
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      dayNum: i,
      isOtherMonth: true,
      date: '',
      isToday: false,
      isFuture: false,
      mood: null,
      completed: false
    })
  }

  return days
})

// 选择日历日期 - 使用统一数据系统
const selectCalendarDay = async (day) => {
  if (!day.date || day.isFuture || day.isOtherMonth) return

  const localEntry = getJournalByDate(day.date)
  const localCalendarStatus = getCalendarStatusByDate(day.date)

  if (isLoggedIn() && !localEntry && !localCalendarStatus?.checked) {
    try {
      await ensureDailyRecordLoaded(day.date)
    } catch (error) {
      console.warn('[Home] 获取单日云端记录失败，继续使用本地缓存:', error)
    }
  }

  selectedDate.value = day.date

  // 使用统一存储获取当天的日记
  const dayEntry = getJournalByDate(day.date)
  selectedDayEntries.value = dayEntry ? [dayEntry] : []

  // 设置标题 - 使用统一日期工具
  selectedDayTitle.value = formatDisplayDate(day.date)

  showCalendarDay.value = true
}

const formatEntryTime = (timestamp) => {
  const date = new Date(parseInt(timestamp))
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const formatDate = (timestamp) => {
  const date = new Date(parseInt(timestamp))
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

// 使用统一存储系统保存日记
const saveJournal = async () => {
  if (!journalText.value.trim()) return

  const todayKey = getTodayKey()
  const draftPayload = editingEntryId.value
    ? {
        ...getJournalByDate(todayKey),
        content: journalText.value.trim(),
        mood: selectedMood.value,
        topic: selectedTopic.value || getJournalByDate(todayKey)?.topic,
        editedAt: Date.now()
      }
    : {
        content: journalText.value.trim(),
        mood: selectedMood.value,
        topic: selectedTopic.value,
        createdAt: new Date().toISOString()
      }

  if (isLoggedIn()) {
    try {
      const result = await saveDailyRecord(todayKey, {
        journalContent: draftPayload.content,
        journalMood: draftPayload.mood,
        journalTopic: draftPayload.topic
      })

      if (!result.success) {
        throw new Error(result.error?.message || '保存失败')
      }
    } catch (error) {
      console.error('[Home] 保存云端日记失败:', error)
      showActionError('日记保存失败，请稍后重试')
      return
    }
  } else {
    saveJournalByDate(todayKey, draftPayload)
  }

  editingEntryId.value = null
  loadJournalEntries()

  journalText.value = ''
  selectedMood.value = 3
  selectedTopic.value = ''
}

const selectMotivation = (motivation) => {
  userGoal.value = motivation
}

const saveGoals = async () => {
  if (userGoal.value.trim()) {
    if (isLoggedIn()) {
      try {
        const result = await updateAppState({
          currentGoal: userGoal.value.trim()
        })
        if (!result.success) {
          throw new Error(result.error?.message || '保存失败')
        }
      } catch (error) {
        console.error('[Home] 保存目标失败:', error)
        showActionError('目标保存失败，请稍后重试')
        return
      }
    } else {
      setCachedUserGoal(userGoal.value.trim())
    }
  }
  showGoals.value = false

}

// 使用统一存储系统重置连续记录
const resetStreak = async () => {
  if (confirm('Reset streak?')) {
    const todayKey = getTodayKey()
    if (isLoggedIn()) {
      try {
        const result = await restartJourney({
          startDateKey: todayKey,
          archiveCurrentJourney: false
        })
        if (!result.success) {
          throw new Error(result.error?.message || '重置失败')
        }
      } catch (error) {
        console.error('[Home] 重置旅程状态失败:', error)
        showActionError('重置失败，请稍后重试')
        return
      }
    } else {
      initUserTimeState(todayKey)
    }
    refreshDailySyncState()
    showSettings.value = false

  }
}

const startNewJourney = async () => {
  if (confirm('Start new journey?')) {
    const currentJourney = {
      startDateKey: startDateKey.value,
      endDateKey: getTodayKey(),
      streakDays: streakData.value.days,
      endedReason: 'restart',
      createdAt: Date.now()
    }

    const todayKey = getTodayKey()
    if (isLoggedIn()) {
      try {
        const result = await restartJourney({
          startDateKey: todayKey,
          archiveCurrentJourney: !!currentJourney.startDateKey,
          currentJourney: currentJourney.startDateKey ? currentJourney : null
        })
        if (!result.success) {
          throw new Error(result.error?.message || '保存失败')
        }
      } catch (error) {
        console.error('[Home] 保存旅程历史失败:', error)
        showActionError('开启新旅程失败，请稍后重试')
        return
      }
    }

    if (!isLoggedIn()) {
      const nextJourneys = [currentJourney, ...getJourneyHistoryCache()]
      setJourneyHistoryCache(nextJourneys)
      initUserTimeState(todayKey)
    }
    refreshDailySyncState()

    showSettings.value = false

  }
}

const logout = () => {
  if (confirm('Logout?')) {
    clearAuth()
    resetDailySyncState()
    router.replace('/login')
  }
}

onMounted(async () => {
  const syncState = getSyncState()

  if (isLoggedIn() && !syncState.hasSynced) {
    try {
      await syncAuthenticatedSession()
    } catch (error) {
      console.error('[Home] 拉取云端数据失败:', error)
    }
  }

  await refreshInviteCenterData()
  loadJournalEntries()
  streakData.value
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})

// 监听日记弹窗打开，重置表单
watch(showJournal, (newVal) => {
  if (newVal) {
    journalText.value = ''
    selectedMood.value = 3
    editingEntryId.value = null
    currentPromptIndex.value = 0
    selectedTopic.value = ''
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow-x: hidden;
  padding-bottom: calc(140px + env(safe-area-inset-bottom));
}

.status-bar {
  position: relative;
  z-index: 10;
  padding: 80px 24px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: #F8FAFC;
}

.user-motto {
  font-size: 15px;
  color: #94A3B8;
}

.settings-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #F8FAFC;
  cursor: pointer;
}

.streak-section {
  padding: 0 24px;
  margin-bottom: 16px;
}

.streak-card {
  padding: 24px;
  text-align: center;
}

.streak-label {
  font-size: 15px;
  color: #94A3B8;
  display: block;
  margin-bottom: 8px;
}

.streak-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 6px;
}

.streak-days {
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
}

.streak-unit {
  font-size: 22px;
  color: #94A3B8;
  margin-left: 4px;
}

.streak-time {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 16px;
}

.stats-row {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #F8FAFC;
}

.stat-label {
  font-size: 12px;
  color: #64748B;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
}

.progress-section {
  padding: 0 24px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #F8FAFC;
}

/* Quitter风格进度条 */
.progress-bar-container {
  padding: 16px;
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 14px;
  color: #94A3B8;
}

.progress-value {
  font-size: 16px;
  font-weight: 600;
  color: #8B5CF6;
}

.progress-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill-quitter {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #EC4899);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.milestone-markers {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #64748B;
}

.section-action {
  font-size: 13px;
  color: #3B82F6;
  cursor: pointer;
}

.milestones {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
}

.milestone-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.4;
  transition: all 0.3s ease;
  cursor: pointer;
}

.milestone-item.achieved {
  opacity: 1;
}

.milestone-item .milestone-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #94A3B8;
  margin-bottom: 6px;
  transition: all 0.3s ease;
}

.milestone-item.achieved .milestone-icon {
  background: linear-gradient(135deg, #8B5CF6, #EC4899);
  color: white;
}

.milestone-days {
  font-size: 11px;
  color: #94A3B8;
}

.calendar-section {
  padding: 0 24px;
  margin-bottom: 16px;
}

.calendar-container {
  padding: 16px;
}

.calendar-nav {
  text-align: center;
  margin-bottom: 16px;
}

.calendar-month {
  font-size: 16px;
  font-weight: 600;
  color: #F8FAFC;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.calendar-weekdays span {
  font-size: 12px;
  color: #64748B;
  padding: 8px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  padding: 2px;
}

.calendar-day:active {
  transform: scale(0.95);
}

.calendar-day.completed {
  background: linear-gradient(135deg, #10B981, #059669);
}

.calendar-day.today {
  border: 2px solid #8B5CF6;
  background: rgba(139, 92, 246, 0.2);
}

.calendar-day.future {
  opacity: 0.3;
  cursor: default;
}

.calendar-day.has-entry {
  background: rgba(139, 92, 246, 0.15);
}

.calendar-day.other-month {
  opacity: 0.2;
}

.day-mood {
  font-size: 14px;
  line-height: 1;
  margin-top: 1px;
}

.day-number {
  font-size: 11px;
  color: #94A3B8;
  font-weight: 500;
}

/* 日历日期详情弹窗 */
.calendar-day-modal {
  max-height: 80vh;
  overflow-y: auto;
}

.day-entries {
  max-height: 400px;
  overflow-y: auto;
}

.day-entry {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.entry-time-mood {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.entry-mood-large {
  font-size: 28px;
}

.entry-time-text {
  font-size: 13px;
  color: #94A3B8;
}

.entry-content {
  font-size: 14px;
  color: #F8FAFC;
  line-height: 1.6;
  margin: 0;
}

/* 日记主题样式 */
.entry-topic {
  margin-bottom: 8px;
}

.topic-badge {
  display: inline-block;
  background: linear-gradient(135deg, #8B5CF6, #6366F1);
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.entry-topic-inline {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
}

.entry-topic-inline .topic-label {
  color: #8B5CF6;
  font-size: 12px;
  font-weight: 500;
}

.entry-topic-inline .topic-value {
  color: #F8FAFC;
  font-size: 13px;
  font-weight: 500;
}

.no-entries {
  text-align: center;
  padding: 40px 20px;
}

.no-entries-emoji {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.no-entries p {
  color: #94A3B8;
  margin: 0;
}

.quick-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px;
}

.invite-center-section {
  padding: 16px 24px 0;
}

.invite-center-card {
  padding: 18px 16px;
}

.invite-center-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.invite-center-code-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.invite-center-label {
  font-size: 13px;
  color: #94A3B8;
}

.invite-center-code {
  font-size: 22px;
  font-weight: 700;
  color: #3B82F6;
  letter-spacing: 1px;
}

.invite-copy-btn {
  min-width: 72px;
  height: 38px;
  padding: 0 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.invite-copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.invite-center-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.invite-stat-item {
  padding: 14px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.invite-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #F8FAFC;
}

.invite-stat-value.available {
  color: #10B981;
}

.invite-stat-label {
  font-size: 12px;
  color: #94A3B8;
}

.invite-center-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.invite-center-btn {
  height: 42px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.invite-center-btn.primary {
  border: none;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: #fff;
}

.invite-center-btn.secondary {
  border: 1px solid rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.action-item {
  flex: 1;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.action-icon {
  font-size: 22px;
  margin-bottom: 6px;
  color: #F8FAFC;
}

.action-text {
  font-size: 12px;
  color: #F8FAFC;
}

.bottom-section {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  padding: 16px 24px calc(28px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 70%, rgba(0, 0, 0, 0.8));
  z-index: 50;
}

.panic-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.panic-label {
  font-size: 12px;
  color: #64748B;
  margin-bottom: 10px;
}

.panic-button {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: linear-gradient(135deg, #EF4444, #DC2626);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
  animation: pulse 2s ease-in-out infinite;
  cursor: pointer;
}

.panic-icon {
  font-size: 22px;
  margin-bottom: 2px;
  color: #F8FAFC;
}

.panic-text {
  font-size: 11px;
  color: #F8FAFC;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.8);
    transform: scale(1.05);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.settings-modal,
.milestones-modal,
.journal-modal,
.stats-modal,
.goals-modal {
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #F8FAFC;
  display: block;
  margin-bottom: 20px;
  text-align: center;
}

.milestones-list {
  margin-bottom: 20px;
}

.milestone-row {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  opacity: 0.5;
}

.milestone-row.achieved {
  opacity: 1;
}

.milestone-badge {
  font-size: 28px;
  margin-right: 14px;
  color: #F8FAFC;
}

.milestone-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.milestone-name {
  font-size: 15px;
  font-weight: 600;
  color: #F8FAFC;
}

.milestone-desc {
  font-size: 12px;
  color: #64748B;
}

.milestone-check {
  font-size: 20px;
  color: #10B981;
}

.milestone-progress {
  font-size: 14px;
  color: #64748B;
}

.journal-input {
  margin-bottom: 16px;
}

.journal-textarea {
  width: 100%;
  height: 120px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #F8FAFC;
  padding: 14px;
  font-size: 14px;
  resize: none;
  font-family: inherit;
}

.journal-textarea::placeholder {
  color: rgba(248, 250, 252, 0.5);
}

/* 心情选择器 */
.mood-section {
  margin-bottom: 16px;
}

.mood-label {
  font-size: 14px;
  color: #94A3B8;
  display: block;
  margin-bottom: 10px;
}

.mood-selector {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}

.mood-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mood-item.selected {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8B5CF6;
  transform: scale(1.05);
}

.mood-emoji {
  font-size: 22px;
  margin-bottom: 4px;
}

.mood-text {
  font-size: 10px;
  color: #94A3B8;
}

.mood-item.selected .mood-text {
  color: #8B5CF6;
}

/* 写作提示 */
.prompt-section {
  margin-bottom: 12px;
}

.prompt-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 14px;
  transition: all 0.2s ease;
}

.prompt-text {
  font-size: 14px;
  color: #F8FAFC;
  line-height: 1.5;
  display: block;
}

.prompt-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(139, 92, 246, 0.2);
}

.prompt-shuffle {
  font-size: 13px;
  color: #94A3B8;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.prompt-shuffle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #F8FAFC;
}

.prompt-confirm {
  font-size: 13px;
  color: #8B5CF6;
  cursor: pointer;
  padding: 4px 12px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 4px;
  font-weight: 500;
}

.prompt-confirm:hover {
  background: rgba(139, 92, 246, 0.3);
}

/* 已选主题 */
.topic-selected {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-label {
  font-size: 13px;
  color: #8B5CF6;
  font-weight: 500;
}

.topic-text {
  font-size: 14px;
  color: #F8FAFC;
  flex: 1;
}

.topic-clear {
  font-size: 12px;
  color: #EF4444;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
}

.topic-clear:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* 取消编辑按钮 */
.cancel-edit-btn {
  width: 100%;
  height: 40px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #94A3B8;
  font-size: 14px;
  margin-bottom: 12px;
  cursor: pointer;
}

/* 日记分组 */
.journal-group {
  margin-bottom: 16px;
}

.group-header {
  font-size: 13px;
  color: #8B5CF6;
  font-weight: 600;
  margin-bottom: 10px;
  padding-left: 4px;
}

/* 日记条目头部 */
.entry-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.entry-mood {
  font-size: 18px;
  margin-right: 8px;
}

.entry-time {
  font-size: 12px;
  color: #64748B;
  flex: 1;
}

.entry-actions {
  display: flex;
  gap: 12px;
}

.action-edit,
.action-delete {
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.action-edit {
  color: #3B82F6;
}

.action-delete {
  color: #EF4444;
}

.action-edit:hover,
.action-delete:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 空状态 */
.empty-journal {
  text-align: center;
  padding: 30px 20px;
}

.empty-emoji {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-journal p {
  color: #94A3B8;
  margin: 0;
}

.empty-hint {
  font-size: 13px;
  color: #64748B;
  margin-top: 6px !important;
}

.save-journal-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  margin-bottom: 20px;
}

.journal-entries h4 {
  font-size: 15px;
  color: #F8FAFC;
  margin-bottom: 12px;
}

.empty-journal {
  font-size: 14px;
  color: #64748B;
  text-align: center;
  padding: 20px;
}

.journal-entry {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-bottom: 10px;
}

.entry-date {
  font-size: 12px;
  color: #8B5CF6;
  display: block;
  margin-bottom: 6px;
}

.entry-text {
  font-size: 14px;
  color: #F8FAFC;
  line-height: 1.6;
  margin: 0;
}

.stats-detail {
  margin-bottom: 20px;
}

.stat-detail-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-detail-label {
  font-size: 14px;
  color: #94A3B8;
}

.stat-detail-value {
  font-size: 14px;
  color: #F8FAFC;
  font-weight: 600;
}

.goal-input-group {
  margin-bottom: 20px;
}

.goal-input-group label {
  font-size: 14px;
  color: #94A3B8;
  display: block;
  margin-bottom: 8px;
}

.goal-motivations h4 {
  font-size: 14px;
  color: #94A3B8;
  margin-bottom: 10px;
}

.motivation-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #F8FAFC;
  cursor: pointer;
  transition: background 0.2s;
}

.motivation-item:hover {
  background: rgba(59, 130, 246, 0.2);
}

.save-goals-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  margin-bottom: 12px;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
}

.settings-text {
  font-size: 15px;
  color: #F8FAFC;
}

.settings-arrow {
  font-size: 15px;
  color: #64748B;
}

.close-btn {
  width: 100%;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #F8FAFC;
  font-size: 15px;
  cursor: pointer;
  margin-top: 12px;
}

.close-button {
  width: 100%;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #F8FAFC;
  font-size: 15px;
  margin-top: 20px;
  cursor: pointer;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useClassStore } from '../stores/classStore'
import { useRouter } from 'vue-router'
import { useI18n } from '../i18n'

const store = useClassStore()
const router = useRouter()
const { t } = useI18n()

const totalGroups = computed(() => store.groups.length)
const totalStudents = computed(() => store.students.length)
const totalSessions = computed(() => store.getAllSessions.length)
const totalTP = computed(() => store.getAllSessions.length)

const totalAbsences = computed(() => {
  return store.attendanceRecords.filter(r => r.status === 'absent').length
})

const totalBonuses = computed(() => {
  return store.bonusRecords.reduce((sum, b) => sum + b.points, 0)
})

const groupStats = computed(() => {
  return store.groups.map(group => {
    const groupStudents = store.getStudentsByGroup(group.id)
    const groupStudentIds = groupStudents.map(s => s.id)
    const groupSessionDates = store.getGroupSessions(group.id)
    const groupSessionSet = new Set(groupSessionDates)
    
    const groupAttendance = store.attendanceRecords.filter(r => 
      groupStudentIds.includes(r.studentId) && groupSessionSet.has(r.date)
    )
    
    const presentCount = groupAttendance.filter(a => a.status === 'present').length
    const excusedCount = groupAttendance.filter(a => a.status === 'excused').length
    const absentCount = groupAttendance.filter(a => a.status === 'absent').length
    
    const totalMarked = presentCount + excusedCount + absentCount
    const sessionsAdded = groupSessionDates.length
    const totalSessions = store.numberOfSessions
    const progress = sessionsAdded > 0 ? Math.round((sessionsAdded / totalSessions) * 100) : 0
    
    return {
      ...group,
      presentCount,
      excusedCount,
      absentCount,
      totalMarked,
      progress,
      studentCount: groupStudents.length,
      sessionCount: sessionsAdded,
      totalSessions,
    }
  })
})

const navigateToGroup = (groupId: number) => {
  router.push(`/groups/${groupId}`)
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'success'
  if (progress >= 50) return 'warning'
  return 'error'
}
</script>

<template>
  <div>
    <div class="d-flex align-center mb-6">
      <h1 class="text-h4 font-weight-bold">{{ t('dashboard.title') }}</h1>
    </div>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" variant="tonal">
          <v-card-text>
            <div class="text-h4 font-weight-bold">{{ totalGroups }}</div>
            <div class="text-subtitle-2">{{ t('dashboard.groups') }}</div>
          </v-card-text>
          <v-card-actions>
            <v-icon color="primary">mdi-account-group</v-icon>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="success" variant="tonal">
          <v-card-text>
            <div class="text-h4 font-weight-bold">{{ totalStudents }}</div>
            <div class="text-subtitle-2">{{ t('dashboard.students') }}</div>
          </v-card-text>
          <v-card-actions>
            <v-icon color="success">mdi-account-multiple</v-icon>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" variant="tonal">
          <v-card-text>
            <div class="text-h4 font-weight-bold">{{ totalTP }}</div>
            <div class="text-subtitle-2">{{ t('dashboard.sessions') }}</div>
          </v-card-text>
          <v-card-actions>
            <v-icon color="warning">mdi-calendar</v-icon>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="error" variant="tonal">
          <v-card-text>
            <div class="text-h4 font-weight-bold">{{ totalAbsences }}</div>
            <div class="text-subtitle-2">{{ t('dashboard.absences') }}</div>
          </v-card-text>
          <v-card-actions>
            <v-icon color="error">mdi-account-minus</v-icon>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mb-6">
      <v-card-title class="text-h6">
        <v-icon start>mdi-chart-donut</v-icon>
        {{ t('dashboard.progress') }}
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            v-for="group in groupStats"
            :key="group.id"
            cols="12"
            sm="6"
            md="3"
          >
            <div class="text-center" @click="navigateToGroup(group.id)" style="cursor: pointer">
              <v-progress-circular
                :model-value="group.progress"
                :color="getProgressColor(group.progress)"
                :size="80"
                :width="8"
              >
                <div class="text-h6">{{ group.progress }}%</div>
              </v-progress-circular>
              <div class="text-subtitle-2 mt-2">{{ group.name }}</div>
              <div class="text-caption text-grey">
                {{ group.studentCount }} {{ t('groups.students') }} | {{ group.sessionCount }} {{ t('dashboard.sessions').toLowerCase() }}
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="text-h6">
            <v-icon start>mdi-chart-line</v-icon>
            {{ t('dashboard.overview') }}
          </v-card-title>
          <v-card-text>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>{{ t('dashboard.groups') }}</th>
                  <th>{{ t('dashboard.students') }}</th>
                  <th>{{ t('attendance.present') }}</th>
                  <th>{{ t('attendance.absent') }}</th>
                  <th>%</th>
                  <th>{{ t('common.view') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="group in groupStats" :key="group.id">
                  <td>{{ group.name }}</td>
                  <td>{{ group.studentCount }}</td>
                  <td>{{ group.presentCount }}</td>
                  <td>{{ group.absentCount }}</td>
                  <td>{{ group.progress }}%</td>
                  <td>
                    <v-btn size="small" variant="text" color="primary" @click="navigateToGroup(group.id)">
                      {{ t('common.view') }}
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="text-h6">
            <v-icon start>mdi-star</v-icon>
            {{ t('dashboard.quickStats') }}
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="warning">mdi-star</v-icon>
                </template>
                <v-list-item-title>{{ t('dashboard.bonus') }}</v-list-item-title>
                <v-list-item-subtitle>{{ totalBonuses }} pts</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="error">mdi-close-circle</v-icon>
                </template>
                <v-list-item-title>{{ t('dashboard.absences') }}</v-list-item-title>
                <v-list-item-subtitle>{{ totalAbsences }} {{ t('dashboard.sessions').toLowerCase() }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>{{ t('dashboard.present') }}</v-list-item-title>
                <v-list-item-subtitle>{{ totalStudents - totalAbsences }} {{ t('groups.students') }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-calendar-check</v-icon>
                </template>
                <v-list-item-title>{{ t('dashboard.sessions') }}</v-list-item-title>
                <v-list-item-subtitle>{{ totalTP }} {{ t('dashboard.recorded') }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
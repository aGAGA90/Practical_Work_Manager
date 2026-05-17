<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClassStore } from '../stores/classStore'

const store = useClassStore()
const exportDialog = ref(false)
const exportData = ref('')

const groupStats = computed(() => {
  return store.groups.map(group => {
    const stats = store.getGroupStats(group.id)
    const students = store.getStudentsByGroup(group.id)

    const topStudents = students
      .map(s => ({
        ...s,
        totalBonus: store.getTotalBonus(s.id),
        attendance: store.getAttendanceByStudent(s.id).filter(a => a.status === 'present').length,
      }))
      .sort((a, b) => b.totalBonus - a.totalBonus)
      .slice(0, 5)

    return {
      ...group,
      ...stats,
      topStudents,
    }
  })
})

const overallStats = computed(() => {
  const totalStudents = store.students.length
  const totalSessions = store.getAllSessions.length
  const totalPossible = totalStudents * totalSessions

  const presentCount = store.attendanceRecords.filter(r => r.status === 'present').length
  const absentCount = store.attendanceRecords.filter(r => r.status === 'absent').length
  const excusedCount = store.attendanceRecords.filter(r => r.status === 'excused').length

  const totalBonus = store.bonusRecords.reduce((sum, b) => sum + b.points, 0)

  return {
    totalStudents,
    totalSessions,
    totalPossible,
    presentCount,
    absentCount,
    excusedCount,
    totalBonus,
    attendanceRate: totalPossible > 0 ? ((presentCount + excusedCount) / totalPossible * 100).toFixed(1) : 0,
  }
})

const generateCSV = () => {
  let csv = 'Group,Students,Sessions,Present,Absent,Excused,Attendance Rate\n'

  groupStats.value.forEach(g => {
    csv += `${g.name},${g.totalStudents},${g.totalSessions},${g.presentCount},${g.absentCount},${g.excusedCount},${g.attendanceRate}%\n`
  })

  exportData.value = csv
  exportDialog.value = true
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(exportData.value)
}
</script>

<template>
  <div>
    <div class="d-flex align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Reports</h1>
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="flat" @click="generateCSV">
        <v-icon start>mdi-download</v-icon>
        Export CSV
      </v-btn>
    </div>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-h4">{{ overallStats.totalStudents }}</div>
            <div class="text-caption">Total Students</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="success" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-h4">{{ overallStats.attendanceRate }}%</div>
            <div class="text-caption">Attendance Rate</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-h4">{{ overallStats.totalBonus }}</div>
            <div class="text-caption">Total Bonus Points</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="error" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-h4">{{ overallStats.absentCount }}</div>
            <div class="text-caption">Total Absences</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-chart-bar</v-icon>
            Group Statistics
          </v-card-title>
          <v-card-text>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Students</th>
                  <th>Sessions</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="group in groupStats" :key="group.id">
                  <td>{{ group.name }}</td>
                  <td>{{ group.totalStudents }}</td>
                  <td>{{ group.totalSessions }}</td>
                  <td class="text-success">{{ group.presentCount }}</td>
                  <td class="text-error">{{ group.absentCount }}</td>
                  <td>
                    <v-chip
                      size="small"
                      :color="parseFloat(String(group.attendanceRate)) >= 80 ? 'success' : 'warning'"
                      variant="flat"
                    >
                      {{ group.attendanceRate }}%
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-star</v-icon>
            Top Performers by Bonus
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="(group, index) in groupStats"
                :key="group.id"
                class="mb-2"
              >
                <template v-slot:prepend>
                  <v-avatar size="32" color="primary">
                    {{ index + 1 }}
                  </v-avatar>
                </template>
                <v-list-item-title>{{ group.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    v-for="student in group.topStudents.slice(0, 2)"
                    :key="student.id"
                    size="x-small"
                    class="mr-1"
                    color="warning"
                    variant="flat"
                  >
                    {{ student.firstName }} {{ student.lastName }}: {{ student.totalBonus }}pts
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-6">
      <v-card-title>
        <v-icon start>mdi-calendar</v-icon>
        Session History
      </v-card-title>
      <v-card-text>
        <v-chip
          v-for="date in store.getAllSessions"
          :key="date"
          class="ma-1"
          color="primary"
          variant="outlined"
        >
          {{ date }}
        </v-chip>
        <div v-if="store.getAllSessions.length === 0" class="text-grey pa-4 text-center">
          No sessions recorded yet
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="exportDialog" max-width="600">
      <v-card>
        <v-card-title>Export Data (CSV)</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="exportData"
            rows="10"
            readonly
            variant="outlined"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="exportDialog = false">Close</v-btn>
          <v-btn color="primary" variant="flat" @click="copyToClipboard">Copy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
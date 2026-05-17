<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClassStore, type Student } from '../stores/classStore'
import { useI18n } from '../i18n'

const store = useClassStore()
const { t } = useI18n()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedGroup = ref<number | null>(1)
const selectedSubgroup = ref<number | null>(null)
const bonusDialog = ref(false)
const historyDialog = ref(false)
const historyDate = ref('')
const showHistorySheet = ref(false)
const saveConfirmDialog = ref(false)
const pendingChanges = ref(false)
const selectedStudentForBonus = ref<Student | null>(null)
const bonusForm = ref({ points: 0, reason: '' })
const saveCallback = ref<(() => void) | null>(null)

const groupOptions = computed(() => {
  return store.groups.map(g => ({ title: g.name, value: g.id }))
})

const groupSubgroups = computed(() => {
  if (!selectedGroup.value) return []
  return store.getSubgroupsByGroup(selectedGroup.value)
})

const studentsInGroup = computed(() => {
  if (!selectedGroup.value) return []
  return store.getStudentsByGroup(selectedGroup.value)
})

const filteredStudents = computed(() => {
  let students = studentsInGroup.value
  if (selectedSubgroup.value) {
    students = students.filter(s => s.subgroupId === selectedSubgroup.value)
  }
  return students
})

const getStudentStatus = (studentId: number) => {
  const record = store.attendanceRecords.find(
    r => r.studentId === studentId && r.date === selectedDate.value
  )
  return record?.status || null
}

const getHistoryStatus = (studentId: number, date: string) => {
  const record = store.attendanceRecords.find(
    r => r.studentId === studentId && r.date === date
  )
  return record?.status || null
}

const markAttendance = (studentId: number, status: 'present' | 'absent' | 'excused') => {
  store.addAttendance({
    studentId,
    date: selectedDate.value || '',
    status,
    notes: '',
  })
}

const markAllPresent = () => {
  filteredStudents.value.forEach(student => {
    store.addAttendance({
      studentId: student.id,
      date: selectedDate.value || '',
      status: 'present',
      notes: '',
    })
  })
}

const markAllAbsent = () => {
  filteredStudents.value.forEach(student => {
    store.addAttendance({
      studentId: student.id,
      date: selectedDate.value || '',
      status: 'absent',
      notes: '',
    })
  })
}

const addNewSession = () => {
  if (selectedDate.value && selectedGroup.value) {
    const existingSessions = store.getGroupSessions(selectedGroup.value)
    if (!existingSessions.includes(selectedDate.value)) {
      store.addSessionDate(selectedGroup.value, selectedDate.value)
    }
  }
}

const openHistorySheet = (date: string) => {
  historyDate.value = date
  showHistorySheet.value = true
}

const openBonusDialog = (student: Student) => {
  selectedStudentForBonus.value = student
  bonusForm.value = { points: 0, reason: '' }
  bonusDialog.value = true
}

const addBonus = () => {
  if (selectedStudentForBonus.value && bonusForm.value.points > 0) {
    store.addBonus({
      studentId: selectedStudentForBonus.value.id,
      date: selectedDate.value || '',
      points: bonusForm.value.points,
      reason: bonusForm.value.reason,
    })
    bonusDialog.value = false
  }
}

const statusCounts = computed(() => {
  const present = filteredStudents.value.filter(s => getStudentStatus(s.id) === 'present').length
  const absent = filteredStudents.value.filter(s => getStudentStatus(s.id) === 'absent').length
  const excused = filteredStudents.value.filter(s => getStudentStatus(s.id) === 'excused').length
  const notMarked = filteredStudents.value.length - present - absent - excused
  return { present, absent, excused, notMarked }
})

const historyStudents = computed(() => {
  if (!selectedGroup.value) return []
  return store.getStudentsByGroup(selectedGroup.value)
})

const groupSessions = computed(() => {
  if (!selectedGroup.value) return []
  return store.getGroupSessions(selectedGroup.value)
})
</script>

<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4 font-weight-bold">{{ t('attendance.title') }}</h1>
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="outlined" @click="historyDialog = true">
        <v-icon start>mdi-history</v-icon>
        {{ t('attendance.sessionHistory') }}
      </v-btn>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedGroup"
          :items="groupOptions"
          :label="t('attendance.selectGroup')"
          variant="outlined"
          density="compact"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedSubgroup"
          :items="[
            { title: 'All Subgroups', value: null },
            ...groupSubgroups.map(s => ({ title: s.name, value: s.id }))
          ]"
          :label="t('attendance.allSubgroups')"
          variant="outlined"
          density="compact"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="selectedDate"
          type="date"
          label="Session Date"
          variant="outlined"
          density="compact"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-btn color="primary" variant="flat" block @click="addNewSession" class="mt-1">
          <v-icon start>mdi-calendar-plus</v-icon>
          Add Session
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card color="success" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-h4">{{ statusCounts.present }}</div>
            <div class="text-caption">Present</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="error" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-h4">{{ statusCounts.absent }}</div>
            <div class="text-caption">Absent</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-h4">{{ statusCounts.excused }}</div>
            <div class="text-caption">Excused</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="grey" variant="tonal">
          <v-card-text class="text-center">
            <div class="text-h4">{{ statusCounts.notMarked }}</div>
            <div class="text-caption">Not Marked</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div class="d-flex mb-4 gap-2">
      <v-btn color="success" variant="outlined" @click="markAllPresent">
        <v-icon start>mdi-check-all</v-icon>
        Mark All Present
      </v-btn>
      <v-btn color="error" variant="outlined" @click="markAllAbsent">
        <v-icon start>mdi-close-circle</v-icon>
        Mark All Absent
      </v-btn>
    </div>

    <div v-if="filteredStudents.length === 0" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-account-off</v-icon>
      <div class="text-h6 text-grey mt-4">No students found</div>
      <div class="text-body-2 text-grey">Add subgroups and students in the Groups section first.</div>
    </div>

    <v-card v-else>
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-table</v-icon>
        Attendance Sheet - {{ selectedDate }}
      </v-card-title>
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>Subgroup</th>
              <th>Student #</th>
              <th>Name</th>
              <th>Status</th>
              <th>Quick Actions</th>
              <th>Bonus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id">
              <td>
                <v-chip size="small" color="primary" variant="flat">
                  {{ groupSubgroups.find(s => s.id === student.subgroupId)?.name || 'N/A' }}
                </v-chip>
              </td>
              <td>{{ student.studentNumber }}</td>
              <td>{{ student.firstName }} {{ student.lastName }}</td>
              <td>
                <v-chip
                  v-if="getStudentStatus(student.id)"
                  :color="
                    getStudentStatus(student.id) === 'present' ? 'success' :
                    getStudentStatus(student.id) === 'absent' ? 'error' : 'warning'
                  "
                  size="small"
                  variant="flat"
                >
                  {{ getStudentStatus(student.id) }}
                </v-chip>
                <span v-else class="text-grey">-</span>
              </td>
              <td>
                <v-btn-group density="compact">
                  <v-btn
                    size="x-small"
                    :color="getStudentStatus(student.id) === 'present' ? 'success' : 'grey'"
                    variant="flat"
                    @click="markAttendance(student.id, 'present')"
                  >
                    P
                  </v-btn>
                  <v-btn
                    size="x-small"
                    :color="getStudentStatus(student.id) === 'absent' ? 'error' : 'grey'"
                    variant="flat"
                    @click="markAttendance(student.id, 'absent')"
                  >
                    A
                  </v-btn>
                  <v-btn
                    size="x-small"
                    :color="getStudentStatus(student.id) === 'excused' ? 'warning' : 'grey'"
                    variant="flat"
                    @click="markAttendance(student.id, 'excused')"
                  >
                    E
                  </v-btn>
                </v-btn-group>
              </td>
              <td>
                <v-btn
                  size="small"
                  variant="text"
                  color="warning"
                  @click="openBonusDialog(student)"
                >
                  <v-icon start size="small">mdi-star</v-icon>
                  {{ store.getTotalBonus(student.id) }}
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="historyDialog" max-width="800">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-history</v-icon>
          Session History
        </v-card-title>
        <v-card-text>
          <div v-if="groupSessions.length === 0" class="text-center pa-4 text-grey">
            No sessions recorded for this group yet. Add a session by selecting a date and confirming.
          </div>
          <div v-else>
            <div class="text-subtitle-2 mb-3">Select a session to view attendance:</div>
            <v-chip
              v-for="date in groupSessions"
              :key="date"
              class="ma-1"
              color="primary"
              variant="outlined"
              @click="openHistorySheet(date)"
              style="cursor: pointer"
            >
              <v-icon start size="small">mdi-calendar</v-icon>
              {{ date }}
            </v-chip>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="historyDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showHistorySheet" max-width="900">
      <v-card v-if="historyDate">
        <v-card-title>
          <v-icon start>mdi-table</v-icon>
          Attendance Sheet - {{ historyDate }}
        </v-card-title>
        <v-card-text>
          <v-table v-if="historyStudents.length > 0">
            <thead>
              <tr>
                <th>Student #</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in historyStudents" :key="student.id">
                <td>{{ student.studentNumber }}</td>
                <td>{{ student.firstName }} {{ student.lastName }}</td>
                <td>
                  <v-chip
                    v-if="getHistoryStatus(student.id, historyDate)"
                    :color="
                      getHistoryStatus(student.id, historyDate) === 'present' ? 'success' :
                      getHistoryStatus(student.id, historyDate) === 'absent' ? 'error' : 'warning'
                    "
                    size="small"
                    variant="flat"
                  >
                    {{ getHistoryStatus(student.id, historyDate) }}
                  </v-chip>
                  <span v-else class="text-grey">Not marked</span>
                </td>
              </tr>
            </tbody>
          </v-table>
          <div v-else class="text-center pa-4 text-grey">
            No students in this group.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="historyDate = ''">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="bonusDialog" max-width="400">
      <v-card>
        <v-card-title>Add Bonus Points</v-card-title>
        <v-card-text v-if="selectedStudentForBonus">
          <div class="mb-3">
            <strong>Student:</strong> {{ selectedStudentForBonus.firstName }} {{ selectedStudentForBonus.lastName }}
          </div>
          <v-text-field
            v-model.number="bonusForm.points"
            type="number"
            label="Points"
            variant="outlined"
            class="mb-3"
          ></v-text-field>
          <v-text-field
            v-model="bonusForm.reason"
            label="Reason"
            variant="outlined"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="bonusDialog = false">Cancel</v-btn>
          <v-btn color="warning" variant="flat" @click="addBonus">Add Bonus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
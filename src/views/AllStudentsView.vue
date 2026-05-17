<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClassStore, type Student } from '../stores/classStore'
import * as XLSX from 'xlsx'

const store = useClassStore()

const searchQuery = ref('')
const sortBy = ref<'name' | 'code' | 'group' | 'finalNote'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')
const noteDialog = ref(false)
const exportDialog = ref(false)
const selectedStudent = ref<Student | null>(null)
const noteForm = ref<number | null>(null)

const availableFields = ref([
  { key: 'studentNumber', label: 'Code', selected: true },
  { key: 'firstName', label: 'First Name', selected: true },
  { key: 'lastName', label: 'Last Name', selected: true },
  { key: 'groupName', label: 'Group', selected: true },
  { key: 'subgroupName', label: 'Subgroup', selected: true },
  { key: 'absences', label: 'Absences', selected: true },
  { key: 'bonus', label: 'Bonus Points', selected: true },
  { key: 'finalNote', label: 'Final Note', selected: true },
])

interface StudentWithExtras extends Student {
  groupName: string
  subgroupName: string
  absences: number
  bonus: number
}

const allStudents = computed(() => {
  let students: StudentWithExtras[] = store.students.map(s => {
    const group = store.groups.find(g => g.id === s.groupId)
    const subgroup = store.subgroups.find(sub => sub.id === s.subgroupId)
    const attendance = store.getAttendanceByStudent(s.id)
    const absences = attendance.filter(a => a.status === 'absent').length
    const bonus = store.getTotalBonus(s.id)
    
    return {
      ...s,
      groupName: group?.name || '',
      subgroupName: subgroup?.name || '',
      absences,
      bonus,
    }
  })

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    students = students.filter(s => 
      s.firstName.toLowerCase().includes(query) ||
      s.lastName.toLowerCase().includes(query) ||
      s.studentNumber.toLowerCase().includes(query) ||
      s.groupName.toLowerCase().includes(query) ||
      s.subgroupName.toLowerCase().includes(query)
    )
  }

  students.sort((a, b) => {
    if (sortBy.value === 'name') {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
      return sortOrder.value === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    } else if (sortBy.value === 'code') {
      return sortOrder.value === 'asc' 
        ? a.studentNumber.localeCompare(b.studentNumber)
        : b.studentNumber.localeCompare(a.studentNumber)
    } else if (sortBy.value === 'group') {
      const groupA = a.groupName.toLowerCase()
      const groupB = b.groupName.toLowerCase()
      return sortOrder.value === 'asc' ? groupA.localeCompare(groupB) : groupB.localeCompare(groupA)
    } else if (sortBy.value === 'finalNote') {
      const noteA = a.finalNote ?? -1
      const noteB = b.finalNote ?? -1
      return sortOrder.value === 'asc' ? noteA - noteB : noteB - noteA
    }
    return 0
  })

  return students
})

const getNoteColor = (note: number | null) => {
  if (note === null) return 'grey'
  if (note >= 16) return 'success'
  if (note >= 10) return 'warning'
  return 'error'
}

const openNoteDialog = (student: Student) => {
  selectedStudent.value = student
  noteForm.value = student.finalNote
  noteDialog.value = true
}

const saveNote = () => {
  if (selectedStudent.value) {
    store.updateFinalNote(selectedStudent.value.id, noteForm.value)
    noteDialog.value = false
  }
}

const toggleSort = (column: 'name' | 'code') => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

const getStudentGroupInfo = (student: Student | null) => {
  if (!student) return { group: '', subgroup: '' }
  const group = store.groups.find(g => g.id === student.groupId)
  const subgroup = store.subgroups.find(s => s.id === student.subgroupId)
  return { 
    group: group?.name || '', 
    subgroup: subgroup?.name || '' 
  }
}

const getSortIcon = (column: 'name' | 'code') => {
  if (sortBy.value !== column) return 'mdi-sort'
  return sortOrder.value === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'
}

const selectAllFields = () => {
  availableFields.value.forEach(f => f.selected = true)
}

const deselectAllFields = () => {
  availableFields.value.forEach(f => f.selected = false)
}

const exportToExcel = () => {
  const selectedFields = availableFields.value.filter(f => f.selected)
  
  if (selectedFields.length === 0) {
    alert('Please select at least one field to export')
    return
  }

  const exportData = allStudents.value.map(student => {
    const row: Record<string, any> = {}
    selectedFields.forEach(field => {
      if (field.key === 'finalNote') {
        row[field.label] = student[field.key as keyof StudentWithExtras] ?? ''
      } else {
        row[field.label] = student[field.key as keyof StudentWithExtras]
      }
    })
    return row
  })

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Students')
  
  const date = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `students-export-${date}.xlsx`)
  
  exportDialog.value = false
}
</script>

<template>
  <div>
    <div class="d-flex align-center mb-6">
      <h1 class="text-h4 font-weight-bold">All Students</h1>
      <v-spacer></v-spacer>
      <v-chip color="primary" variant="flat" class="mr-2">
        {{ allStudents.length }} Students
      </v-chip>
      <v-btn color="success" variant="flat" @click="exportDialog = true">
        <v-icon start>mdi-file-export</v-icon>
        Export to Excel
      </v-btn>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search students..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center gap-2">
        <span class="text-subtitle-2 mr-2">Sort by:</span>
        <v-btn-toggle v-model="sortBy" density="compact" color="primary">
          <v-btn value="name" size="small">
            <v-icon start size="small">mdi-account</v-icon>
            Name
          </v-btn>
          <v-btn value="code" size="small">
            <v-icon start size="small">mdi-numeric</v-icon>
            Code
          </v-btn>
          <v-btn value="group" size="small">
            <v-icon start size="small">mdi-account-group</v-icon>
            Group
          </v-btn>
          <v-btn value="finalNote" size="small">
            <v-icon start size="small">mdi-school</v-icon>
            Note
          </v-btn>
        </v-btn-toggle>
        <v-btn icon size="small" variant="text" @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'">
          <v-icon>{{ getSortIcon(sortBy) }}</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <div v-if="allStudents.length === 0" class="text-center pa-8">
      <v-icon size="64" color="grey">mdi-account-off</v-icon>
      <div class="text-h6 text-grey mt-4">No students found</div>
      <div class="text-body-2 text-grey">Add students from the Groups section</div>
    </div>

    <v-card v-else>
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th class="cursor-pointer" @click="toggleSort('code')">
                <div class="d-flex align-center">
                  Code
                  <v-icon size="small" class="ml-1">{{ getSortIcon('code') }}</v-icon>
                </div>
              </th>
              <th class="cursor-pointer" @click="toggleSort('name')">
                <div class="d-flex align-center">
                  Name
                  <v-icon size="small" class="ml-1">{{ getSortIcon('name') }}</v-icon>
                </div>
              </th>
              <th>Group</th>
              <th>Subgroup</th>
              <th>Absences</th>
              <th>Bonus</th>
              <th>Final Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in allStudents" :key="student.id">
              <td>
                <v-chip size="small" variant="outlined">
                  {{ student.studentNumber }}
                </v-chip>
              </td>
              <td>
                <div class="font-weight-medium">
                  {{ student.firstName }} {{ student.lastName }}
                </div>
              </td>
              <td>
                <v-chip size="small" color="primary" variant="flat">
                  {{ student.groupName }}
                </v-chip>
              </td>
              <td>
                <v-chip size="small" color="secondary" variant="tonal">
                  {{ student.subgroupName }}
                </v-chip>
              </td>
              <td>
                <v-chip 
                  size="small" 
                  :color="student.absences > 3 ? 'error' : student.absences > 0 ? 'warning' : 'success'"
                  variant="flat"
                >
                  {{ student.absences }}
                </v-chip>
              </td>
              <td>
                <v-chip size="small" color="warning" variant="flat">
                  {{ student.bonus }} pts
                </v-chip>
              </td>
              <td>
                <v-chip
                  size="small"
                  :color="getNoteColor(student.finalNote)"
                  variant="flat"
                  @click="openNoteDialog(student)"
                  style="cursor: pointer"
                >
                  {{ student.finalNote ?? '-' }}
                </v-chip>
              </td>
              <td>
                <v-btn icon size="small" variant="text" color="primary" @click="openNoteDialog(student)">
                  <v-icon size="small">mdi-school</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="noteDialog" max-width="350">
      <v-card>
        <v-card-title>Edit Final Note</v-card-title>
        <v-card-text>
          <div class="mb-3 text-subtitle-2">
            Student: <strong>{{ selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : '' }}</strong>
          </div>
          <div class="mb-3 text-caption text-grey">
            Group: {{ getStudentGroupInfo(selectedStudent).group }} | Subgroup: {{ getStudentGroupInfo(selectedStudent).subgroup }}
          </div>
          <v-text-field
            v-model.number="noteForm"
            type="number"
            label="Final Note (0-20)"
            variant="outlined"
            min="0"
            max="20"
            step="0.5"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" color="error" @click="store.updateFinalNote(selectedStudent?.id ?? 0, null); noteDialog = false">
            Clear
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="noteDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveNote">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="exportDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon start color="success">mdi-file-export</v-icon>
          Export to Excel
        </v-card-title>
        <v-card-text>
          <div class="mb-3 text-subtitle-2">Select fields to export:</div>
          
          <div class="d-flex mb-3">
            <v-btn size="small" variant="text" @click="selectAllFields">Select All</v-btn>
            <v-btn size="small" variant="text" @click="deselectAllFields">Deselect All</v-btn>
          </div>

          <v-checkbox
            v-for="field in availableFields"
            :key="field.key"
            v-model="field.selected"
            :label="field.label"
            density="compact"
            hide-details
            class="mb-1"
          ></v-checkbox>

          <div class="text-caption text-grey mt-3">
            {{ availableFields.filter(f => f.selected).length }} field(s) selected
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="exportDialog = false">Cancel</v-btn>
          <v-btn color="success" variant="flat" @click="exportToExcel">
            <v-icon start>mdi-download</v-icon>
            Export
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
.gap-2 {
  gap: 8px;
}
</style>
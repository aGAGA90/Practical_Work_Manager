<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClassStore, type Student } from '../stores/classStore'

const route = useRoute()
const router = useRouter()
const store = useClassStore()

const groupId = computed(() => parseInt(route.params.groupId as string))
const group = computed(() => store.groups.find(g => g.id === groupId.value))

const selectedSubgroup = ref<number | null>(null)
const searchQuery = ref('')
const editDialog = ref(false)
const noteDialog = ref(false)
const addStudentDialog = ref(false)
const addSubgroupDialog = ref(false)
const selectedStudent = ref<Student | null>(null)
const studentForm = ref({ firstName: '', lastName: '', studentNumber: '' })
const noteForm = ref<number | null>(null)
const newSubgroupName = ref('')
const deleteDialog = ref(false)
const studentToDelete = ref<number | null>(null)

const confirmDelete = (studentId: number) => {
  studentToDelete.value = studentId
  deleteDialog.value = true
}

const deleteStudent = () => {
  if (studentToDelete.value !== null) {
    store.deleteStudent(studentToDelete.value)
    deleteDialog.value = false
    studentToDelete.value = null
  }
}

const groupSubgroups = computed(() => {
  return store.getSubgroupsByGroup(groupId.value)
})

const filteredStudents = computed(() => {
  if (!selectedSubgroup.value) {
    return store.getStudentsByGroup(groupId.value)
  }
  const students = store.getStudentsBySubgroup(selectedSubgroup.value)
  if (!searchQuery.value) return students
  const query = searchQuery.value.toLowerCase()
  return students.filter(s =>
    s.firstName.toLowerCase().includes(query) ||
    s.lastName.toLowerCase().includes(query) ||
    s.studentNumber.includes(query)
  )
})

const getFullName = (student: Student) => {
  return `${student.firstName} ${student.lastName}`.trim()
}

const openEditDialog = (student: Student) => {
  selectedStudent.value = { ...student }
  studentForm.value = { 
    firstName: student.firstName, 
    lastName: student.lastName, 
    studentNumber: student.studentNumber 
  }
  editDialog.value = true
}

const openNoteDialog = (student: Student) => {
  selectedStudent.value = { ...student }
  noteForm.value = student.finalNote
  noteDialog.value = true
}

const saveStudent = () => {
  if (selectedStudent.value) {
    selectedStudent.value.firstName = studentForm.value.firstName
    selectedStudent.value.lastName = studentForm.value.lastName
    selectedStudent.value.studentNumber = studentForm.value.studentNumber
    store.updateStudent(selectedStudent.value)
    editDialog.value = false
  }
}

const saveNote = () => {
  if (selectedStudent.value) {
    store.updateFinalNote(selectedStudent.value.id, noteForm.value)
    noteDialog.value = false
  }
}

const addStudent = () => {
  if (studentForm.value.firstName && studentForm.value.lastName && selectedSubgroup.value) {
    store.addStudent(
      groupId.value,
      selectedSubgroup.value,
      studentForm.value.firstName,
      studentForm.value.lastName,
      studentForm.value.studentNumber || ''
    )
    addStudentDialog.value = false
    studentForm.value = { firstName: '', lastName: '', studentNumber: '' }
  }
}

const addSubgroup = () => {
  const name = newSubgroupName.value.trim()
  store.addSubgroup(groupId.value, name)
  const newSubgroup = store.getSubgroupsByGroup(groupId.value).slice(-1)[0]
  if (newSubgroup) {
    selectedSubgroup.value = newSubgroup.id
    addStudentDialog.value = true
  }
  addSubgroupDialog.value = false
  newSubgroupName.value = ''
}

const removeSubgroup = (subgroupId: number) => {
  store.removeSubgroup(subgroupId)
  if (selectedSubgroup.value === subgroupId) {
    selectedSubgroup.value = null
  }
}

const goBack = () => {
  router.push('/groups')
}

const getNoteColor = (note: number | null) => {
  if (note === null) return 'grey'
  if (note >= 16) return 'success'
  if (note >= 10) return 'warning'
  return 'error'
}

onMounted(() => {
  if (!group.value) {
    goBack()
  }
})
</script>

<template>
  <div v-if="group">
    <div class="d-flex align-center mb-4">
      <v-btn icon variant="text" @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div class="ml-2">
        <h1 class="text-h5 font-weight-bold">{{ group.name }}</h1>
        <v-chip size="small" color="primary" variant="flat">
          {{ groupSubgroups.length }} Subgroups - {{ store.getGroupStudentCount(groupId) }} Students
        </v-chip>
      </div>
      <v-spacer></v-spacer>
      <v-btn color="success" variant="flat" @click="addSubgroupDialog = true">
        <v-icon start>mdi-plus</v-icon>
        Add Subgroup
      </v-btn>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-btn-toggle
          v-model="selectedSubgroup"
          color="primary"
          density="compact"
          clearable
        >
          <v-btn
            v-for="subgroup in groupSubgroups"
            :key="subgroup.id"
            :value="subgroup.id"
            size="small"
          >
            {{ subgroup.name }}
            <v-badge
              :content="store.getSubgroupStudentCount(subgroup.id)"
              color="success"
              inline
              class="ml-1"
            ></v-badge>
          </v-btn>
          <v-btn
            v-if="groupSubgroups.length === 0"
            value="null"
            size="small"
            disabled
          >
            No subgroups yet
          </v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search students"
          density="compact"
          variant="outlined"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <div v-if="groupSubgroups.length === 0" class="text-center pa-8 mb-4">
      <v-icon size="64" color="grey">mdi-account-group-outline</v-icon>
      <div class="text-h6 text-grey mt-4">No subgroups yet</div>
      <v-btn color="primary" class="mt-4" @click="addSubgroupDialog = true">
        <v-icon start>mdi-plus</v-icon>
        Add First Subgroup
      </v-btn>
    </div>

    <div v-else>
      <div class="d-flex align-center mb-2">
        <v-chip v-if="selectedSubgroup" size="small" color="primary" class="mr-2">
          {{ groupSubgroups.find(s => s.id === selectedSubgroup)?.name }}
        </v-chip>
        <span class="text-subtitle-2">
          {{ filteredStudents.length }} student(s)
        </span>
        <v-spacer></v-spacer>
        <v-btn
          v-if="selectedSubgroup"
          color="success"
          variant="outlined"
          size="small"
          @click="addStudentDialog = true"
        >
          <v-icon start>mdi-plus</v-icon>
          Add Student
        </v-btn>
      </div>

      <v-card>
        <v-card-text>
          <v-table v-if="filteredStudents.length > 0">
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Attendance</th>
                <th>Bonus</th>
                <th>Final Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(student, index) in filteredStudents" :key="student.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <v-text-field
                    v-model="student.studentNumber"
                    density="compact"
                    variant="plain"
                    hide-details
                    style="width: 80px"
                    @blur="store.updateStudent(student)"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="student.firstName"
                    density="compact"
                    variant="plain"
                    hide-details
                    style="width: 120px"
                    @blur="store.updateStudent(student)"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="student.lastName"
                    density="compact"
                    variant="plain"
                    hide-details
                    style="width: 120px"
                    @blur="store.updateStudent(student)"
                  ></v-text-field>
                </td>
                <td>
                  <v-chip
                    size="small"
                    :color="store.getAttendanceByStudent(student.id).filter(a => a.status === 'absent').length > 5 ? 'error' : 'success'"
                    variant="flat"
                  >
                    {{ store.getAttendanceByStudent(student.id).filter(a => a.status === 'present').length }}/{{ store.getAllSessions().length || 0 }}
                  </v-chip>
                </td>
                <td>
                  <v-chip size="small" color="warning" variant="flat">
                    {{ store.getTotalBonus(student.id) }} pts
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
                  <v-btn icon size="small" variant="text" color="error" @click="confirmDelete(student.id)">
                    <v-icon size="small">mdi-delete</v-icon>
                  </v-btn>
                  <v-btn icon size="small" variant="text" @click="openEditDialog(student)">
                    <v-icon size="small">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="small" variant="text" color="primary" @click="openNoteDialog(student)">
                    <v-icon size="small">mdi-school</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>

          <div v-else class="text-center pa-4 text-grey">
            No students in this subgroup. Click "Add Student" to add one.
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-dialog v-model="editDialog" max-width="400">
      <v-card>
        <v-card-title>Edit Student</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="studentForm.firstName"
            label="First Name"
            variant="outlined"
            class="mb-3"
          ></v-text-field>
          <v-text-field
            v-model="studentForm.lastName"
            label="Last Name"
            variant="outlined"
            class="mb-3"
          ></v-text-field>
          <v-text-field
            v-model="studentForm.studentNumber"
            label="Student Code"
            variant="outlined"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveStudent">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="noteDialog" max-width="350">
      <v-card>
        <v-card-title>Final Note</v-card-title>
        <v-card-text>
          <div class="mb-3 text-subtitle-2">
            Student: <strong>{{ selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : '' }}</strong>
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

    <v-dialog v-model="addStudentDialog" max-width="400">
      <v-card>
        <v-card-title>Add Student</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="studentForm.firstName"
            label="First Name *"
            variant="outlined"
            class="mb-3"
          ></v-text-field>
          <v-text-field
            v-model="studentForm.lastName"
            label="Last Name *"
            variant="outlined"
            class="mb-3"
          ></v-text-field>
          <v-text-field
            v-model="studentForm.studentNumber"
            label="Student Code (optional)"
            variant="outlined"
          ></v-text-field>
          <div class="text-caption text-grey mt-2">* First Name and Last Name are required</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="addStudentDialog = false">Cancel</v-btn>
          <v-btn 
            color="success" 
            variant="flat" 
            @click="addStudent"
            :disabled="!studentForm.firstName || !studentForm.lastName"
          >Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addSubgroupDialog" max-width="350">
      <v-card>
        <v-card-title>Add Subgroup</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newSubgroupName"
            label="Subgroup Name (leave empty for auto)"
            variant="outlined"
            :placeholder="`Groupe ${groupSubgroups.length + 1}`"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="addSubgroupDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="addSubgroup">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="350">
      <v-card>
        <v-card-title class="text-error">
          <v-icon start color="error">mdi-delete</v-icon>
          Delete Student
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this student? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deleteStudent">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
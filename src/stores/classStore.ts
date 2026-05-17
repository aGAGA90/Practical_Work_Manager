import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Student {
  id: number
  firstName: string
  lastName: string
  studentNumber: string
  groupId: number
  subgroupId: number
  finalNote: number | null
}

export interface AttendanceRecord {
  id: number
  studentId: number
  date: string
  status: 'present' | 'absent' | 'excused'
  notes: string
}

export interface BonusRecord {
  id: number
  studentId: number
  date: string
  points: number
  reason: string
}

export interface Group {
  id: number
  name: string
  description: string
}

export interface GroupSession {
  id: number
  groupId: number
  date: string
}

export interface Subgroup {
  id: number
  groupId: number
  name: string
}

export const useClassStore = defineStore('class', () => {
  const groups = ref<Group[]>([
    { id: 1, name: 'A', description: '' },
    { id: 2, name: 'B', description: '' },
    { id: 3, name: 'C', description: '' },
    { id: 4, name: 'D', description: '' },
    { id: 5, name: 'E', description: '' },
    { id: 6, name: 'F', description: '' },
    { id: 7, name: 'G', description: '' },
    { id: 8, name: 'H', description: '' },
  ])

  const numberOfSessions = ref(12)
  const professorName = ref('')
  const professorPhoto = ref('')
  const moduleName = ref('')

  const subgroups = ref<Subgroup[]>([])
  const students = ref<Student[]>([])
  const attendanceRecords = ref<AttendanceRecord[]>([])
  const bonusRecords = ref<BonusRecord[]>([])
  const groupSessions = ref<GroupSession[]>([])

  let studentIdCounter = ref(1)

  const loadFromStorage = () => {
    const savedStudents = localStorage.getItem('students')
    const savedAttendance = localStorage.getItem('attendance')
    const savedBonus = localStorage.getItem('bonus')
    const savedGroupSessions = localStorage.getItem('groupSessions')
    const savedSubgroups = localStorage.getItem('subgroups')
    const savedNumberOfSessions = localStorage.getItem('numberOfSessions')
    const savedProfessorName = localStorage.getItem('professorName')
    const savedProfessorPhoto = localStorage.getItem('professorPhoto')

    if (savedStudents) {
      students.value = JSON.parse(savedStudents)
      const maxId = Math.max(...students.value.map(s => s.id), 0)
      studentIdCounter.value = maxId + 1
    }
    if (savedAttendance) attendanceRecords.value = JSON.parse(savedAttendance)
    if (savedBonus) bonusRecords.value = JSON.parse(savedBonus)
    if (savedGroupSessions) groupSessions.value = JSON.parse(savedGroupSessions)
    if (savedSubgroups) subgroups.value = JSON.parse(savedSubgroups)
    if (savedNumberOfSessions) numberOfSessions.value = parseInt(savedNumberOfSessions)
    if (savedProfessorName) professorName.value = savedProfessorName
    if (savedProfessorPhoto) professorPhoto.value = savedProfessorPhoto
    if (savedProfessorPhoto) professorPhoto.value = savedProfessorPhoto
    const savedModuleName = localStorage.getItem('moduleName')
    if (savedModuleName) moduleName.value = savedModuleName
  }

  loadFromStorage()

  const saveToStorage = () => {
    localStorage.setItem('students', JSON.stringify(students.value))
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords.value))
    localStorage.setItem('bonus', JSON.stringify(bonusRecords.value))
    localStorage.setItem('groupSessions', JSON.stringify(groupSessions.value))
    localStorage.setItem('subgroups', JSON.stringify(subgroups.value))
    localStorage.setItem('numberOfSessions', numberOfSessions.value.toString())
    localStorage.setItem('professorName', professorName.value)
    localStorage.setItem('professorPhoto', professorPhoto.value)
    localStorage.setItem('moduleName', moduleName.value)
  }

  const getSubgroupsByGroup = (groupId: number) => {
    return subgroups.value.filter(s => s.groupId === groupId)
  }

  const addSubgroup = (groupId: number, name: string) => {
    const existingInGroup = getSubgroupsByGroup(groupId)
    const newId = Date.now()
    subgroups.value.push({
      id: newId,
      groupId,
      name: name || `Groupe ${existingInGroup.length + 1}`,
    })
    saveToStorage()
  }

  const removeSubgroup = (subgroupId: number) => {
    const subgroup = subgroups.value.find(s => s.id === subgroupId)
    if (subgroup) {
      students.value
        .filter(s => s.subgroupId === subgroupId)
        .forEach(s => deleteStudent(s.id))
      subgroups.value = subgroups.value.filter(s => s.id !== subgroupId)
      saveToStorage()
    }
  }

  const addStudent = (groupId: number, subgroupId: number, firstName: string, lastName: string, studentNumber: string) => {
    students.value.push({
      id: studentIdCounter.value++,
      firstName,
      lastName,
      studentNumber,
      groupId,
      subgroupId,
      finalNote: null,
    })
    saveToStorage()
  }

  const deleteStudent = (studentId: number) => {
    students.value = students.value.filter(s => s.id !== studentId)
    attendanceRecords.value = attendanceRecords.value.filter(r => r.studentId !== studentId)
    bonusRecords.value = bonusRecords.value.filter(b => b.studentId !== studentId)
    saveToStorage()
  }

  const updateStudent = (student: Student) => {
    const index = students.value.findIndex(s => s.id === student.id)
    if (index !== -1) {
      students.value[index] = student
      saveToStorage()
    }
  }

  const getStudentFullName = (student: Student): string => {
    return `${student.firstName} ${student.lastName}`.trim()
  }

  const updateFinalNote = (studentId: number, note: number | null) => {
    const student = students.value.find(s => s.id === studentId)
    if (student) {
      student.finalNote = note
      saveToStorage()
    }
  }

  const getStudentsByGroup = (groupId: number) => {
    return students.value.filter(s => s.groupId === groupId)
  }

  const getStudentsBySubgroup = (subgroupId: number) => {
    return students.value.filter(s => s.subgroupId === subgroupId)
  }

  const getGroupStudentCount = (groupId: number) => {
    return students.value.filter(s => s.groupId === groupId).length
  }

  const getSubgroupStudentCount = (subgroupId: number) => {
    return students.value.filter(s => s.subgroupId === subgroupId).length
  }

  const addAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    const existing = attendanceRecords.value.find(
      r => r.studentId === record.studentId && r.date === record.date
    )
    if (existing) {
      existing.status = record.status
      existing.notes = record.notes
    } else {
      attendanceRecords.value.push({
        id: Date.now(),
        ...record,
      })
    }
    saveToStorage()
  }

  const getAttendanceByDate = (date: string) => {
    return attendanceRecords.value.filter(r => r.date === date)
  }

  const getAttendanceByStudent = (studentId: number) => {
    return attendanceRecords.value.filter(r => r.studentId === studentId)
  }

  const addBonus = (record: Omit<BonusRecord, 'id'>) => {
    bonusRecords.value.push({
      id: Date.now(),
      ...record,
    })
    saveToStorage()
  }

  const getBonusesByStudent = (studentId: number) => {
    return bonusRecords.value.filter(b => b.studentId === studentId)
  }

  const getTotalBonus = (studentId: number) => {
    return bonusRecords.value
      .filter(b => b.studentId === studentId)
      .reduce((sum, b) => sum + b.points, 0)
  }

  const addSessionDate = (groupId: number, date: string) => {
    const existing = groupSessions.value.find(s => s.groupId === groupId && s.date === date)
    if (!existing) {
      groupSessions.value.push({
        id: Date.now(),
        groupId,
        date,
      })
      saveToStorage()
    }
  }

  const getGroupSessions = (groupId: number) => {
    return groupSessions.value.filter(s => s.groupId === groupId).map(s => s.date)
  }

  const getAllSessions = () => {
    return [...new Set(groupSessions.value.map(s => s.date))].sort()
  }

  const getGroupStats = (groupId: number) => {
    const groupStudents = getStudentsByGroup(groupId)
    const sessions = getGroupSessions(groupId)
    let totalPresent = 0
    let totalAbsent = 0

    groupStudents.forEach(student => {
      const attendance = getAttendanceByStudent(student.id)
      sessions.forEach(date => {
        const record = attendance.find(a => a.date === date)
        if (record) {
          if (record.status === 'present') totalPresent++
          else if (record.status === 'absent') totalAbsent++
        }
      })
    })

    return { totalPresent, totalAbsent, sessions: sessions.length }
  }

  const clearAllData = () => {
    students.value = []
    attendanceRecords.value = []
    bonusRecords.value = []
    groupSessions.value = []
    subgroups.value = []
    studentIdCounter.value = 1
    localStorage.clear()
  }

  const exportBackup = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      subgroups: subgroups.value,
      students: students.value,
      attendanceRecords: attendanceRecords.value,
      bonusRecords: bonusRecords.value,
      groupSessions: groupSessions.value,
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `class-manager-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importBackup = (data: any) => {
    if (data && data.students) {
      subgroups.value = data.subgroups || []
      students.value = data.students
      attendanceRecords.value = data.attendanceRecords || []
      bonusRecords.value = data.bonusRecords || []
      groupSessions.value = data.groupSessions || []
      const maxId = Math.max(...students.value.map(s => s.id), 0)
      studentIdCounter.value = maxId + 1
      saveToStorage()
      return true
    }
    return false
  }

  const setNumberOfSessions = (num: number) => {
    numberOfSessions.value = num
    saveToStorage()
  }

  const setProfessor = (name: string, photo: string, module: string) => {
    professorName.value = name
    professorPhoto.value = photo
    moduleName.value = module
    saveToStorage()
  }

  return {
    groups,
    numberOfSessions,
    professorName,
    professorPhoto,
    moduleName,
    setNumberOfSessions,
    setProfessor,
    subgroups,
    students,
    attendanceRecords,
    bonusRecords,
    getSubgroupsByGroup,
    addSubgroup,
    removeSubgroup,
    addStudent,
    deleteStudent,
    updateStudent,
    updateFinalNote,
    getStudentsByGroup,
    getStudentsBySubgroup,
    getGroupStudentCount,
    getSubgroupStudentCount,
    addAttendance,
    getAttendanceByDate,
    getAttendanceByStudent,
    addBonus,
    getBonusesByStudent,
    getTotalBonus,
    addSessionDate,
    getGroupSessions,
    getAllSessions,
    getGroupStats,
    saveToStorage,
    clearAllData,
    exportBackup,
    importBackup,
  }
})
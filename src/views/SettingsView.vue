<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import { useClassStore } from '../stores/classStore'
import { isDarkMode } from '../main'

const theme = useTheme()
const store = useClassStore()

const onThemeChange = (value: boolean | null) => {
  const newValue = value ?? false
  isDarkMode.value = newValue
  theme.global.name.value = newValue ? 'dark' : 'light'
  localStorage.setItem('theme', newValue ? 'dark' : 'light')
}

const editSessionsDialog = ref(false)
const sessionsForm = ref(12)
const backupDialog = ref(false)
const restoreDialog = ref(false)
const professorDialog = ref(false)
const professorForm = ref({ name: '', photo: '', module: '' })

const openSessionsEdit = () => {
  sessionsForm.value = store.numberOfSessions
  editSessionsDialog.value = true
}

const saveSessions = () => {
  store.setNumberOfSessions(sessionsForm.value)
  editSessionsDialog.value = false
}

const openProfessorEdit = () => {
  professorForm.value = {
    name: store.professorName,
    photo: store.professorPhoto,
    module: store.moduleName
  }
  professorDialog.value = true
}

const saveProfessor = () => {
  store.setProfessor(professorForm.value.name, professorForm.value.photo, professorForm.value.module)
  professorDialog.value = false
}

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      professorForm.value.photo = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const createBackup = () => {
  store.exportBackup()
  backupDialog.value = false
}

const handleRestoreFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const success = store.importBackup(data)
        if (success) {
          restoreDialog.value = false
          window.location.reload()
        } else {
          alert('Invalid backup file format')
        }
      } catch {
        alert('Error reading backup file')
      }
    }
    reader.readAsText(file)
  }
}
</script>

<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Settings</h1>

    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon start>mdi-cog</v-icon>
            General Settings
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon :color="isDarkMode ? 'yellow' : 'grey'">
                    {{ isDarkMode ? 'mdi-weather-night' : 'mdi-weather-sunny' }}
                  </v-icon>
                </template>
                <v-list-item-title>Dark Mode</v-list-item-title>
                <v-list-item-subtitle>Enable dark theme</v-list-item-subtitle>
                <template v-slot:append>
                  <v-switch
                    :model-value="isDarkMode"
                    color="primary"
                    hide-details
                    @update:model-value="onThemeChange"
                  ></v-switch>
                </template>
              </v-list-item>

              <v-divider class="my-2"></v-divider>

              <v-list-item @click="openSessionsEdit" style="cursor: pointer">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-calendar-clock</v-icon>
                </template>
                <v-list-item-title>Number of Sessions</v-list-item-title>
                <v-list-item-subtitle>Total sessions for progress calculation</v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip color="primary" variant="flat">
                    {{ store.numberOfSessions }}
                  </v-chip>
                </template>
              </v-list-item>

              <v-divider class="my-2"></v-divider>

              <v-list-item @click="openProfessorEdit" style="cursor: pointer">
                <template v-slot:prepend>
                  <v-avatar size="32">
                    <v-img v-if="store.professorPhoto" :src="store.professorPhoto"></v-img>
                    <v-icon v-else>mdi-account</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>Professor Profile</v-list-item-title>
                <v-list-item-subtitle>{{ store.professorName || 'Set your name and photo' }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-icon color="primary">mdi-pencil</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-backup-restore</v-icon>
            Backup & Restore
          </v-card-title>
          <v-card-text>
            <div class="d-flex flex-column" style="gap: 16px;">
              <v-btn color="success" variant="flat" block @click="backupDialog = true">
                <v-icon start>mdi-download</v-icon>
                Export Backup
              </v-btn>
              <v-btn color="primary" variant="outlined" block @click="restoreDialog = true">
                <v-icon start>mdi-upload</v-icon>
                Restore Backup
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="editSessionsDialog" max-width="350">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-calendar-clock</v-icon>
          Number of Sessions
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model.number="sessionsForm"
            label="Total Sessions"
            type="number"
            variant="outlined"
            min="1"
            max="50"
          ></v-text-field>
          <div class="text-caption text-grey">
            Progress = (Added Sessions / Total Sessions) × 100
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editSessionsDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveSessions">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="backupDialog" max-width="400">
      <v-card>
        <v-card-title>
          <v-icon start color="success">mdi-backup-restore</v-icon>
          Create Backup
        </v-card-title>
        <v-card-text>
          This will download a JSON file containing all your data.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="backupDialog = false">Cancel</v-btn>
          <v-btn color="success" variant="flat" @click="createBackup">Download</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="restoreDialog" max-width="400">
      <v-card>
        <v-card-title class="text-error">
          <v-icon start color="error">mdi-restore</v-icon>
          Restore from Backup
        </v-card-title>
        <v-card-text>
          <div class="mb-3 text-warning">
            <v-icon color="warning" size="small">mdi-alert</v-icon>
            Warning: This will replace ALL current data!
          </div>
          <v-file-input
            label="Select backup file"
            variant="outlined"
            accept=".json"
            @change="handleRestoreFile"
          ></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="restoreDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="professorDialog" max-width="400">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-account</v-icon>
          Professor Profile
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="professorForm.name"
            label="Professor Name"
            variant="outlined"
            class="mb-3"
          ></v-text-field>
          <v-text-field
            v-model="professorForm.module"
            label="Module Name"
            variant="outlined"
            class="mb-3"
          ></v-text-field>
          <v-file-input
            label="Upload Photo"
            variant="outlined"
            accept="image/*"
            prepend-icon="mdi-camera"
            @change="handlePhotoUpload"
          ></v-file-input>
          <div v-if="professorForm.photo" class="text-center mt-3">
            <v-avatar size="80">
              <v-img :src="professorForm.photo"></v-img>
            </v-avatar>
          </div>
          <div v-if="professorForm.photo" class="text-center mt-2">
            <v-btn size="small" variant="text" color="error" @click="professorForm.photo = ''">
              Remove Photo
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="professorDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveProfessor">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
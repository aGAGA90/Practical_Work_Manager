<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClassStore } from '../stores/classStore'
import { useI18n } from '../i18n'

const store = useClassStore()
const router = useRouter()
const { t } = useI18n()
const resetDialog = ref(false)

const viewGroup = (groupId: number) => {
  router.push(`/groups/${groupId}`)
}

const resetAllData = () => {
  store.clearAllData()
  resetDialog.value = false
  window.location.reload()
}

const confirmReset = () => {
  resetDialog.value = true
}
</script>

<template>
  <div>
    <div class="d-flex align-center mb-6">
      <h1 class="text-h4 font-weight-bold">{{ t('groups.title') }}</h1>
      <v-spacer></v-spacer>
      <v-btn color="error" variant="outlined" size="small" @click="resetDialog = true" class="mr-2">
        <v-icon start>mdi-delete-sweep</v-icon>
        {{ t('groups.reset') }}
      </v-btn>
      <v-chip color="primary" variant="flat">
        {{ store.groups.length }} {{ t('dashboard.groups') }}
      </v-chip>
    </div>

    <v-row>
      <v-col
        v-for="group in store.groups"
        :key="group.id"
        cols="3"
      >
        <v-card
          class="cursor-pointer"
          @click="viewGroup(group.id)"
          hover
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" size="48">
                <v-icon>mdi-account-group</v-icon>
              </v-avatar>
            </template>
            <v-card-title>{{ group.name }}</v-card-title>
            <v-card-subtitle>
              {{ store.getSubgroupsByGroup(group.id).length }} {{ t('groups.subgroups') }}
            </v-card-subtitle>
          </v-card-item>

          <v-divider></v-divider>

          <v-card-text>
            <v-row dense>
              <v-col cols="6">
                <div class="text-caption text-grey">{{ t('groups.subgroups') }}</div>
                <div class="text-h6">{{ store.getSubgroupsByGroup(group.id).length }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">{{ t('dashboard.students') }}</div>
                <div class="text-h6">{{ store.getGroupStudentCount(group.id) }}</div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-chip size="small" color="primary" variant="outlined">
              {{ store.getGroupStudentCount(group.id) }} {{ t('groups.students') }}
            </v-chip>
            <v-spacer></v-spacer>
            <v-icon color="primary">mdi-arrow-right</v-icon>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="resetDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 text-error">
          <v-icon start color="error">mdi-warning</v-icon>
          {{ t('groups.resetConfirm') }}
        </v-card-title>
        <v-card-text>
          {{ t('groups.resetWarning') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="resetDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" @click="resetAllData">{{ t('groups.reset') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { isDarkMode } from './main'
import { useClassStore } from './stores/classStore'
import { useI18n } from './i18n'

const route = useRoute()
const theme = useTheme()
const store = useClassStore()
const { t } = useI18n()

const drawer = ref(true)

const navItems = computed(() => [
  { title: t('nav.dashboard'), icon: 'mdi-view-dashboard', to: '/' },
  { title: t('nav.groups'), icon: 'mdi-account-group', to: '/groups' },
  { title: t('nav.students'), icon: 'mdi-account-multiple', to: '/students' },
  { title: t('nav.attendance'), icon: 'mdi-calendar-check', to: '/attendance' },
  { title: t('nav.reports'), icon: 'mdi-chart-bar', to: '/reports' },
  { title: 'Settings', icon: 'mdi-cog', to: '/settings' },
])

watch(isDarkMode, (newVal) => {
  theme.global.name.value = newVal ? 'dark' : 'light'
}, { immediate: true })
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" permanent color="primary" width="250">
      <div v-if="store.professorName || store.professorPhoto || store.moduleName" class="pa-4 text-center" style="background: rgba(255,255,255,0.1);">
        <v-avatar size="64" class="mb-2">
          <v-img v-if="store.professorPhoto" :src="store.professorPhoto"></v-img>
          <v-icon v-else size="32">mdi-account</v-icon>
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold">{{ store.professorName || 'Professor' }}</div>
        <div v-if="store.moduleName" class="text-caption mt-1">{{ store.moduleName }}</div>
      </div>
      <v-list-item v-else class="pa-4">
        <v-list-item-title class="text-h6 font-weight-bold">
          Class Manager
        </v-list-item-title>
        <v-list-item-subtitle>
          Practical Work Groups
        </v-list-item-subtitle>
      </v-list-item>

      <v-divider v-if="store.professorName || store.professorPhoto"></v-divider>

      <v-list-item v-if="store.professorName || store.professorPhoto" class="pa-4">
        <v-list-item-title class="text-h6 font-weight-bold">
          Class Manager
        </v-list-item-title>
        <v-list-item-subtitle>
          Practical Work Groups
        </v-list-item-subtitle>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :active="route.path === item.to"
          color="white"
          class="my-1"
        >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="primary" density="compact">
      <v-app-bar-title>Class Group Management</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-chip color="white" variant="flat" size="small">
        <v-icon start>mdi-calendar</v-icon>
        {{ new Date().toLocaleDateString() }}
      </v-chip>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
html, body {
  overflow-y: auto !important;
}
</style>
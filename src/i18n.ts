import { ref, computed } from 'vue'

type TranslationKey = string

const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.groups': 'Groups',
    'nav.students': 'All Students',
    'nav.attendance': 'Attendance',
    'nav.reports': 'Reports',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.groups': 'Groups',
    'dashboard.students': 'Total Students',
    'dashboard.sessions': 'TP Sessions',
    'dashboard.absences': 'Total Absences',
    'dashboard.progress': 'Group Progress (Attendance)',
    'dashboard.overview': 'Group Overview',
    'dashboard.quickStats': 'Quick Stats',
    'dashboard.bonus': 'Total Bonus Points',
    'dashboard.present': 'Present Today',
    'dashboard.recorded': 'sessions recorded',
    
    // Groups
    'groups.title': 'Groups',
    'groups.subgroups': 'subgroups',
    'groups.students': 'students',
    'groups.reset': 'Reset All Data',
    'groups.resetConfirm': 'Reset All Data?',
    'groups.resetWarning': 'This will delete all students, subgroups, attendance records, and bonuses. This action cannot be undone.',
    
    // Group Detail
    'group.addSubgroup': 'Add Subgroup',
    'group.noSubgroups': 'No subgroups yet',
    'group.addFirst': 'Add First Subgroup',
    'group.subgroup': 'Subgroup',
    'group.student': 'Student',
    'group.addStudent': 'Add Student',
    'group.noStudents': 'No students in this subgroup. Click "Add Student" to add one.',
    'group.importStudents': 'Import Students',
    
    // Attendance
    'attendance.title': 'Attendance',
    'attendance.selectGroup': 'Select Group',
    'attendance.allSubgroups': 'All Subgroups',
    'attendance.sessionDate': 'Session Date',
    'attendance.addSession': 'Add Session',
    'attendance.sessionHistory': 'Session History',
    'attendance.present': 'Present',
    'attendance.absent': 'Absent',
    'attendance.excused': 'Excused',
    'attendance.notMarked': 'Not Marked',
    'attendance.markAllPresent': 'Mark All Present',
    'attendance.markAllAbsent': 'Mark All Absent',
    'attendance.noStudents': 'No students found',
    'attendance.noSubgroups': 'Add subgroups and students in the Groups section first.',
    'attendance.noSessions': 'No sessions recorded for this group yet.',
    'attendance.selectSession': 'Select a session to view attendance:',
    'attendance.addBonus': 'Add Bonus Points',
    'attendance.points': 'Points',
    'attendance.reason': 'Reason',
    
    // All Students
    'students.title': 'All Students',
    'students.search': 'Search students...',
    'students.sortBy': 'Sort by:',
    'students.name': 'Name',
    'students.code': 'Code',
    'students.export': 'Export to Excel',
    'students.selectFields': 'Select fields to export:',
    'students.selectAll': 'Select All',
    'students.deselectAll': 'Deselect All',
    'students.noStudents': 'No students found',
    'students.addFromGroups': 'Add students from the Groups section',
    'students.editNote': 'Edit Final Note',
    'students.absences': 'Absences',
    'students.bonus': 'Bonus Points',
    'students.finalNote': 'Final Note',
    
    // Reports
    'reports.title': 'Reports',
    'reports.exportCSV': 'Export CSV',
    'reports.totalStudents': 'Total Students',
    'reports.attendanceRate': 'Attendance Rate',
    'reports.totalBonus': 'Total Bonus Points',
    'reports.totalAbsences': 'Total Absences',
    'reports.groupStats': 'Group Statistics',
    'reports.topPerformers': 'Top Performers by Bonus',
    'reports.sessionHistory': 'Session History',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.darkMode': 'Dark Mode',
    'settings.darkModeDesc': 'Toggle between light and dark theme',
    'settings.backup': 'Backup',
    'settings.backupDesc': 'Export all data to a file',
    'settings.restore': 'Restore',
    'settings.restoreDesc': 'Import data from a backup file',
    'settings.restoreWarning': 'Warning: This will replace ALL current data!',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.clear': 'Clear',
    'common.view': 'View',
    'common.required': 'Required fields',
    'common.noData': 'No data available',
  },
  
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.groups': 'Groupes',
    'nav.students': 'Tous les étudiants',
    'nav.attendance': 'Présence',
    'nav.reports': 'Rapports',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.groups': 'Groupes',
    'dashboard.students': 'Total étudiants',
    'dashboard.sessions': 'Séances TP',
    'dashboard.absences': 'Total absences',
    'dashboard.progress': 'Progression des groupes (Présence)',
    'dashboard.overview': 'Aperçu des groupes',
    'dashboard.quickStats': 'Statistiques rapides',
    'dashboard.bonus': 'Total des points bonus',
    'dashboard.present': 'Présents aujourd\'hui',
    'dashboard.recorded': 'séances enregistrées',
    
    // Groups
    'groups.title': 'Groupes',
    'groups.subgroups': 'sous-groupes',
    'groups.students': 'étudiants',
    'groups.reset': 'Réinitialiser les données',
    'groups.resetConfirm': 'Réinitialiser toutes les données?',
    'groups.resetWarning': 'Cela supprimera tous les étudiants, sous-groupes, présences et bonus. Cette action est irréversible.',
    
    // Group Detail
    'group.addSubgroup': 'Ajouter sous-groupe',
    'group.noSubgroups': 'Pas encore de sous-groupes',
    'group.addFirst': 'Ajouter le premier sous-groupe',
    'group.subgroup': 'Sous-groupe',
    'group.student': 'Étudiant',
    'group.addStudent': 'Ajouter étudiant',
    'group.noStudents': 'Pas d\'étudiants dans ce sous-groupe. Cliquez sur "Ajouter étudiant" pour en ajouter.',
    'group.importStudents': 'Importer étudiants',
    
    // Attendance
    'attendance.title': 'Présence',
    'attendance.selectGroup': 'Sélectionner groupe',
    'attendance.allSubgroups': 'Tous sous-groupes',
    'attendance.sessionDate': 'Date de la séance',
    'attendance.addSession': 'Ajouter séance',
    'attendance.sessionHistory': 'Historique des séances',
    'attendance.present': 'Présent',
    'attendance.absent': 'Absent',
    'attendance.excused': 'Excusé',
    'attendance.notMarked': 'Non marqué',
    'attendance.markAllPresent': 'Marquer tous présents',
    'attendance.markAllAbsent': 'Marquer tous absents',
    'attendance.noStudents': 'Aucun étudiant trouvé',
    'attendance.noSubgroups': 'Ajoutez des sous-groupes et étudiants dans la section Groupes d\'abord.',
    'attendance.noSessions': 'Aucune séance enregistrée pour ce groupe.',
    'attendance.selectSession': 'Sélectionnez une séance pour voir les présences:',
    'attendance.addBonus': 'Ajouter points bonus',
    'attendance.points': 'Points',
    'attendance.reason': 'Raison',
    
    // All Students
    'students.title': 'Tous les étudiants',
    'students.search': 'Rechercher étudiants...',
    'students.sortBy': 'Trier par:',
    'students.name': 'Nom',
    'students.code': 'Code',
    'students.export': 'Exporter vers Excel',
    'students.selectFields': 'Sélectionner les champs à exporter:',
    'students.selectAll': 'Tout sélectionner',
    'students.deselectAll': 'Tout désélectionner',
    'students.noStudents': 'Aucun étudiant trouvé',
    'students.addFromGroups': 'Ajoutez des étudiants depuis la section Groupes',
    'students.editNote': 'Modifier la note finale',
    'students.absences': 'Absences',
    'students.bonus': 'Points bonus',
    'students.finalNote': 'Note finale',
    
    // Reports
    'reports.title': 'Rapports',
    'reports.exportCSV': 'Exporter CSV',
    'reports.totalStudents': 'Total étudiants',
    'reports.attendanceRate': 'Taux de présence',
    'reports.totalBonus': 'Total points bonus',
    'reports.totalAbsences': 'Total absences',
    'reports.groupStats': 'Statistiques des groupes',
    'reports.topPerformers': 'Meilleurs performers par bonus',
    'reports.sessionHistory': 'Historique des séances',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.language': 'Langue',
    'settings.darkMode': 'Mode sombre',
    'settings.darkModeDesc': 'Basculer entre thème clair et sombre',
    'settings.backup': 'Sauvegarde',
    'settings.backupDesc': 'Exporter toutes les données vers un fichier',
    'settings.restore': 'Restaurer',
    'settings.restoreDesc': 'Importer les données depuis un fichier de sauvegarde',
    'settings.restoreWarning': 'Attention: Cela remplacera TOUTES les données actuelles!',
    
    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.close': 'Fermer',
    'common.add': 'Ajouter',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.confirm': 'Confirmer',
    'common.clear': 'Effacer',
    'common.view': 'Voir',
    'common.required': 'Champs obligatoires',
    'common.noData': 'Aucune donnée disponible',
  }
}

const currentLanguage = ref(localStorage.getItem('language') || 'en')

export const useI18n = () => {
  const t = (key: TranslationKey): string => {
    return translations[currentLanguage.value][key] || translations['en'][key] || key
  }
  
  const setLanguage = (lang: string) => {
    currentLanguage.value = lang
    localStorage.setItem('language', lang)
  }
  
  const language = computed(() => currentLanguage.value)
  
  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]
  
  return {
    t,
    setLanguage,
    language,
    availableLanguages
  }
}
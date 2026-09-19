import { ClassManagementConsole } from '@/features/teacher/components/ClassManagementConsole'

export function AdminClassesTab() {
  return <ClassManagementConsole canManageClass={true} />
}

export type Role = 'owner' | 'editor' | 'viewer'

export interface MemberUser {
  id: number
  name: string
  email: string
  image: string | null
}

export interface ProjectMembership {
  id: number
  role: Role
  user: MemberUser
}

export interface Project {
  id: number
  name: string
  description: string | null
  currentUserRole: Role
  membersCount: number
  owner: MemberUser
  createdAt: string
  updatedAt: string
}

export interface Board {
  id: number
  projectId: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: number
  boardId: number
  name: string
  position: number
  tasks: Task[]
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: number
  columnId: number
  boardId: number
  title: string
  description: string | null
  assigneeId: number | null
  assignee: MemberUser | null
  startDate: string | null
  dueDate: string | null
  priority: 'low' | 'medium' | 'high'
  position: number
  createdByUserId: number
  createdAt: string
  updatedAt: string
}

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
  current_user_role: Role
  members_count: number
  owner: MemberUser
  created_at: string
  updated_at: string
}

export interface Board {
  id: number
  project_id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Column {
  id: number
  board_id: number
  name: string
  position: number
  tasks: Task[]
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  column_id: number
  board_id: number
  title: string
  description: string | null
  assignee_id: number | null
  assignee: MemberUser | null
  start_date: string | null
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  position: number
  created_by_user_id: number
  created_at: string
  updated_at: string
}

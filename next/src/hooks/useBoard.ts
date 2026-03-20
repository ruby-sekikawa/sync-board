import useSWR from 'swr'
import axiosInstance from '@/lib/axios'
import type { Board, Column, Task } from '@/types'
import { fetcher } from '@/utils'

interface BoardWithColumns extends Board {
  columns: Column[]
}

interface MoveTaskParams {
  taskId: number
  toColumnId: number
  toPosition: number
}

export function useBoard(
  boardId: string | undefined,
  projectId: string | undefined,
) {
  const { data, error, isLoading, mutate } = useSWR<{
    board: BoardWithColumns
  }>(
    boardId && projectId ? `/projects/${projectId}/boards/${boardId}` : null,
    fetcher,
  )

  const board = data?.board

  const moveTask = async ({
    taskId,
    toColumnId,
    toPosition,
  }: MoveTaskParams) => {
    if (!board) return

    // Optimistic Update: ローカル状態を先行更新
    const optimisticBoard: BoardWithColumns = {
      ...board,
      columns: board.columns.map((col) => {
        const filtered = col.tasks.filter((t) => t.id !== taskId)
        if (col.id === toColumnId) {
          const movedTask = board.columns
            .flatMap((c) => c.tasks)
            .find((t) => t.id === taskId)
          if (!movedTask) return { ...col, tasks: filtered }
          const updated: Task = {
            ...movedTask,
            column_id: toColumnId,
            position: toPosition,
          }
          const inserted = [...filtered, updated].sort(
            (a, b) => a.position - b.position,
          )
          return { ...col, tasks: inserted }
        }
        return { ...col, tasks: filtered }
      }),
    }
    mutate({ board: optimisticBoard }, false)

    try {
      await axiosInstance.patch(`/boards/${boardId}/tasks/${taskId}/move`, {
        column_id: toColumnId,
        position: toPosition,
      })
    } catch {
      // ロールバック: サーバーから最新状態を再取得
      mutate(undefined, true)
      throw new Error('タスクの移動に失敗しました')
    }
  }

  const addTask = async (
    columnId: number,
    title: string,
    priority: Task['priority'] = 'medium',
    description?: string | null,
    due_date?: string | null,
    assignee_id?: number | null,
    start_date?: string | null,
  ) => {
    if (!board) return
    const column = board.columns.find((c) => c.id === columnId)
    const maxPosition =
      column?.tasks.reduce((max, t) => Math.max(max, t.position), 0) ?? 0
    const today = new Date().toISOString().slice(0, 10)
    await axiosInstance.post(`/boards/${boardId}/tasks`, {
      title,
      column_id: columnId,
      priority,
      description,
      start_date: start_date ?? today,
      due_date,
      assignee_id: assignee_id ?? null,
      position: maxPosition + 65536,
    })
    mutate()
  }

  const updateColumn = async (columnId: number, name: string) => {
    await axiosInstance.patch(`/boards/${boardId}/columns/${columnId}`, {
      name,
    })
    mutate()
  }

  const updateTask = async (
    taskId: number,
    params: Partial<
      Pick<
        Task,
        | 'title'
        | 'description'
        | 'priority'
        | 'start_date'
        | 'due_date'
        | 'assignee_id'
      >
    >,
  ) => {
    await axiosInstance.patch(`/boards/${boardId}/tasks/${taskId}`, params)
    mutate()
  }

  const deleteTask = async (taskId: number) => {
    await axiosInstance.delete(`/boards/${boardId}/tasks/${taskId}`)
    mutate()
  }

  const deleteColumn = async (columnId: number) => {
    await axiosInstance.delete(`/boards/${boardId}/columns/${columnId}`)
    mutate()
  }

  const addColumn = async (name: string) => {
    const maxPosition =
      board?.columns.reduce((max, c) => Math.max(max, c.position), 0) ?? 0
    await axiosInstance.post(`/boards/${boardId}/columns`, {
      name,
      position: maxPosition + 65536,
    })
    mutate()
  }

  return {
    board,
    isLoading,
    error,
    mutate,
    moveTask,
    addTask,
    addColumn,
    updateColumn,
    updateTask,
    deleteTask,
    deleteColumn,
  }
}

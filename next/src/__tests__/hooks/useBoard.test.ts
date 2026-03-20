import { renderHook, act, waitFor } from '@testing-library/react'
import useSWR from 'swr'
import { useBoard } from '@/hooks/useBoard'
import axiosInstance from '@/lib/axios'

jest.mock('swr')
jest.mock('@/lib/axios')

const mockBoard = {
  id: 1,
  project_id: 1,
  name: 'テストボード',
  description: null,
  columns: [
    {
      id: 1,
      board_id: 1,
      name: 'TODO',
      position: 65536,
      tasks: [
        {
          id: 1,
          column_id: 1,
          board_id: 1,
          title: 'タスク1',
          description: null,
          assignee_id: null,
          assignee: null,
          due_date: null,
          priority: 'medium',
          position: 65536,
          start_date: '2026-03-15',
          created_by_user_id: 1,
          created_at: '2026-03-15T00:00:00.000Z',
          updated_at: '2026-03-15T00:00:00.000Z',
        },
      ],
      created_at: '2026-03-15T00:00:00.000Z',
      updated_at: '2026-03-15T00:00:00.000Z',
    },
    {
      id: 2,
      board_id: 1,
      name: 'IN PROGRESS',
      position: 131072,
      tasks: [],
      created_at: '2026-03-15T00:00:00.000Z',
      updated_at: '2026-03-15T00:00:00.000Z',
    },
  ],
  created_at: '2026-03-15T00:00:00.000Z',
  updated_at: '2026-03-15T00:00:00.000Z',
}

const mockMutate = jest.fn()

describe('useBoard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSWR as jest.Mock).mockReturnValue({
      data: { board: mockBoard },
      error: null,
      isLoading: false,
      mutate: mockMutate,
    })
  })

  it('ボードデータを返す', () => {
    const { result } = renderHook(() => useBoard('1', '1'))
    expect(result.current.board).toEqual(mockBoard)
    expect(result.current.isLoading).toBe(false)
  })

  it('moveTask: Optimistic Updateを実行する', async () => {
    ;(axiosInstance.patch as jest.Mock).mockResolvedValue({
      data: {
        task: {
          ...mockBoard.columns[0].tasks[0],
          column_id: 2,
          position: 65536,
        },
      },
    })

    const { result } = renderHook(() => useBoard('1', '1'))

    await act(async () => {
      await result.current.moveTask({
        taskId: 1,
        toColumnId: 2,
        toPosition: 65536,
      })
    })

    // Optimistic Update でmutateが呼ばれたことを確認
    expect(mockMutate).toHaveBeenCalled()
    expect(axiosInstance.patch).toHaveBeenCalledWith('/boards/1/tasks/1/move', {
      column_id: 2,
      position: 65536,
    })
  })

  it('moveTask: API失敗時にロールバックする', async () => {
    ;(axiosInstance.patch as jest.Mock).mockRejectedValue(
      new Error('API Error'),
    )

    const { result } = renderHook(() => useBoard('1', '1'))

    // moveTask は失敗時に throw するので try/catch で包む
    await act(async () => {
      try {
        await result.current.moveTask({
          taskId: 1,
          toColumnId: 2,
          toPosition: 65536,
        })
      } catch {
        // expected
      }
    })

    await waitFor(() => {
      // エラー時は mutate(undefined, true) でサーバーから再取得
      expect(mockMutate).toHaveBeenLastCalledWith(undefined, true)
    })
  })
})

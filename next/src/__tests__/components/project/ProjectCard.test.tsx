import { render, screen } from '@testing-library/react'
import ProjectCard from '@/components/project/ProjectCard'

const mockProject = {
  id: 1,
  name: 'テストプロジェクト',
  description: 'プロジェクトの説明',
  current_user_role: 'owner' as const,
  members_count: 3,
  owner: { id: 1, name: '山田太郎', email: 'yamada@example.com', image: null },
  created_at: '2026-03-15T00:00:00.000Z',
  updated_at: '2026-03-15T00:00:00.000Z',
}

describe('ProjectCard', () => {
  it('プロジェクト名を表示する', () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText('テストプロジェクト')).toBeInTheDocument()
  })

  it('説明文を表示する', () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText('プロジェクトの説明')).toBeInTheDocument()
  })

  it('メンバー数を表示する', () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText(/3/)).toBeInTheDocument()
  })

  it('ownerの場合は削除ボタンを表示する', () => {
    render(<ProjectCard project={mockProject} onDelete={jest.fn()} />)
    expect(screen.getByRole('button', { name: /削除/ })).toBeInTheDocument()
  })

  it('viewer の場合は削除ボタンを表示しない', () => {
    render(
      <ProjectCard project={{ ...mockProject, current_user_role: 'viewer' }} />,
    )
    expect(
      screen.queryByRole('button', { name: /削除/ }),
    ).not.toBeInTheDocument()
  })
})

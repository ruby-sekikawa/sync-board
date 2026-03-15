import { render, screen } from '@testing-library/react'
import MemberList from '@/components/project/MemberList'

const mockMembers = [
  {
    id: 1,
    role: 'owner' as const,
    user: { id: 1, name: '山田太郎', email: 'yamada@example.com', image: null },
  },
  {
    id: 2,
    role: 'editor' as const,
    user: { id: 2, name: '鈴木花子', email: 'suzuki@example.com', image: null },
  },
  {
    id: 3,
    role: 'viewer' as const,
    user: { id: 3, name: '佐藤次郎', email: 'sato@example.com', image: null },
  },
]

describe('MemberList', () => {
  it('メンバー一覧を表示する', () => {
    render(<MemberList members={mockMembers} currentUserRole="owner" />)
    expect(screen.getByText('山田太郎')).toBeInTheDocument()
    expect(screen.getByText('鈴木花子')).toBeInTheDocument()
    expect(screen.getByText('佐藤次郎')).toBeInTheDocument()
  })

  it('ownerの場合はeditor/viewerの削除ボタンを表示する', () => {
    render(<MemberList members={mockMembers} currentUserRole="owner" />)
    const deleteButtons = screen.getAllByRole('button', { name: /削除/ })
    expect(deleteButtons).toHaveLength(2) // editor と viewer の削除ボタン（自分自身=ownerは除く）
  })

  it('editorの場合は削除ボタンを表示しない', () => {
    render(<MemberList members={mockMembers} currentUserRole="editor" />)
    expect(
      screen.queryByRole('button', { name: /削除/ }),
    ).not.toBeInTheDocument()
  })

  it('viewerの場合は削除ボタンを表示しない', () => {
    render(<MemberList members={mockMembers} currentUserRole="viewer" />)
    expect(
      screen.queryByRole('button', { name: /削除/ }),
    ).not.toBeInTheDocument()
  })

  it('ownerの場合はロール変更セレクトを表示する', () => {
    render(<MemberList members={mockMembers} currentUserRole="owner" />)
    // ownerは自分以外のメンバーのロールを変更できる
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThan(0)
  })
})

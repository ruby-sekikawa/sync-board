import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  Avatar,
  Box,
  Typography,
} from '@mui/material'
import type { ProjectMembership, Role } from '@/types'

interface Props {
  members: ProjectMembership[]
  currentUserRole: Role
  onRoleChange?: (membershipId: number, role: Role) => void
  onDelete?: (membershipId: number) => void
}

export default function MemberList({
  members,
  currentUserRole,
  onRoleChange,
  onDelete,
}: Props) {
  const isOwner = currentUserRole === 'owner'

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>メンバー</TableCell>
          <TableCell>ロール</TableCell>
          {isOwner && <TableCell>操作</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {members.map((membership) => {
          const isOwnerRow = membership.role === 'owner'
          return (
            <TableRow key={membership.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {membership.user.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">
                      {membership.user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {membership.user.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                {isOwner && !isOwnerRow ? (
                  <Select
                    size="small"
                    value={membership.role}
                    onChange={(e) =>
                      onRoleChange?.(membership.id, e.target.value as Role)
                    }
                  >
                    <MenuItem value="editor">editor</MenuItem>
                    <MenuItem value="viewer">viewer</MenuItem>
                  </Select>
                ) : (
                  <Typography variant="body2">{membership.role}</Typography>
                )}
              </TableCell>
              {isOwner && (
                <TableCell>
                  {!isOwnerRow && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onDelete?.(membership.id)}
                    >
                      削除
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

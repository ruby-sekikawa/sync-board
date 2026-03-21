import PeopleIcon from '@mui/icons-material/People'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material'
import Link from 'next/link'
import type { Project } from '@/types'

interface Props {
  project: Project
  onDelete?: (id: number) => void
}

export default function ProjectCard({ project, onDelete }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {project.name}
        </Typography>
        {project.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {project.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PeopleIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {project.membersCount}人
          </Typography>
          <Chip label={project.currentUserRole} size="small" sx={{ ml: 1 }} />
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} href={`/projects/${project.id}`}>
          開く
        </Button>
        {project.currentUserRole === 'owner' && onDelete && (
          <Button
            size="small"
            color="error"
            onClick={() => onDelete(project.id)}
          >
            削除
          </Button>
        )}
      </CardActions>
    </Card>
  )
}

import { Button } from '@mui/material'
import type { NextPage } from 'next'

const HelloMui: NextPage = () => {
  return (
    <>
      <Button variant="contained" sx={{ p: '24px' }}>
        Button1
      </Button>
      <Button variant="outlined" sx={{ p: '24px' }}>
        Button2
      </Button>
      <Button variant="contained" color="error" sx={{ p: '24px' }}>
        Button3
      </Button>
    </>
  )
}

export default HelloMui

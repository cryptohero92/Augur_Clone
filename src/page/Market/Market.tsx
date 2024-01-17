import LeftPanel from "../../component/Market/LeftPanel";
import MainArea from "../../component/Market/MainArea";
import { Box } from "@mui/material";
import Divider from '@mui/material/Divider';

export default function Markets() {
  return (
    <Box
      sx={{ display: 'flex', p: 1 }}
    >
      <LeftPanel />
      <Divider orientation="vertical" flexItem />
      <MainArea />
    </Box>
  );
}

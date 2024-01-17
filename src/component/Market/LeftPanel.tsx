import * as React from 'react';
import List from '@mui/material/List';
import { RadioGroup, Radio, FormControlLabel } from '@mui/material';
import CategorySection from './CategorySection';
import CollapsibleItem from './CollapsibleItem';

import { useDispatch, useSelector } from 'react-redux';
import { changeVolume, changeEndDate, changeStatus } from '../../feature/slices/filterSlice';
import { RootState } from '../../app/store';
  
export default function LeftPanel() {
  const dispatch = useDispatch();

  const selectedVolume = useSelector((state: RootState) => state.filterKey.Volume);
  
  React.useEffect(() => {
    dispatch(changeVolume(0));
    dispatch(changeEndDate(0));
    dispatch(changeStatus(1));
  }, [])

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeVolume(event.target.value));
  }

  const selectedEndDate = useSelector((state: RootState) => state.filterKey.EndDate);

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeEndDate(event.target.value));
  }

  const selectedStatus = useSelector((state: RootState) => state.filterKey.Status);

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeStatus(event.target.value));
  }

  return (
      <List
        sx={{ width: '100%', height: 'calc(100vh - 146px)', maxWidth: {sm: '270px', md: '360px'}, maxHeight: 'calc(100vh - 146px)', overflowY: "auto", bgcolor: 'transparent'}}
        component="nav"
        aria-labelledby="nested-list-subheader"   
      >
        <CollapsibleItem title="Volume">
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="radio-buttons-group"
            onChange={handleVolumeChange}
            value={selectedVolume}
          >
            <FormControlLabel value="0" control={<Radio />} label="Any" />
            <FormControlLabel value="1" control={<Radio />} label="Under $10,000" />
            <FormControlLabel value="2" control={<Radio />} label="$10,000 - $50,000" />
            <FormControlLabel value="3" control={<Radio />} label="$50,000 - $100,000" />
            <FormControlLabel value="4" control={<Radio />} label="Over $100,000" />
          </RadioGroup>
        </CollapsibleItem>
        <CollapsibleItem title="End Date">
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            onChange={handleEndDateChange}
            value={selectedEndDate}
            name="enddate-radio-buttons-group"
          >
            <FormControlLabel value="0" control={<Radio />} label="Any" />
            <FormControlLabel value="1" control={<Radio />} label="Ends today" />
            <FormControlLabel value="2" control={<Radio />} label="Ends this week" />
            <FormControlLabel value="3" control={<Radio />} label="Ends this month" />
          </RadioGroup>
        </CollapsibleItem>
        <CollapsibleItem title="Status">
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            onChange={handleStatusChange}
            value={selectedStatus}
            name="status-radio-buttons-group"
          >
            <FormControlLabel value="0" control={<Radio />} label="All" />
            <FormControlLabel value="1" control={<Radio />} label="Active" />
            <FormControlLabel value="2" control={<Radio />} label="Resolved" />
          </RadioGroup>
        </CollapsibleItem>
        <CollapsibleItem title="Categories">
          <CategorySection />
        </CollapsibleItem>
        
      </List>
  );
}
  
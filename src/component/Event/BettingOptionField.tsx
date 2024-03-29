import { useState, useEffect } from 'react';
import { TextField, Button, IconButton, Select, MenuItem, FormControl, InputLabel, Box, CardMedia } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { MuiFileInput } from 'mui-file-input';

const BettingOption = ({index, option, onRemove, onChange, canRemove}: any) => {
  return (
    <Box sx={{display:'flex', gap: '1rem'}}>
      <TextField
        label={`Option ${index + 1}`}
        onChange={(e) => onChange('title', e.target.value)}
        required
        value={option.title}
      />
      <Box sx={{width: '250px'}}>
        <MuiFileInput inputProps={{ accept: '.png, .jpeg' }} value={option.file} onChange={(value) => onChange('file', value)} sx={{width:1}} />
      </Box>
      <Box>
        {
          option.image && (
            <CardMedia
              sx={{ height: 60, width:60, minWidth: 60, ml: '1rem' }}
              image={option.image}
            />
          )
        }
      </Box>
      {
        canRemove && (
          <IconButton onClick={onRemove}>
            <DeleteIcon />
          </IconButton>
        )
      }
    </Box>
  )
}

export default function BettingOptionsField({bettingOptions, setBettingOptions}: any) {
  const [bettingMode, setBettingMode] = useState('single');
  const [multiBettingOptions, setMultiBettingOptions] = useState([{ title: '', image: '', file: null }, { title: '', image: '', file: null }]);

  useEffect(() => {
    if (bettingOptions.length < 2) {
      setBettingMode('single');
    } else {
      setBettingMode('multi');
      setMultiBettingOptions(bettingOptions);
    }
  }, [bettingOptions])

  const handleAddOption = () => {
    setMultiBettingOptions([...multiBettingOptions, {title: '', image: '', file: null}]);
  }

  const handleOptionChange = (index: number, field: string, value: any) => {
    const newOptions = [...multiBettingOptions];
    newOptions[index] = {
        ...newOptions[index],
        [field]: value
    };
    if (field == 'file') {
      newOptions[index]['image'] = URL.createObjectURL(value);
    }
    setMultiBettingOptions(newOptions);
  }

  const handleRemoveOption = (index: number) => {
    let newOptions = [...multiBettingOptions];
    newOptions.splice(index, 1);
    setMultiBettingOptions(newOptions);
  }

  useEffect(() => {
    if (bettingMode == 'single') {
      setBettingOptions([{ title: '', image: '', file: null }]);
    } else {
      setBettingOptions(multiBettingOptions);
    }
  }, [bettingMode, multiBettingOptions]);

  return (
    <FormControl sx={{width: 1, mb: 3}}>
      <InputLabel id="bet-type-select-label">Bet Type</InputLabel>
      <Select
        labelId="bet-type-select-label"
        id="bet-type-select"
        value={bettingMode}
        label="Bet Mode"
        onChange={(event) => setBettingMode(event.target.value)}
      >
        <MenuItem value="single">Single</MenuItem>
        <MenuItem value="multi">Multi</MenuItem>
      </Select>
      { bettingMode == "multi" && (
        <Box sx={{mt: '1rem'}}>
          {
            multiBettingOptions.map((option, index) => (
              <Box key={index} sx={{mb: '1rem'}}>
                <BettingOption
                  index={index}
                  option={option}
                  onRemove={() => handleRemoveOption(index)}
                  onChange={(field: string, value: Blob | MediaSource) => handleOptionChange(index, field, value)}
                  canRemove={multiBettingOptions.length > 2}
                />
              </Box>
            ))
          }
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddOption}
          >
            Add Option
          </Button>
        </Box>
      )}
    </FormControl>
  )
}

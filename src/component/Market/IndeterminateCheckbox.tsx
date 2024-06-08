import * as React from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useDispatch } from 'react-redux';
import { addCategoryToActiveList, removeCategoryFromActiveList } from '../../feature/slices/categorySlice'

import { Category } from '../../types';

export default function IndeterminateCheckbox({name, subcategories}: Category) {
  const dispatch = useDispatch();
  const [checked, setChecked] = React.useState(Array(subcategories.length).fill(false));

  const handleChangeAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(Array(subcategories.length).fill(event.target.checked));
    subcategories.map((item) => {
      let func = event.target.checked ? addCategoryToActiveList : removeCategoryFromActiveList;
      dispatch(func(item.name));
    })
    
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    debugger
    let newChecked = [...checked];
    newChecked[index] = event.target.checked;
    setChecked(newChecked);

    let func = event.target.checked ? addCategoryToActiveList : removeCategoryFromActiveList;
    dispatch(func(subcategories[index].name));
  }

  const children = (
    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
      {
        subcategories.map((item, index) => (
          <FormControlLabel
            label={item.name}
            key={index}
            control={<Checkbox checked={checked[index]} onChange={(e) => handleChange(e, index)} />}
          />
        ))
      }
    </Box>
  );

  return (
    <div>
      <FormControlLabel
        label={name}
        control={
          <Checkbox
            checked={checked.some((item) => item === true)}
            indeterminate={!checked.every((item) => item === checked[0])}
            onChange={handleChangeAll}
          />
        }
      />
      {children}
    </div>
  );
}
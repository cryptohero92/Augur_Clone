import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';

interface Props {
  name: string;
  subcategories: string[];
  onDeleteCategory: (name: string) => void;
  onDeleteSubcategory: (categoryName: string, subcategoryName: string) => void;
  onAddSubcategory: (categoryName: string, subcategoryName: string) => void;
}

const CategoryItem: React.FC<Props> = ({ name, subcategories, onDeleteCategory, onDeleteSubcategory, onAddSubcategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box>
      <div onClick={toggleAccordion}>
        <h2>{name}</h2>
        <button onClick={(e) => {
          e.stopPropagation(); 
          onDeleteCategory(name);
        }}>Delete Category</button>
      </div>
      {isOpen && (
        <ul>
          {subcategories.map((subcategory, index) => (
            <li key={index}>
              {subcategory}
              <button onClick={(e) => {
                e.stopPropagation(); 
                onDeleteSubcategory(name, subcategory);
              }}>Delete Subcategory</button>
            </li>
          ))}
          <li>
            <TextField
              label="New Subcategory"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={(e) => {
              e.stopPropagation(); 
              onAddSubcategory(name, newSubcategoryName);
              setNewSubcategoryName("");
            }}>Add Subcategory</Button>
          </li>
        </ul>
      )}
    </Box>
  );
};

export default CategoryItem;

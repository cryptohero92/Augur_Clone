import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Button, TextField } from "@mui/material";
import { Link } from "react-router-dom";
import { setCategories as setReduxCategories } from "../../feature/slices/categorySlice";
import CategoryItem from "./CategoryItem";
import { RootState } from "../../app/store";

export default function Categories() {
  const dispatch = useDispatch();
  // Get categories from Redux state
  const reduxCategories = useSelector((state: RootState) => state.categoryKey.keywords);

  // Initialize local state with Redux categories
  const [categories, setCategories] = useState(reduxCategories);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Update local state when Redux categories change
  useEffect(() => {
    setCategories(reduxCategories);
  }, [reduxCategories]);

  const onDeleteCategory = (categoryName: string) => {
    setCategories(categories.filter((category) => category.name !== categoryName));
  };

  const onAddCategory = () => {
    if (newCategoryName.trim() !== "") {
      setCategories([...categories, { name: newCategoryName.trim(), subcategories: [] }]);
      setNewCategoryName(""); // Clear the input field after adding
    }
  };

  const onDeleteSubcategory = (categoryName: string, subcategoryName: string) => {
      setCategories(
        categories.map((category) => {
          if (category.name === categoryName) {
            return {
              ...category,
              subcategories: category.subcategories.filter((subcategory) => subcategory !== subcategoryName),
            };
          }
          return category;
        })
      );
  };

  const onAddSubcategory = (categoryName: string, subCategoryName: string) => {
    if (subCategoryName.trim() !== "") {
        setCategories(
          categories.map((category) => {
            if (category.name === categoryName) {
              return {
                ...category,
                subcategories: [...category.subcategories, subCategoryName.trim()],
              };
            }
            return category;
          })
        );
    }
  };

  const onSave = () => {
    // Save local categories to Redux
    dispatch(setReduxCategories(categories));
  };

  return (
    <Box>
      <Box sx={{ p: 2, width: 1 }}>
        <Link to="/dashboard/events">
          <Button variant="contained" color="primary">
            Events
          </Button>
        </Link>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {categories.map((category, index) => (
          <CategoryItem
            name={category.name}
            subcategories={category.subcategories}
            onDeleteCategory={onDeleteCategory}
            onDeleteSubcategory={onDeleteSubcategory}
            onAddSubcategory={onAddSubcategory}
            key={index}
          />
        ))}
        <TextField
          label="New Category"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={onAddCategory}>
          Add Category
        </Button>
      </Box>
      <Box>
        <Button variant="contained" color="secondary" onClick={onSave}>
          Save
        </Button>
      </Box>
    </Box>
  );
}

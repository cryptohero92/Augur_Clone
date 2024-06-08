import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Box, Button, TextField } from "@mui/material";
import { Link } from "react-router-dom";
import CategoryItem from "./CategoryItem";
import { RootState } from "../../app/store";
import { useLocalStorage } from "usehooks-ts";

export default function Categories() {
  // Get categories from Redux state
  const reduxCategories = useSelector((state: RootState) => state.categoryKey.keywords);
  const [accessToken] = useLocalStorage<string>('accessToken', '')

  // Initialize local state with Redux categories
  const [categories, setCategories] = useState(reduxCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
              subcategories: category.subcategories.filter((subcategory) => subcategory.name !== subcategoryName),
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
                subcategories: [...category.subcategories, {name: subCategoryName.trim()}],
              };
            }
            return category;
          })
        );
    }
  };

  const onSave = () => {
    // Save local categories to backend db
    setIsSaving(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/categories`, {
      body: JSON.stringify({
          categories
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST'
    })
    .then((response) => {
        if (response.status != 200)
            console.error(response);
        setIsSaving(true);
    })
    .catch(err => {
        console.error(err);
        setIsSaving(false);
    });
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
        <Button variant="contained" color="secondary" onClick={onSave} disabled={isSaving}>
          Save
        </Button>
      </Box>
    </Box>
  );
}

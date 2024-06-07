import { useSelector, useDispatch } from "react-redux";
import { Box, Button } from '@mui/material'
import { Link } from 'react-router-dom';
import { setCategories } from "../../feature/slices/categorySlice";
import CategoryItem from "./CategoryItem";
import { RootState } from "../../app/store";

export default function Categories() {
    // first need to get all events. these events are from mongodb.
    const dispatch = useDispatch();
    const categories = useSelector((state: RootState) => state.categoryKey.keywords)

    const onDeleteCategory = (categoryName: string) => {
        dispatch(setCategories(categories.filter(category => category.name !== categoryName)));
    };

    const onAddCategory = () => {
        dispatch(setCategories([...categories, { name: 'New Category', subcategories: [] }]));
    };

    const onDeleteSubcategory = (categoryName: string, subcategoryName: string) => {
        dispatch(setCategories(categories.map(category => {
          if (category.name === categoryName) {
            return {
              ...category,
              subcategories: category.subcategories.filter(subcategory => subcategory !== subcategoryName),
            };
          }
          return category;
        })));
    };

    const onAddSubcategory = (categoryName: string) => {
        dispatch(setCategories(categories.map(category => {
          if (category.name === categoryName) {
            return {
              ...category,
              subcategories: [...category.subcategories, 'New Subcategory'],
            };
          }
          return category;
        })));
    };

    return (
        <Box>
            <Box sx={{p: 2, width: 1}}>
                <Link to="/dashboard/events">
                    <Button
                    variant="contained"
                    color="primary"
                    >
                        Events
                    </Button>
                </Link>
            </Box>
            <Box
                sx={{ flexGrow: 1 }}
            >
                { categories.map((category, index) => (<CategoryItem 
                    name={category.name} 
                    subcategories={category.subcategories} 
                    onDeleteCategory={onDeleteCategory}
                    onDeleteSubcategory={onDeleteSubcategory} 
                    onAddSubcategory={onAddSubcategory} key={index} />)) }
                <button onClick={onAddCategory}>Add Category</button>
            </Box>
        </Box>
    )
}


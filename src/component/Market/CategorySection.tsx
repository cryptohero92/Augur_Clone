import IndeterminateCheckbox from './IndeterminateCheckbox';
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store';

export default function CategorySection() {
  const categories = useSelector((state: RootState) => state.categoryKey.keywords)

  return (
    <div>
      {
        categories.map((category, index) => <IndeterminateCheckbox name={category.name} subcategories={category.subcategories} key={index} />)
      }
    </div>
  );
}
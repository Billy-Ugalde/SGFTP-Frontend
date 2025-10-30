import { useState, useRef, useEffect } from 'react';
import { ENTREPRENEURSHIP_CATEGORIES } from '../Types';
import '../Styles/CategoryFilter.css';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { value: '', label: 'Todas las categorías' },
    ...ENTREPRENEURSHIP_CATEGORIES.map(category => ({
      value: category,
      label: category
    }))
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Comida':
        return '';
      case 'Artesanía':
        return '';
      case 'Vestimenta':
        return '';
      case 'Accesorios':
        return '';
      case 'Decoración':
        return '';
      case 'Demostración':
        return '';
        case 'Otra categoría': 
        return ''
      default:
        return '';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedCategoryData = categories.find(cat => cat.value === selectedCategory);

  return (
    <div className="category-filter" ref={dropdownRef}>
      <button
        className="category-filter__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="category-filter__trigger-content">
          <div className="category-filter__icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <span className="category-filter__text">
            {selectedCategoryData ? (
              <span className="category-filter__selected">
                {selectedCategory && (
                  <span className="category-filter__category-icon">
                    {getCategoryIcon(selectedCategory)}
                  </span>
                )}
                {selectedCategoryData.label}
              </span>
            ) : (
              'Seleccionar categoría'
            )}
          </span>
        </div>
        <div className={`category-filter__chevron ${isOpen ? 'category-filter__chevron--open' : ''}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="category-filter__dropdown">
          <div className="category-filter__options">
            {categories.map((category) => (
              <button
                key={category.value}
                className={`category-filter__option ${selectedCategory === category.value ? 'category-filter__option--selected' : ''}`}
                onClick={() => {
                  onCategoryChange(category.value);
                  setIsOpen(false);
                }}
                type="button"
              >
                <div className="category-filter__option-content">
                  {category.value && (
                    <span className="category-filter__option-icon">
                      {getCategoryIcon(category.value)}
                    </span>
                  )}
                  <span className="category-filter__option-text">
                    {category.label}
                  </span>
                </div>
                {selectedCategory === category.value && (
                  <div className="category-filter__check">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
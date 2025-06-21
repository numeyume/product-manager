import React, { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (searchTerm: string, category: string, storageLevel1: string, hideOutOfStock: boolean) => void;
  categories: string[];
  storageLocations: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, categories, storageLocations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  const handleSearch = () => {
    onSearch(searchTerm, selectedCategory, selectedStorage, hideOutOfStock);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStorage('');
    setHideOutOfStock(false);
    onSearch('', '', '', false);
  };

  const handleToggleHideOutOfStock = () => {
    const newValue = !hideOutOfStock;
    setHideOutOfStock(newValue);
    onSearch(searchTerm, selectedCategory, selectedStorage, newValue);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="商品名で検索..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        className="search-input"
      />
      
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="search-select"
      >
        <option value="">すべてのカテゴリ</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      
      <select
        value={selectedStorage}
        onChange={(e) => setSelectedStorage(e.target.value)}
        className="search-select"
      >
        <option value="">すべての保管場所</option>
        {storageLocations.map(loc => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
      
      <label className="stock-filter">
        <input
          type="checkbox"
          checked={hideOutOfStock}
          onChange={handleToggleHideOutOfStock}
        />
        <span>在庫切れを非表示</span>
      </label>
      
      <button onClick={handleSearch} className="search-btn">検索</button>
      <button onClick={handleReset} className="reset-btn">リセット</button>
    </div>
  );
};
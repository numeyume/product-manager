import React from 'react';
import './BusinessModeToggle.css';

interface BusinessModeToggleProps {
  isBusinessMode: boolean;
  onToggle: (enabled: boolean) => void;
}

export const BusinessModeToggle: React.FC<BusinessModeToggleProps> = ({
  isBusinessMode,
  onToggle
}) => {
  return (
    <div className="business-mode-toggle">
      <label className="toggle-label">
        <input
          type="checkbox"
          checked={isBusinessMode}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="toggle-slider"></span>
        <span className="toggle-text">
          {isBusinessMode ? '🏢 ビジネスモード' : '🏠 個人モード'}
        </span>
      </label>
      
      {isBusinessMode && (
        <div className="business-features">
          <span className="feature-tag">仕入れ先管理</span>
          <span className="feature-tag">発注点設定</span>
          <span className="feature-tag">利益計算</span>
        </div>
      )}
    </div>
  );
};
import React, { useState } from 'react';

interface AccessibilityControlsProps {
  onColorSchemeChange: (scheme: 'default' | 'colorblind' | 'grayscale' | 'high-contrast') => void;
  onFontSizeChange: (size: 'small' | 'medium' | 'large') => void;
  onAnimationToggle: (enabled: boolean) => void;
  onScreenReaderMode: (enabled: boolean) => void;
}

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  onColorSchemeChange,
  onFontSizeChange,
  onAnimationToggle,
  onScreenReaderMode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [colorScheme, setColorScheme] = useState<'default' | 'colorblind' | 'grayscale' | 'high-contrast'>('default');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  const handleColorSchemeChange = (scheme: typeof colorScheme) => {
    setColorScheme(scheme);
    onColorSchemeChange(scheme);
  };

  const handleFontSizeChange = (size: typeof fontSize) => {
    setFontSize(size);
    onFontSizeChange(size);
  };

  const handleAnimationToggle = () => {
    const newState = !animationsEnabled;
    setAnimationsEnabled(newState);
    onAnimationToggle(newState);
  };

  const handleScreenReaderToggle = () => {
    const newState = !screenReaderMode;
    setScreenReaderMode(newState);
    onScreenReaderMode(newState);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        aria-label="Open accessibility controls"
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <h3 className="text-lg font-semibold mb-4">Accessibility Settings</h3>
          
          {/* Color Scheme */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Scheme
            </label>
            <select
              value={colorScheme}
              onChange={(e) => handleColorSchemeChange(e.target.value as typeof colorScheme)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Select color scheme"
            >
              <option value="default">Default</option>
              <option value="colorblind">Colorblind Friendly</option>
              <option value="grayscale">Grayscale</option>
              <option value="high-contrast">High Contrast</option>
            </select>
          </div>

          {/* Font Size */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    fontSize === size
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-pressed={fontSize === size}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Toggle */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={animationsEnabled}
                onChange={handleAnimationToggle}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-describedby="animation-description"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable Animations
              </span>
            </label>
            <p id="animation-description" className="text-xs text-gray-500 mt-1">
              Disable if you prefer reduced motion
            </p>
          </div>

          {/* Screen Reader Mode */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={screenReaderMode}
                onChange={handleScreenReaderToggle}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-describedby="screen-reader-description"
              />
              <span className="text-sm font-medium text-gray-700">
                Screen Reader Mode
              </span>
            </label>
            <p id="screen-reader-description" className="text-xs text-gray-500 mt-1">
              Enhanced descriptions for screen readers
            </p>
          </div>

          {/* Keyboard Navigation Help */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Keyboard Navigation</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li><kbd className="px-1 py-0.5 bg-gray-100 rounded">Tab</kbd> - Navigate between elements</li>
              <li><kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter/Space</kbd> - Activate buttons</li>
              <li><kbd className="px-1 py-0.5 bg-gray-100 rounded">Arrow keys</kbd> - Navigate charts</li>
              <li><kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> - Close dialogs</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Screen Reader Announcements Component
export const ScreenReaderAnnouncements: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

// Chart Description Component for Screen Readers
export const ChartDescription: React.FC<{
  title: string;
  description: string;
  dataPoints: number;
  trends: string[];
  keyInsights: string[];
}> = ({ title, description, dataPoints, trends, keyInsights }) => {
  return (
    <div className="sr-only" aria-label={`Chart description for ${title}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      <p>This chart contains {dataPoints} data points.</p>
      {trends.length > 0 && (
        <div>
          <h4>Key Trends:</h4>
          <ul>
            {trends.map((trend, index) => (
              <li key={index}>{trend}</li>
            ))}
          </ul>
        </div>
      )}
      {keyInsights.length > 0 && (
        <div>
          <h4>Key Insights:</h4>
          <ul>
            {keyInsights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AccessibilityControls;
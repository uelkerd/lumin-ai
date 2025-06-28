
import React, { useState, useEffect } from 'react';

interface DemographicData {
  category: string;
  young: number;
  middleAge: number;
  senior: number;
  male: number;
  female: number;
  urban: number;
  rural: number;
}

const DemographicAnalysisChart: React.FC = () => {
  const [data, setData] = useState<DemographicData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'age' | 'gender' | 'location'>('age');

  useEffect(() => {
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData: DemographicData[] = [
        {
          category: 'Trust in Government',
          young: 5.8, middleAge: 6.5, senior: 7.2,
          male: 6.3, female: 6.8,
          urban: 6.1, rural: 6.9
        },
        {
          category: 'Transparency Rating',
          young: 6.9, middleAge: 7.5, senior: 8.1,
          male: 7.2, female: 7.8,
          urban: 7.6, rural: 7.4
        },
        {
          category: 'Civic Participation',
          young: 5.2, middleAge: 6.8, senior: 7.9,
          male: 6.1, female: 6.7,
          urban: 6.5, rural: 6.2
        },
        {
          category: 'Accountability Score',
          young: 6.1, middleAge: 7.2, senior: 7.8,
          male: 6.9, female: 7.4,
          urban: 7.2, rural: 7.0
        }
      ];
      
      setData(mockData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const getViewData = (item: DemographicData) => {
    switch (activeView) {
      case 'age':
        return [
          { label: '18-35', value: item.young, color: '#29B6F6' },
          { label: '36-55', value: item.middleAge, color: '#10B981' },
          { label: '55+', value: item.senior, color: '#F59E0B' }
        ];
      case 'gender':
        return [
          { label: 'Male', value: item.male, color: '#29B6F6' },
          { label: 'Female', value: item.female, color: '#EF4444' }
        ];
      case 'location':
        return [
          { label: 'Urban', value: item.urban, color: '#29B6F6' },
          { label: 'Rural', value: item.rural, color: '#10B981' }
        ];
      default:
        return [];
    }
  };

  const ViewToggle: React.FC = () => (
    <div className="flex gap-sm mb-lg justify-center">
      {[
        { key: 'age', label: 'Age Groups', icon: '👥' },
        { key: 'gender', label: 'Gender', icon: '⚧' },
        { key: 'location', label: 'Location', icon: '🏘️' }
      ].map((view) => (
        <button
          key={view.key}
          onClick={() => setActiveView(view.key as any)}
          className={`btn ${activeView === view.key ? 'btn-primary' : 'btn-secondary'}`}
        >
          <span>{view.icon}</span>
          {view.label}
        </button>
      ))}
    </div>
  );

  const BarChart: React.FC<{ item: DemographicData; index: number }> = ({ item, index }) => {
    const viewData = getViewData(item);
    const maxValue = Math.max(...viewData.map(d => d.value));
    
    return (
      <div className="card">
        <h4 className="text-lg font-semibold mb-md gradient-text">{item.category}</h4>
        <div className="space-y-md">
          {viewData.map((segment, segmentIndex) => (
            <div key={segment.label} className="space-y-xs">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: segment.color }}>
                  {segment.label}
                </span>
                <span className="text-sm font-bold">
                  {segment.value.toFixed(1)}
                </span>
              </div>
              <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    backgroundColor: segment.color,
                    width: `${(segment.value / 10) * 100}%`,
                    animationDelay: `${(index * 200) + (segmentIndex * 100)}ms`
                  }}
                />
                <div 
                  className="absolute top-0 left-0 h-full rounded-full opacity-30"
                  style={{
                    backgroundColor: segment.color,
                    width: `${(segment.value / maxValue) * 100}%`,
                    animationDelay: `${(index * 200) + (segmentIndex * 100)}ms`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick insights */}
        <div className="mt-md p-sm rounded-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="text-xs text-silver-grey">
            {(() => {
              const highest = viewData.reduce((max, current) => 
                current.value > max.value ? current : max
              );
              const gap = Math.max(...viewData.map(d => d.value)) - Math.min(...viewData.map(d => d.value));
              return `Highest: ${highest.label} (${highest.value.toFixed(1)}) • Gap: ${gap.toFixed(1)}`;
            })()}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">Loading demographic analysis...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ViewToggle />
      
      <div className="grid grid-cols-2 gap-lg mb-lg">
        {data.map((item, index) => (
          <BarChart key={item.category} item={item} index={index} />
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="glass-card p-lg">
        <h4 className="text-lg font-semibold mb-md gradient-text">Key Insights</h4>
        <div className="grid grid-cols-1 gap-md text-sm">
          {activeView === 'age' && (
            <>
              <div className="flex justify-between">
                <span>Most Trusting Age Group:</span>
                <span className="font-medium">Seniors (55+)</span>
              </div>
              <div className="flex justify-between">
                <span>Highest Participation:</span>
                <span className="font-medium">Seniors (7.9)</span>
              </div>
              <div className="flex justify-between">
                <span>Largest Trust Gap:</span>
                <span className="font-medium">Civic Participation (2.7 points)</span>
              </div>
            </>
          )}
          {activeView === 'gender' && (
            <>
              <div className="flex justify-between">
                <span>Higher Trust:</span>
                <span className="font-medium">Female respondents</span>
              </div>
              <div className="flex justify-between">
                <span>Transparency Rating:</span>
                <span className="font-medium">Female +0.6 points higher</span>
              </div>
              <div className="flex justify-between">
                <span>Participation Gap:</span>
                <span className="font-medium">Female +0.6 points</span>
              </div>
            </>
          )}
          {activeView === 'location' && (
            <>
              <div className="flex justify-between">
                <span>Higher Overall Trust:</span>
                <span className="font-medium">Rural areas</span>
              </div>
              <div className="flex justify-between">
                <span>Transparency:</span>
                <span className="font-medium">Urban +0.2 points</span>
              </div>
              <div className="flex justify-between">
                <span>Participation:</span>
                <span className="font-medium">Urban +0.3 points</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemographicAnalysisChart;

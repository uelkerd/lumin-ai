import React, { useState, useEffect } from 'react';
import Loading from '../common/Loading';
import DemographicComparison from '../DataVisualization/DemographicComparison';

const DemographicAnalysis: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDemographic, setSelectedDemographic] = useState<string>('age');
  
  // In a real app, this would fetch from an API
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return <Loading message="Loading demographic analysis data..." />;
  }
  
  return (
    <div className="demographic-analysis-container fade-in">
      <h1>Demographic Trust Analysis</h1>
      <p className="section-description">
        Explore how democratic trust patterns vary across different demographic groups
      </p>
      
      <div className="demographic-selector">
        <button 
          className={selectedDemographic === 'age' ? 'active' : ''} 
          onClick={() => setSelectedDemographic('age')}
        >
          Age Groups
        </button>
        <button 
          className={selectedDemographic === 'education' ? 'active' : ''} 
          onClick={() => setSelectedDemographic('education')}
        >
          Education Levels
        </button>
        <button 
          className={selectedDemographic === 'income' ? 'active' : ''} 
          onClick={() => setSelectedDemographic('income')}
        >
          Income Brackets
        </button>
        <button 
          className={selectedDemographic === 'region' ? 'active' : ''} 
          onClick={() => setSelectedDemographic('region')}
        >
          Geographic Regions
        </button>
      </div>
      
      <div className="chart-container">
        <h2 className="chart-title">
          Trust Comparison by {selectedDemographic.charAt(0).toUpperCase() + selectedDemographic.slice(1)}
        </h2>
        <DemographicComparison demographic={selectedDemographic} />
      </div>
      
      <div className="statistical-significance">
        <h3>Statistical Significance</h3>
        <p>
          All demographic comparisons include appropriate statistical significance testing with 
          multiple comparison corrections. Effect size calculations provide practical significance 
          assessment beyond statistical significance.
        </p>
        <div className="significance-legend">
          <div className="significance-item">
            <span className="significance-marker significant">*</span>
            <span>p &lt; 0.05</span>
          </div>
          <div className="significance-item">
            <span className="significance-marker highly-significant">**</span>
            <span>p &lt; 0.01</span>
          </div>
          <div className="significance-item">
            <span className="significance-marker very-significant">***</span>
            <span>p &lt; 0.001</span>
          </div>
        </div>
      </div>
      
      <div className="methodology-section">
        <h3>Methodology</h3>
        <p>
          Demographic analysis uses ANOVA and post-hoc testing for group comparisons across age, 
          education, income, geographic regions, and political party affiliation. All analyses 
          include appropriate effect size calculations and confidence intervals.
        </p>
      </div>
    </div>
  );
};

export default DemographicAnalysis;
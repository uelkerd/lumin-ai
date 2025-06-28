import React, { useState, useEffect } from "react";
import TrustTimeSeriesChart from "./TrustTimeSeriesChart";
import DemographicAnalysisChart from "./DemographicAnalysisChart";

interface TrustMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  description: string;
  icon: string;
}

interface DashboardData {
  trustMetrics: TrustMetric[];
  lastUpdated: string;
  isLoading: boolean;
}

const TrustMetricsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    trustMetrics: [],
    lastUpdated: "",
    isLoading: true,
  });

  useEffect(() => {
    // Simulate API call with mock data
    const fetchDashboardData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate loading

        const mockData: DashboardData = {
          trustMetrics: [
            {
              id: "overall-trust",
              title: "Overall Trust Score",
              value: 7.2,
              change: 0.3,
              description:
                "Composite trust indicator across all governance dimensions",
              icon: "🏛️",
            },
            {
              id: "transparency",
              title: "Transparency Index",
              value: 8.1,
              change: 0.5,
              description:
                "Measure of government openness and information accessibility",
              icon: "🔍",
            },
            {
              id: "participation",
              title: "Civic Participation",
              value: 6.8,
              change: -0.2,
              description:
                "Level of citizen engagement in democratic processes",
              icon: "🗳️",
            },
            {
              id: "accountability",
              title: "Accountability Score",
              value: 7.5,
              change: 0.1,
              description:
                "Effectiveness of oversight and responsibility mechanisms",
              icon: "⚖️",
            },
          ],
          lastUpdated: new Date().toLocaleString(),
          isLoading: false,
        };

        setDashboardData(mockData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  const MetricCard: React.FC<{ metric: TrustMetric }> = ({ metric }) => {
    const changeColor = metric.change >= 0 ? "#10B981" : "#EF4444";
    const changeIcon = metric.change >= 0 ? "↗" : "↘";

    return (
      <div className="metric-card fade-in">
        <div className="metric-title">
          <span className="text-2xl">{metric.icon}</span>
          {metric.title}
        </div>
        <div className="metric-value">{metric.value.toFixed(1)}</div>
        <div className="flex items-center gap-sm mb-md">
          <span className="text-sm font-medium" style={{ color: changeColor }}>
            {changeIcon} {Math.abs(metric.change).toFixed(1)}
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--color-silver-grey)" }}
          >
            vs. last month
          </span>
        </div>
        <div className="metric-description">{metric.description}</div>
      </div>
    );
  };

  const LoadingSpinner: React.FC = () => (
    <div className="loading-container">
      <div className="spinner"></div>
      <div className="loading-text">Loading governance insights...</div>
    </div>
  );

  const DashboardHeader: React.FC = () => (
    <div className="app-header">
      <div className="nav-container">
        <div>
          <h1>LUMIN.AI Dashboard</h1>
          <p className="subtitle">
            Neural Networks for Democratic Transparency
          </p>
        </div>
        <div className="nav-links">
          <a href="#dashboard" className="nav-link active">
            Dashboard
          </a>
          <a href="#analytics" className="nav-link">
            Analytics
          </a>
          <a href="#reports" className="nav-link">
            Reports
          </a>
          <a href="#settings" className="nav-link">
            Settings
          </a>
        </div>
      </div>
    </div>
  );

  const QuickStats: React.FC = () => (
    <div className="glass-card p-lg mb-xl">
      <h3 className="text-xl font-semibold mb-md gradient-text">
        Platform Overview
      </h3>
      <div className="grid grid-cols-3 gap-lg">
        <div className="text-center fade-in">
          <div className="text-2xl font-bold text-blue-electric">156</div>
          <div className="text-sm text-silver-grey">Data Sources</div>
          <div
            className="text-xs"
            style={{ color: "rgba(0, 0, 0, 0.5)", marginTop: "0.25rem" }}
          >
            Democracy Radar, EU Barometer, Civic Pulse
          </div>
        </div>
        <div className="text-center fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="text-2xl font-bold text-blue-electric">24/7</div>
          <div className="text-sm text-silver-grey">Real-time Monitoring</div>
          <div
            className="text-xs"
            style={{ color: "rgba(0, 0, 0, 0.5)", marginTop: "0.25rem" }}
          >
            Continuous governance tracking
          </div>
        </div>
        <div className="text-center fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="text-2xl font-bold text-blue-electric">99.2%</div>
          <div className="text-sm text-silver-grey">ML Model Accuracy</div>
          <div
            className="text-xs"
            style={{ color: "rgba(0, 0, 0, 0.5)", marginTop: "0.25rem" }}
          >
            Validated on 50K+ samples
          </div>
        </div>
      </div>
    </div>
  );

  if (dashboardData.isLoading) {
    return (
      <div className="App">
        <DashboardHeader />
        <div className="app-main">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <DashboardHeader />
      <div className="app-main">
        {/* Welcome Section */}
        <div className="text-center mb-2xl">
          <h2 className="text-3xl font-bold gradient-text mb-md">
            Democratic Governance Insights
          </h2>
          <p className="text-lg mb-lg" style={{ color: "rgba(0, 0, 0, 0.7)" }}>
            Real-time analysis of trust, transparency, and civic engagement
            metrics
          </p>
          <div className="flex justify-center gap-md">
            <button
              className="glass-card p-md"
              style={{
                border: "none",
                background: "rgba(102, 126, 234, 0.2)",
                color: "rgba(0, 0, 0, 0.8)",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 300ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(102, 126, 234, 0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(102, 126, 234, 0.2)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              📊 Explore Analytics
            </button>
            <button
              className="glass-card p-md"
              style={{
                border: "none",
                background: "rgba(118, 75, 162, 0.2)",
                color: "rgba(0, 0, 0, 0.8)",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 300ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(118, 75, 162, 0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(118, 75, 162, 0.2)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              📈 View Reports
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Trust Metrics Grid */}
        <div className="dashboard-grid">
          {dashboardData.trustMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-xl mt-2xl">
          <div className="chart-container">
            <h3 className="chart-title">Trust Evolution Over Time</h3>
            <TrustTimeSeriesChart />
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Demographic Analysis</h3>
            <DemographicAnalysisChart />
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center mt-2xl p-lg"
          style={{ color: "var(--color-silver-grey)" }}
        >
          <p className="text-sm">
            Last updated: {dashboardData.lastUpdated} | Data sources: Democracy
            Radar, Transparency International, Civic Engagement Index
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrustMetricsDashboard;

import React, { useState, useEffect } from "react";
import Loading from "../common/Loading";
import MetricCard from "../GovernanceMetrics/MetricCard";
import TrustTrendChart from "../DataVisualization/TrustTrendChart";
import { fetchDashboardData } from "../../services/api";
import { DashboardData } from "../../types/dashboard";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch from the API
        // const data = await fetchDashboardData();

        // For now, we'll use mock data
        const mockData: DashboardData = {
          trustScore: 72.5,
          transparencyIndex: 68.3,
          participationRate: 45.2,
          sentimentScore: 0.65,
          trustTrend: [
            { date: "2023-01", value: 68.2 },
            { date: "2023-02", value: 69.5 },
            { date: "2023-03", value: 70.1 },
            { date: "2023-04", value: 71.3 },
            { date: "2023-05", value: 72.0 },
            { date: "2023-06", value: 72.5 },
          ],
          recentUpdates: [
            {
              id: 1,
              title: "Trust score increased by 2.3%",
              date: "2023-06-15",
            },
            {
              id: 2,
              title: "New governance data integrated",
              date: "2023-06-10",
            },
            {
              id: 3,
              title: "Sentiment analysis model updated",
              date: "2023-06-05",
            },
          ],
        };

        setDashboardData(mockData);
        setError(null);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>No data available</div>;
  }

  return (
    <div className="dashboard-container fade-in">
      <h1>Governance Transparency Dashboard</h1>
      <p className="dashboard-subtitle">
        Real-time insights into democratic governance metrics and sentiment
        analysis
      </p>

      <div className="dashboard-grid">
        <MetricCard
          title="Trust Score"
          value={dashboardData.trustScore}
          icon="🛡️"
          description="Overall trust in governance institutions"
          trend="up"
          trendValue={2.3}
        />
        <MetricCard
          title="Transparency Index"
          value={dashboardData.transparencyIndex}
          icon="👁️"
          description="Measure of governance transparency"
          trend="up"
          trendValue={1.5}
        />
        <MetricCard
          title="Participation Rate"
          value={dashboardData.participationRate}
          icon="🗳️"
          description="Citizen participation in governance"
          trend="down"
          trendValue={0.8}
        />
        <MetricCard
          title="Sentiment Score"
          value={dashboardData.sentimentScore * 100}
          icon="🔍"
          description="AI-analyzed public sentiment"
          trend="up"
          trendValue={5.2}
          format="percent"
        />
      </div>

      <div className="chart-container">
        <h2 className="chart-title">Trust Trend Analysis</h2>
        <TrustTrendChart data={dashboardData.trustTrend} />
      </div>

      <div className="recent-updates">
        <h2>Recent Updates</h2>
        <ul className="updates-list">
          {dashboardData.recentUpdates.map((update) => (
            <li key={update.id} className="update-item">
              <span className="update-date">{update.date}</span>
              <span className="update-title">{update.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;

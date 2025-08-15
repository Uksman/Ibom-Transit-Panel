import React, { useState, useEffect } from 'react';
import { ticketsAPI } from '../services/api';

const TicketManagement = () => {
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadTicketStats();
    loadRecentVerifications();
  }, [selectedDateRange]);

  const loadTicketStats = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getVerificationStats({
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate
      });
      setStats(response.data.data);
    } catch (err) {
      setError('Failed to load ticket statistics');
      console.error('Failed to load ticket stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentVerifications = async () => {
    try {
      // This would be an API endpoint to get recent verification logs
      // For now, we'll simulate some data
      const mockVerifications = [
        {
          id: '1',
          ticketId: 'TKT-123ABC',
          bookingNumber: 'BKG-456DEF',
          type: 'booking',
          verifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          verifiedBy: 'Conductor John',
          location: 'Lagos Terminal',
          busUsed: 'BUS-001',
          result: 'valid',
          passenger: 'John Doe'
        },
        {
          id: '2',
          ticketId: 'TKT-789GHI',
          bookingNumber: 'BKG-321JKL',
          type: 'booking',
          verifiedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          verifiedBy: 'Conductor Mary',
          location: 'Abuja Station',
          busUsed: 'BUS-002',
          result: 'invalid',
          passenger: 'Jane Smith',
          reason: 'Expired ticket'
        }
      ];
      setVerifications(mockVerifications);
    } catch (err) {
      console.error('Failed to load verifications:', err);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setSelectedDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleManualValidation = async (ticketId, action) => {
    try {
      await ticketsAPI.manualValidation(ticketId, {
        action,
        notes: `Manual ${action} from admin dashboard`
      });
      
      // Refresh data
      loadTicketStats();
      loadRecentVerifications();
      
      alert(`Ticket ${action}d successfully!`);
    } catch (err) {
      alert(`Failed to ${action} ticket: ${err.message}`);
    }
  };

  const renderStatsCard = (title, value, subtitle, color = 'blue') => (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-icon">
        <i className={`fas fa-${
          title.includes('Today') ? 'calendar-day' :
          title.includes('Valid') ? 'check-circle' :
          title.includes('Invalid') ? 'times-circle' :
          'chart-bar'
        }`}></i>
      </div>
      <div className="stats-content">
        <h3>{value}</h3>
        <p className="stats-title">{title}</p>
        {subtitle && <span className="stats-subtitle">{subtitle}</span>}
      </div>
    </div>
  );

  const renderDailyChart = () => {
    if (!stats?.dailyStats?.length) return null;

    return (
      <div className="chart-container">
        <h3>Daily Verification Trends</h3>
        <div className="simple-chart">
          {stats.dailyStats.map((day, index) => {
            const maxVerifications = Math.max(...stats.dailyStats.map(d => d.totalVerifications));
            const height = maxVerifications > 0 ? (day.totalVerifications / maxVerifications) * 100 : 0;
            
            return (
              <div key={day.date} className="chart-bar-container">
                <div 
                  className="chart-bar"
                  style={{ height: `${height}%` }}
                  title={`${day.date}: ${day.totalVerifications} verifications`}
                >
                  <div className="chart-bar-valid" style={{ 
                    height: `${day.totalVerifications > 0 ? (day.validVerifications / day.totalVerifications) * 100 : 0}%` 
                  }}></div>
                </div>
                <span className="chart-label">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTopConductors = () => {
    if (!stats?.overall?.topConductors?.length) return null;

    return (
      <div className="top-conductors">
        <h3>Top Performing Conductors</h3>
        <div className="conductor-list">
          {stats.overall.topConductors.map((conductor, index) => (
            <div key={conductor._id} className="conductor-item">
              <div className="conductor-rank">#{index + 1}</div>
              <div className="conductor-info">
                <div className="conductor-name">{conductor.conductorName || 'Unknown'}</div>
                <div className="conductor-stats">
                  <span className="verification-count">{conductor.verificationCount} verifications</span>
                  <span className="accuracy-rate">{conductor.accuracy?.toFixed(1) || 0}% accuracy</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVerificationLog = () => (
    <div className="verification-log">
      <div className="log-header">
        <h3>Recent Verification Logs</h3>
        <div className="log-filters">
          <input
            type="text"
            placeholder="Search by ticket ID or passenger..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Results</option>
            <option value="valid">Valid Only</option>
            <option value="invalid">Invalid Only</option>
          </select>
        </div>
      </div>
      
      <div className="log-table-container">
        <table className="log-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Booking</th>
              <th>Passenger</th>
              <th>Verified By</th>
              <th>Location</th>
              <th>Time</th>
              <th>Result</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {verifications
              .filter(v => {
                const matchesSearch = searchTerm === '' || 
                  v.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  v.passenger.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesFilter = filterType === 'all' || v.result === filterType;
                return matchesSearch && matchesFilter;
              })
              .map((verification) => (
                <tr key={verification.id}>
                  <td className="ticket-id">{verification.ticketId}</td>
                  <td>
                    <div className="booking-info">
                      <div className="booking-number">{verification.bookingNumber}</div>
                      <div className="booking-type">{verification.type}</div>
                    </div>
                  </td>
                  <td>{verification.passenger}</td>
                  <td>{verification.verifiedBy}</td>
                  <td>{verification.location}</td>
                  <td>{new Date(verification.verifiedAt).toLocaleString()}</td>
                  <td>
                    <span className={`result-badge result-${verification.result}`}>
                      {verification.result}
                      {verification.result === 'invalid' && verification.reason && (
                        <span className="result-reason"> - {verification.reason}</span>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleManualValidation(verification.ticketId, 'validate')}
                        className="action-btn validate-btn"
                        title="Mark as Valid"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        onClick={() => handleManualValidation(verification.ticketId, 'invalidate')}
                        className="action-btn invalidate-btn"
                        title="Mark as Invalid"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                      <button
                        onClick={() => handleManualValidation(verification.ticketId, 'reset')}
                        className="action-btn reset-btn"
                        title="Reset Verification"
                      >
                        <i className="fas fa-redo"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading ticket management dashboard...</p>
      </div>
    );
  }

  return (
    <div className="ticket-management">
      <div className="page-header">
        <h1>Ticket Management</h1>
        <div className="date-range-picker">
          <input
            type="date"
            value={selectedDateRange.startDate}
            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
            className="date-input"
          />
          <span>to</span>
          <input
            type="date"
            value={selectedDateRange.endDate}
            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Statistics Overview */}
      <div className="stats-overview">
        {renderStatsCard(
          'Today\'s Verifications',
          stats?.overall?.todayVerifications || 0,
          'Tickets scanned today',
          'blue'
        )}
        {renderStatsCard(
          'Weekly Valid Tickets',
          stats?.overall?.weeklyValidVerifications || 0,
          'Successfully verified',
          'green'
        )}
        {renderStatsCard(
          'Total Verifications',
          stats?.dailyStats?.reduce((sum, day) => sum + day.totalVerifications, 0) || 0,
          'In selected period',
          'orange'
        )}
        {renderStatsCard(
          'Average Accuracy',
          stats?.overall?.topConductors?.length > 0 
            ? `${(stats.overall.topConductors.reduce((sum, c) => sum + (c.accuracy || 0), 0) / stats.overall.topConductors.length).toFixed(1)}%`
            : '0%',
          'Verification accuracy',
          'purple'
        )}
      </div>

      {/* Charts and Analytics */}
      <div className="analytics-section">
        <div className="analytics-grid">
          <div className="analytics-card">
            {renderDailyChart()}
          </div>
          <div className="analytics-card">
            {renderTopConductors()}
          </div>
        </div>
      </div>

      {/* Verification Logs */}
      <div className="logs-section">
        {renderVerificationLog()}
      </div>

      <style jsx>{`
        .ticket-management {
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .date-range-picker {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .date-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .error-message {
          background: #fee;
          color: #c53030;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stats-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stats-card-blue { border-left: 4px solid #3b82f6; }
        .stats-card-green { border-left: 4px solid #10b981; }
        .stats-card-orange { border-left: 4px solid #f59e0b; }
        .stats-card-purple { border-left: 4px solid #8b5cf6; }

        .stats-icon {
          font-size: 24px;
          color: #6b7280;
          width: 40px;
          text-align: center;
        }

        .stats-content h3 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .stats-title {
          margin: 5px 0 0 0;
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .stats-subtitle {
          font-size: 12px;
          color: #9ca3af;
        }

        .analytics-section {
          margin-bottom: 30px;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .analytics-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .chart-container h3,
        .top-conductors h3 {
          margin: 0 0 20px 0;
          color: #1f2937;
        }

        .simple-chart {
          display: flex;
          align-items: end;
          gap: 8px;
          height: 200px;
          padding: 10px 0;
        }

        .chart-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .chart-bar {
          width: 100%;
          background: #e5e7eb;
          border-radius: 2px 2px 0 0;
          position: relative;
          min-height: 4px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .chart-bar:hover {
          opacity: 0.8;
        }

        .chart-bar-valid {
          background: #10b981;
          border-radius: 2px 2px 0 0;
          width: 100%;
          transition: height 0.3s ease;
        }

        .chart-label {
          font-size: 11px;
          color: #6b7280;
          text-align: center;
        }

        .conductor-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .conductor-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .conductor-rank {
          font-size: 18px;
          font-weight: 700;
          color: #6b7280;
          min-width: 30px;
        }

        .conductor-info {
          flex: 1;
        }

        .conductor-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .conductor-stats {
          display: flex;
          gap: 15px;
          font-size: 13px;
        }

        .verification-count {
          color: #3b82f6;
        }

        .accuracy-rate {
          color: #10b981;
        }

        .verification-log {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .log-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .log-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .log-filters {
          display: flex;
          gap: 10px;
        }

        .search-input,
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
        }

        .search-input {
          min-width: 200px;
        }

        .log-table-container {
          overflow-x: auto;
        }

        .log-table {
          width: 100%;
          border-collapse: collapse;
        }

        .log-table th,
        .log-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .log-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }

        .ticket-id {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #1f2937;
        }

        .booking-info {
          display: flex;
          flex-direction: column;
        }

        .booking-number {
          font-weight: 600;
          font-size: 13px;
        }

        .booking-type {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
        }

        .result-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .result-valid {
          background: #d1fae5;
          color: #065f46;
        }

        .result-invalid {
          background: #fee2e2;
          color: #991b1b;
        }

        .result-reason {
          font-weight: normal;
          opacity: 0.8;
        }

        .action-buttons {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          padding: 6px 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
        }

        .validate-btn {
          background: #d1fae5;
          color: #065f46;
        }

        .validate-btn:hover {
          background: #a7f3d0;
        }

        .invalidate-btn {
          background: #fee2e2;
          color: #991b1b;
        }

        .invalidate-btn:hover {
          background: #fecaca;
        }

        .reset-btn {
          background: #e5e7eb;
          color: #374151;
        }

        .reset-btn:hover {
          background: #d1d5db;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          gap: 15px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .stats-overview {
            grid-template-columns: 1fr;
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .log-filters {
            flex-direction: column;
          }

          .search-input {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketManagement;

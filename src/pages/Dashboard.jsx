import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { usersAPI, busesAPI, bookingsAPI, hiringsAPI } from "../services/api";
import { FaUsers, FaBus, FaTicketAlt, FaCaravan, FaSync } from "react-icons/fa";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuses: 0,
    totalBookings: 0,
    totalHirings: 0,
    activeBookings: 0,
    pendingHirings: 0,
    activeBuses: 0,
    revenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentHirings, setRecentHirings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const abortController = new AbortController();
    fetchDashboardData(abortController.signal);
    
    return () => {
      abortController.abort();
    };
  }, []);


  const fetchDashboardData = async (signal) => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        usersAPI.getAll({ limit: 1, signal }),
        busesAPI.getAll({ limit: 1, signal }),
        bookingsAPI.getAll({
          limit: 5,
          sortBy: "createdAt",
          sortDirection: "desc",
          signal,
        }),
        hiringsAPI.getAll({
          limit: 5,
          sortBy: "createdAt",
          sortDirection: "desc",
          signal,
        }),
        bookingsAPI.getAll({ status: "Confirmed", limit: 1, signal }),
        hiringsAPI.getAll({ status: "Pending", limit: 1, signal }),
        busesAPI.getAll({ status: "Active", limit: 1, signal }),
      ]);

      const [
        usersRes,
        busesRes,
        bookingsRes,
        hiringsRes,
        activeBookingsRes,
        pendingHiringsRes,
        activeBusesRes,
      ] = results;

      const getData = (result, key) =>
        result.status === "fulfilled" ? result.value.data[key] || 0 : 0;

      setStats({
        totalUsers: getData(usersRes, "pagination")?.total || 0,
        totalBuses: getData(busesRes, "pagination")?.total || 0,
        totalBookings: getData(bookingsRes, "pagination")?.total || 0,
        totalHirings: getData(hiringsRes, "pagination")?.total || 0,
        activeBookings: getData(activeBookingsRes, "pagination")?.total || 0,
        pendingHirings: getData(pendingHiringsRes, "pagination")?.total || 0,
        activeBuses: getData(activeBusesRes, "pagination")?.total || 0,
        revenue: 0,
      });
      setRecentBookings(
        bookingsRes.status === "fulfilled"
          ? bookingsRes.value.data.data || []
          : []
      );
      setRecentHirings(
        hiringsRes.status === "fulfilled"
          ? hiringsRes.value.data.data || []
          : []
      );

      const hasError = results.some((result) => result.status === "rejected");
      if (hasError) {
        setError("Some data failed to load. Please try again.");
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setError("Failed to fetch dashboard data");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Loading dashboard...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderContent>
          <div>
            <h1>Dashboard Overview</h1>
            <p>
              Welcome back! Here's what's happening with your bus booking system.
            </p>
          </div>
          {/* <RefreshButton onClick={() => fetchDashboardData()} disabled={loading}>
            <FaSync className={loading ? 'spinning' : ''} />
            Refresh
          </RefreshButton> */}
        </HeaderContent>
      </DashboardHeader>

      {error && (
        <ErrorMessage>
          <span>{error}</span>
          <RetryButton onClick={fetchDashboardData}>Retry</RetryButton>
        </ErrorMessage>
      )}

      <StatsGrid>
        <StatCard>
          <StatIcon>
            <FaUsers />
          </StatIcon>
          <StatContent>
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon>
            <FaBus />
          </StatIcon>
          <StatContent>
            <h3>{stats.totalBuses}</h3>
            <p>Total Buses</p>
            <small>{stats.activeBuses} active</small>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon>
            <FaTicketAlt />
          </StatIcon>
          <StatContent>
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
            <small>{stats.activeBookings} active</small>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon>
            <FaCaravan />
          </StatIcon>
          <StatContent>
            <h3>{stats.totalHirings}</h3>
            <p>Total Hirings</p>
            <small>{stats.pendingHirings} pending</small>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <ActivitiesSection>
        <ActivitiesGrid>
          <ActivityCard>
            <h2>Recent Bookings</h2>
            {recentBookings.length > 0 ? (
              <ActivityList>
                {recentBookings.map((booking) => (
                  <ActivityItem key={booking._id}>
                    <ActivityInfo>
                      <h4>#{booking.bookingNumber}</h4>
                      <p>{booking.user?.name || "Unknown User"}</p>
                      <ActivityDate>
                        {formatDate(booking.createdAt)}
                      </ActivityDate>
                    </ActivityInfo>
                    <ActivityStatus status={booking.status}>
                      {booking.status}
                    </ActivityStatus>
                  </ActivityItem>
                ))}
              </ActivityList>
            ) : (
              <NoData>No recent bookings</NoData>
            )}
          </ActivityCard>

          <ActivityCard>
            <h2>Recent Hirings</h2>
            {recentHirings.length > 0 ? (
              <ActivityList>
                {recentHirings.map((hiring) => (
                  <ActivityItem key={hiring._id}>
                    <ActivityInfo>
                      <h4>#{hiring.hiringNumber}</h4>
                      <p>{hiring.user?.name || "Unknown User"}</p>
                      <ActivityDate>
                        {formatDate(hiring.createdAt)}
                      </ActivityDate>
                    </ActivityInfo>
                    <ActivityStatus status={hiring.status}>
                      {hiring.status}
                    </ActivityStatus>
                  </ActivityItem>
                ))}
              </ActivityList>
            ) : (
              <NoData>No recent hirings</NoData>
            )}
          </ActivityCard>
        </ActivitiesGrid>
      </ActivitiesSection>
    </DashboardContainer>
  );
};

export default Dashboard;

const DashboardContainer = styled.div`
  padding: clamp(1rem, 4vw, 2rem);
  background: #f9fafb;
  min-height: 100vh;
  max-width: 1440px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(249, 115, 22, 0.05) 0%,
      transparent 60%
    );
    pointer-events: none;
  }
`;

const DashboardHeader = styled.div`
  margin-bottom: clamp(1.5rem, 5vw, 2.5rem);
  text-align: left;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  h1 {
    font-size: clamp(1.5rem, 5vw, 2rem);
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
    background: linear-gradient(to right, #fb923c, #f97316, #ea580c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #6b7280;
    font-size: clamp(0.9rem, 3vw, 1rem);
    margin: 0;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1rem);
  background: linear-gradient(to right, #fb923c, #f97316, #ea580c);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  touch-action: manipulation;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: linear-gradient(to right, #f97316, #ea580c, #d97706);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(249, 115, 22, 0.05) 0%,
      transparent 60%
    );
    pointer-events: none;
  }
`;

const Spinner = styled.div`
  width: clamp(2rem, 6vw, 2.5rem);
  height: clamp(2rem, 6vw, 2.5rem);
  border: 3px solid #f97316;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  color: #f97316;
  font-size: clamp(0.9rem, 3vw, 1.1rem);
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  background: rgba(254, 226, 226, 0.9);
  color: #dc2626;
  padding: clamp(0.75rem, 3vw, 1rem) clamp(1rem, 4vw, 1.5rem);
  border-radius: 0.5rem;
  margin-bottom: clamp(1.25rem, 4vw, 2rem);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  animation: slideIn 0.3s ease-out;
  backdrop-filter: blur(4px);

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
`;

const RetryButton = styled.button`
  padding: clamp(0.4rem, 2vw, 0.5rem) clamp(0.75rem, 3vw, 1rem);
  background: linear-gradient(to right, #fb923c, #f97316, #ea580c);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  touch-action: manipulation;

  &:hover {
    background: linear-gradient(to right, #f97316, #ea580c, #d97706);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(clamp(200px, 45vw, 250px), 1fr)
  );
  gap: clamp(1rem, 3vw, 1.5rem);
  margin-bottom: clamp(1.5rem, 5vw, 2.5rem);
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: clamp(1rem, 3vw, 1.5rem);
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(249, 115, 22, 0.2);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const StatIcon = styled.div`
  font-size: clamp(2rem, 6vw, 2.5rem);
  color: #f97316;
  margin-right: clamp(0.75rem, 3vw, 1.25rem);
`;

const StatContent = styled.div`
  h3 {
    margin: 0;
    font-size: clamp(1.5rem, 5vw, 2rem);
    font-weight: 700;
    color: #1f2937;
  }

  p {
    margin: 0.25rem 0 0 0;
    color: #f97316;
    font-weight: 600;
    font-size: clamp(0.9rem, 3vw, 1rem);
  }

  small {
    color: #6b7280;
    font-size: clamp(0.75rem, 2.5vw, 0.85rem);
  }
`;

const ActivitiesSection = styled.div`
  margin-top: clamp(1.5rem, 5vw, 2.5rem);
`;

const ActivitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(clamp(300px, 90vw, 400px), 1fr)
  );
  gap: clamp(1.25rem, 4vw, 2rem);
`;

const ActivityCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: clamp(1.25rem, 4vw, 1.75rem);
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  h2 {
    margin: 0 0 clamp(0.75rem, 3vw, 1.25rem);
    color: #1f2937;
    font-size: clamp(1.25rem, 4vw, 1.5rem);
    font-weight: 600;
    background: linear-gradient(to right, #fb923c, #f97316, #ea580c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 2vw, 0.75rem);
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(0.75rem, 3vw, 1rem);
  border-radius: 0.5rem;
  background: rgba(243, 244, 246, 0.5);
  transition: all 0.3s ease;
  min-height: 60px;

  &:hover {
    background: rgba(243, 244, 246, 1);
    transform: translateX(4px);
  }
`;

const ActivityInfo = styled.div`
  h4 {
    margin: 0;
    font-size: clamp(0.85rem, 2.5vw, 0.95rem);
    font-weight: 600;
    color: #1f2937;
  }

  p {
    margin: 0.25rem 0;
    color: #6b7280;
    font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  }
`;

const ActivityDate = styled.span`
  font-size: clamp(0.7rem, 2vw, 0.8rem);
  color: #9ca3af;
`;

const ActivityStatus = styled.span`
  padding: clamp(0.3rem, 1.5vw, 0.4rem) clamp(0.5rem, 2vw, 0.75rem);
  border-radius: 9999px;
  font-size: clamp(0.7rem, 2vw, 0.8rem);
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;

  ${({ status }) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return `
          background: #dcfce7;
          color: #15803d;
        `;
      case "pending":
        return `
          background: #fefce8;
          color: #b45309;
        `;
      case "cancelled":
        return `
          background: #fee2e2;
          color: #dc2626;
        `;
      case "active":
        return `
          background: #ffedd5;
          color: #f97316;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const NoData = styled.p`
  color: #9ca3af;
  text-align: center;
  padding: clamp(1.5rem, 5vw, 2rem);
  margin: 0;
  font-size: clamp(0.9rem, 3vw, 0.95rem);
`;

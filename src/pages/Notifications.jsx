import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaBell,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
  FaSearch,
  FaUsers,
  FaEnvelope,
  FaSms,
  FaBullhorn,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaTicketAlt,
  FaCreditCard,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import NotificationFilters from "../components/Notifications/NotificationFilters";
import NotificationDetailsModal from "../components/Notifications/NotificationDetailsModal";
import CreateNotificationModal from "../components/Notifications/CreateNotificationModal";

// Theme with orange as primary color
const theme = {
  light: {
    background: "#f9fafb",
    text: "#111827",
    secondaryText: "#6b7280",
    cardBg: "#ffffff",
    border: "#e5e7eb",
    hoverBg: "#f3f4f6",
    primary: "#f97316", // Orange
    primaryHover: "#ea580c", // Darker orange
    error: "#ef4444",
  },
  dark: {
    background: "#111827",
    text: "#ffffff",
    secondaryText: "#9ca3af",
    cardBg: "#1f2937",
    border: "#374151",
    hoverBg: "#374151",
    primary: "#fb923c", // Lighter orange for dark mode
    primaryHover: "#f97316", // Orange
    error: "#f87171",
  },
};

// Styled Components
const Container = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.background};
  min-height: 100vh;
  transition: background 0.3s ease-in-out;

  @media (min-width: 640px) {
    padding: 2rem;
  }
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;

  @media (min-width: 640px) {
    font-size: 1.875rem;
  }
`;

const SubTitle = styled.p`
  color: ${({ theme }) => theme.secondaryText};
  margin-top: 0.5rem;
  font-size: 0.875rem;

  @media (min-width: 640px) {
    font-size: 1rem;
  }
`;

const CreateButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  transition: background 0.2s;
  font-size: 0.875rem;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary};
  }

  @media (min-width: 640px) {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;

  @media (min-width: 640px) {
    padding: 1.5rem;
  }
`;

const StatIconWrapper = styled.div`
  padding: 0.75rem;
  border-radius: 9999px;
  background: ${({ color }) => `${color}1A`};
`;

const StatLabel = styled.p`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 0.875rem;
`;

const StatValue = styled.p`
  color: ${({ theme }) => theme.text};
  font-size: 1.25rem;
  font-weight: 700;

  @media (min-width: 640px) {
    font-size: 1.5rem;
  }
`;

const SearchFilterSection = styled.section`
  background: ${({ theme }) => theme.cardBg};
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  margin-bottom: 1.5rem;

  @media (min-width: 640px) {
    padding: 1.5rem;
  }
`;

const SearchFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: center;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.secondaryText};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 0.5rem;
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}33;
  }

  @media (min-width: 640px) {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    font-size: 1rem;
  }
`;

const TableSection = styled.section`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: ${({ theme }) => theme.border}33;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.secondaryText};
  text-transform: uppercase;

  @media (min-width: 640px) {
    padding: 1rem 1.5rem;
    font-size: 0.875rem;
  }
`;

const Tbody = styled.tbody`
  & > tr:nth-child(even) {
    background: ${({ theme }) => theme.border}1A;
  }
`;

const Tr = styled(motion.tr)`
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.hoverBg};
  }
`;

const Td = styled.td`
  padding: 1rem;

  @media (min-width: 640px) {
    padding: 1rem 1.5rem;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: center;
`;

const NotificationIcon = styled.div`
  margin-right: 0.75rem;
`;

const NotificationTitle = styled.p`
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  font-size: 0.875rem;

  @media (min-width: 640px) {
    font-size: 1rem;
  }
`;

const NotificationMessage = styled.p`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 0.75rem;
  max-width: 16rem;
  white-space: normal;
  word-break: break-word;

  @media (min-width: 640px) {
    font-size: 0.875rem;
    max-width: 20rem;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ theme, bg }) => bg || theme.border};
  color: ${({ theme, color }) => color || theme.text};
`;

const ChannelIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border-radius: 0.5rem;
  color: ${({ color }) => color};
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: ${({ hoverBg }) => hoverBg}1A;
    color: ${({ hoverColor }) => hoverColor};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ color }) => color}33;
  }
`;

const PaginationContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.border}33;
`;

const PaginationContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const PaginationText = styled.div`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 0.75rem;

  @media (min-width: 640px) {
    font-size: 0.875rem;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: ${({ theme, active }) => (active ? "#ffffff" : theme.text)};
  background: ${({ theme, active }) =>
    active ? theme.primary : "transparent"};
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.hoverBg};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 640px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

const ErrorToast = styled(motion.div)`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: ${({ theme }) => theme.error};
  color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
`;

const SkeletonRowWrapper = styled.tr`
  .skeleton {
    background: ${({ theme }) => theme.border};
    border-radius: 0.25rem;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

const SkeletonDiv = styled.div`
  height: ${({ height }) => height};
  width: ${({ width }) => width};
  background: ${({ theme }) => theme.border};
  border-radius: 0.25rem;
`;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    priority: "",
    status: "",
    dateRange: { from: "", to: "" },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    delivered: 0,
    byType: {},
    byCategory: {},
  });

  // Debug state change
  useEffect(() => {
    console.log("showCreateModal:", showCreateModal);
  }, [showCreateModal]);

  useEffect(() => {
    fetchNotifications();
    fetchNotificationStats();
  }, [currentPage, filters, searchTerm]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Add basic params
      queryParams.append('page', currentPage);
      queryParams.append('limit', itemsPerPage);
      
      // Add search term if exists
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      // Add filters if they have values
      if (filters.type) {
        queryParams.append('type', filters.type);
      }
      if (filters.category) {
        queryParams.append('category', filters.category);
      }
      if (filters.priority) {
        queryParams.append('priority', filters.priority);
      }
      if (filters.status) {
        queryParams.append('status', filters.status);
      }
      
      // Add date range if exists
      if (filters.dateRange.from) {
        queryParams.append('from', filters.dateRange.from);
      }
      if (filters.dateRange.to) {
        queryParams.append('to', filters.dateRange.to);
      }

      const response = await api.get(`/notifications/admin?${queryParams}`);
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setTotalPages(response.data.data.pagination.pages);
        setTotalNotifications(response.data.data.pagination.total);
      }
    } catch (err) {
      setError("Failed to fetch notifications");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const response = await api.get("/notifications/admin/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching notification stats:", err);
    }
  };

  const handleCreateNotification = async (notificationData) => {
    try {
      console.log('Creating notification with data:', notificationData);
      const response = await api.post("/notifications", notificationData);
      console.log('Notification creation response:', response.data);
      
      if (response.data.success) {
        setShowCreateModal(false);
        fetchNotifications();
        fetchNotificationStats();
        // Show success message
        setError(null);
        // You could add a success toast here
      } else {
        throw new Error(response.data.message || 'Failed to create notification');
      }
    } catch (err) {
      console.error("Error creating notification:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to create notification";
      setError(errorMessage);
      console.error('Full error details:', err.response?.data);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await api.delete(`/notifications/admin/${notificationId}`);
        fetchNotifications();
        fetchNotificationStats();
      } catch (err) {
        console.error("Error deleting notification:", err);
        setError("Failed to delete notification");
      }
    }
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
  };

  const getNotificationIcon = (type, category) => {
    switch (category) {
      case "booking":
        return <FaTicketAlt style={{ color: "#f97316" }} />;
      case "payment":
        return <FaCreditCard style={{ color: "#22c55e" }} />;
      case "alert":
        return <FaExclamationTriangle style={{ color: "#ef4444" }} />;
      case "promotional":
        return <FaBullhorn style={{ color: "#8b5cf6" }} />;
      case "system":
        return <FaInfoCircle style={{ color: "#6b7280" }} />;
      default:
        return <FaBell style={{ color: "#f97316" }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return { bg: "#fee2e2", color: "#dc2626" };
      case "high":
        return { bg: "#ffedd5", color: "#ea580c" };
      case "normal":
        return { bg: "#ffedd5", color: "#f97316" };
      case "low":
        return { bg: "#e5e7eb", color: "#6b7280" };
      default:
        return { bg: "#e5e7eb", color: "#6b7280" };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const SkeletonRow = () => (
    <SkeletonRowWrapper>
      <Td>
        <NotificationContent>
          <SkeletonDiv
            height="1.5rem"
            width="1.5rem"
            className="skeleton"
            style={{ marginRight: "0.75rem" }}
          />
          <div>
            <SkeletonDiv
              height="1rem"
              width="10rem"
              className="skeleton"
              style={{ marginBottom: "0.5rem" }}
            />
            <SkeletonDiv height="0.75rem" width="15rem" className="skeleton" />
          </div>
        </NotificationContent>
      </Td>
      <Td>
        <SkeletonDiv height="1rem" width="5rem" className="skeleton" />
      </Td>
      <Td>
        <SkeletonDiv height="1rem" width="5rem" className="skeleton" />
      </Td>
      <Td>
        <SkeletonDiv height="1rem" width="4rem" className="skeleton" />
      </Td>
      <Td>
        <SkeletonDiv height="1rem" width="6rem" className="skeleton" />
      </Td>
      <Td>
        <SkeletonDiv height="1rem" width="8rem" className="skeleton" />
      </Td>
      <Td>
        <SkeletonDiv height="1rem" width="6rem" className="skeleton" />
      </Td>
    </SkeletonRowWrapper>
  );

  return (
    <Container theme={theme.light}>
      <Header>
        <HeaderContent>
          <div>
            <Title theme={theme.light}>
              <FaBell
                style={{ marginRight: "0.75rem", color: theme.light.primary }}
              />
              Notification Management
            </Title>
            <SubTitle theme={theme.light}>
              Manage and send notifications to users
            </SubTitle>
          </div>
          <CreateButton
            theme={theme.light}
            onClick={() => {
              console.log("Opening Create Notification Modal");
              setShowCreateModal(true);
            }}
            aria-label="Create new notification"
          >
            <FaPlus style={{ marginRight: "0.5rem" }} />
            Create Notification
          </CreateButton>
        </HeaderContent>

        <StatsGrid>
          {[
            {
              icon: FaBell,
              label: "Total Notifications",
              value: stats.total,
              color: "#f97316",
            },
            {
              icon: FaEye,
              label: "Unread",
              value: stats.unread,
              color: "#f97316",
            },
            {
              icon: FaCheckCircle,
              label: "Delivered",
              value: stats.delivered,
              color: "#22c55e",
            },
            {
              icon: FaUsers,
              label: "Active Users",
              value: stats.activeUsers || 0,
              color: "#8b5cf6",
            },
          ].map((stat, index) => (
            <StatCard
              key={index}
              theme={theme.light}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <StatIconWrapper color={stat.color}>
                <stat.icon style={{ color: stat.color, fontSize: "1.25rem" }} />
              </StatIconWrapper>
              <div style={{ marginLeft: "1rem" }}>
                <StatLabel theme={theme.light}>{stat.label}</StatLabel>
                <StatValue theme={theme.light}>{stat.value}</StatValue>
              </div>
            </StatCard>
          ))}
        </StatsGrid>
      </Header>

      <SearchFilterSection theme={theme.light}>
        <SearchFilterContainer>
          <SearchWrapper>
            <SearchIcon theme={theme.light} />
            <SearchInput
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              theme={theme.light}
              aria-label="Search notifications"
            />
          </SearchWrapper>
          <NotificationFilters filters={filters} onFiltersChange={setFilters} />
        </SearchFilterContainer>
      </SearchFilterSection>

      <TableSection theme={theme.light}>
        {loading ? (
          <Table>
            <Thead theme={theme.light}>
              <tr>
                {[
                  "Notification",
                  "Type",
                  "Priority",
                  "Recipients",
                  "Status",
                  "Date",
                  "Actions",
                ].map((header) => (
                  <Th key={header} theme={theme.light}>
                    {header}
                  </Th>
                ))}
              </tr>
            </Thead>
            <Tbody>
              {[...Array(5)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </Tbody>
          </Table>
        ) : (
          <Table>
            <Thead theme={theme.light}>
              <tr>
                {[
                  "Notification",
                  "Type",
                  "Priority",
                  "Recipients",
                  "Status",
                  "Date",
                  "Actions",
                ].map((header) => (
                  <Th key={header} theme={theme.light}>
                    {header}
                  </Th>
                ))}
              </tr>
            </Thead>
            <Tbody>
              <AnimatePresence>
                {notifications.map((notification) => (
                  <Tr
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    theme={theme.light}
                  >
                    <Td>
                      <NotificationContent>
                        <NotificationIcon>
                          {getNotificationIcon(
                            notification.type,
                            notification.category
                          )}
                        </NotificationIcon>
                        <div>
                          <NotificationTitle theme={theme.light}>
                            {notification.title}
                          </NotificationTitle>
                          <NotificationMessage theme={theme.light}>
                            {notification.message}
                          </NotificationMessage>
                        </div>
                      </NotificationContent>
                    </Td>
                    <Td>
                      <Badge theme={theme.light}>
                        {notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge {...getPriorityColor(notification.priority)}>
                        {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                      </Badge>
                    </Td>
                    <Td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.875rem",
                          color: theme.light.secondaryText,
                        }}
                      >
                        <FaUsers style={{ marginRight: "0.25rem" }} />
                        {notification.recipientCount || 1}
                      </div>
                    </Td>
                    <Td>
                      <ChannelIcons>
                        {notification.channels?.email?.enabled && (
                          <FaEnvelope
                            style={{
                              fontSize: "0.875rem",
                              color: notification.channels.email.sent
                                ? "#22c55e"
                                : theme.light.secondaryText,
                            }}
                          />
                        )}
                        {notification.channels?.sms?.enabled && (
                          <FaSms
                            style={{
                              fontSize: "0.875rem",
                              color: notification.channels.sms.sent
                                ? "#22c55e"
                                : theme.light.secondaryText,
                            }}
                          />
                        )}
                        {notification.channels?.push?.enabled && (
                          <FaBell
                            style={{
                              fontSize: "0.875rem",
                              color: notification.channels.push.sent
                                ? "#22c55e"
                                : theme.light.secondaryText,
                            }}
                          />
                        )}
                      </ChannelIcons>
                    </Td>
                    <Td
                      style={{
                        fontSize: "0.875rem",
                        color: theme.light.secondaryText,
                      }}
                    >
                      {formatDate(notification.createdAt)}
                    </Td>
                    <Td>
                      <ActionButtons>
                        <ActionButton
                          color="#f97316"
                          hoverColor="#ea580c"
                          hoverBg="#f97316"
                          onClick={() => handleViewDetails(notification)}
                          title="View Details"
                          aria-label={`View details for ${notification.title}`}
                        >
                          <FaEye />
                        </ActionButton>
                        <ActionButton
                          color="#ef4444"
                          hoverColor="#b91c1c"
                          hoverBg="#ef4444"
                          onClick={() =>
                            handleDeleteNotification(notification._id)
                          }
                          title="Delete"
                          aria-label={`Delete ${notification.title}`}
                        >
                          <FaTrash />
                        </ActionButton>
                      </ActionButtons>
                    </Td>
                  </Tr>
                ))}
              </AnimatePresence>
            </Tbody>
          </Table>
        )}

        {totalPages > 1 && (
          <PaginationContainer theme={theme.light}>
            <PaginationContent>
              <PaginationText theme={theme.light}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalNotifications)} of{" "}
                {totalNotifications} notifications
              </PaginationText>
              <PaginationButtons>
                <PaginationButton
                  theme={theme.light}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  Previous
                </PaginationButton>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationButton
                    key={i + 1}
                    theme={theme.light}
                    active={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    aria-label={`Page ${i + 1}`}
                  >
                    {i + 1}
                  </PaginationButton>
                ))}
                <PaginationButton
                  theme={theme.light}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                </PaginationButton>
              </PaginationButtons>
            </PaginationContent>
          </PaginationContainer>
        )}
      </TableSection>

      <AnimatePresence>
        {error && (
          <ErrorToast
            theme={theme.light}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            role="alert"
          >
            <FaExclamationTriangle style={{ marginRight: "0.5rem" }} />
            {error}
            <button
              onClick={() => setError(null)}
              style={{ marginLeft: "1rem", color: "#ffffff" }}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </ErrorToast>
        )}
      </AnimatePresence>

      {showCreateModal && (
        <CreateNotificationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateNotification}
        />
      )}

      {showDetailsModal && selectedNotification && (
        <NotificationDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          notification={selectedNotification}
        />
      )}
    </Container>
  );
};

export default Notifications;

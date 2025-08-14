import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaEnvelope,
  FaSms,
  FaBell,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaUsers,
  FaLink,
  FaImage
} from 'react-icons/fa';

// Theme for consistency
const theme = {
  background: "#f9fafb",
  text: "#111827",
  secondaryText: "#6b7280",
  cardBg: "#ffffff",
  border: "#e5e7eb",
  hoverBg: "#f3f4f6",
  primary: "#f97316",
  primaryHover: "#ea580c",
  error: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
};

// Styled Components
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
  transition: opacity 0.3s ease-in-out;
`;

const ModalContainer = styled(motion.div)`
  background: ${theme.cardBg};
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 64rem;
  max-height: 90vh;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid ${theme.border};
  background: linear-gradient(to right, #4b5563, #374151);
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
`;

const CloseButton = styled.button`
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  &:hover {
    color: #e5e7eb;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Content = styled.div`
  overflow-y: auto;
  max-height: calc(90vh - 140px);
  padding: 1.5rem;
  background: ${theme.background};
  transition: background 0.3s ease-in-out;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  background: ${theme.cardBg};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${theme.background};
  border: 1px solid ${theme.border};
  border-radius: 0.5rem;
  padding: 1.5rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${theme.text};
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 9999px;
  border: 1px solid;
  background: ${({ bg }) => bg};
  color: ${({ color }) => color};
  border-color: ${({ color }) => color};
`;

const Text = styled.p`
  color: ${theme.text};
  font-size: 1rem;
  line-height: 1.5;
`;

const LinkText = styled.a`
  color: #2563eb;
  font-size: 0.875rem;
  &:hover {
    color: #1e40af;
  }
`;

const StatusCard = styled.div`
  background: ${theme.background};
  border-radius: 0.5rem;
  padding: 1rem;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.secondaryText};
  display: flex;
  align-items: center;
`;

const Value = styled.p`
  font-size: 0.875rem;
  color: ${theme.text};
  margin-top: 0.25rem;
`;

const MonoValue = styled(Value)`
  font-family: 'Courier New', Courier, monospace;
  background: ${theme.background};
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
`;

const StatusIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: ${({ color }) => color};
  font-size: 12px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid ${theme.border};
  background: ${theme.background};
`;

const CloseButtonFooter = styled.button`
  padding: 0.5rem 1.5rem;
  background: #4b5563;
  color: white;
  border-radius: 0.5rem;
  transition: all 0.2s;
  &:hover {
    background: #374151;
  }
`;

const NotificationDetailsModal = ({ isOpen, onClose, notification }) => {
  if (!isOpen || !notification) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (sent, enabled) => {
    if (!enabled) return <StatusIcon color="#9ca3af"><FaClock /></StatusIcon>;
    return sent ? <StatusIcon color="#22c55e"><FaCheckCircle /></StatusIcon> : <StatusIcon color="#f59e0b"><FaClock /></StatusIcon>;
  };

  const getStatusText = (sent, enabled) => {
    if (!enabled) return 'Disabled';
    return sent ? 'Sent' : 'Pending';
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: { bg: "#fee2e2", color: "#dc2626" },
      high: { bg: "#ffedd5", color: "#ea580c" },
      normal: { bg: "#dbeafe", color: "#2563eb" },
      low: { bg: "#f3f4f6", color: "#6b7280" }
    };
    return colors[priority] || colors.low;
  };

  const getCategoryBadge = (category) => {
    const colors = {
      booking: { bg: "#dbeafe", color: "#2563eb" },
      payment: { bg: "#dcfce7", color: "#16a34a" },
      alert: { bg: "#fee2e2", color: "#dc2626" },
      promotional: { bg: "#f3e8ff", color: "#9333ea" },
      system: { bg: "#f3f4f6", color: "#6b7280" }
    };
    return colors[category] || colors.system;
  };

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Header>
            <HeaderTitle>
              <FaEye style={{ fontSize: '1.25rem', marginRight: '0.75rem' }} />
              Notification Details
            </HeaderTitle>
            <CloseButton onClick={onClose}>
              <FaTimes size={20} />
            </CloseButton>
          </Header>

          <Content>
            <Grid>
              <Section>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <Title>{notification.title}</Title>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Badge
                        bg={getPriorityBadge(notification.priority).bg}
                        color={getPriorityBadge(notification.priority).color}
                      >
                        {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                      </Badge>
                      <Badge
                        bg={getCategoryBadge(notification.category).bg}
                        color={getCategoryBadge(notification.category).color}
                      >
                        {notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <Text>{notification.message}</Text>
                  {(notification.data?.actionUrl || notification.data?.imageUrl) && (
                    <Card style={{ marginTop: '1rem', background: theme.cardBg }}>
                      <Label style={{ marginBottom: '0.75rem' }}>Additional Data</Label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {notification.data?.actionUrl && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FaLink style={{ color: '#2563eb', marginRight: '0.5rem' }} />
                            <span style={{ fontSize: '0.875rem', color: theme.secondaryText, marginRight: '0.5rem' }}>
                              Action URL:
                            </span>
                            <LinkText href={notification.data.actionUrl} target="_blank" rel="noopener noreferrer">
                              {notification.data.actionUrl}
                            </LinkText>
                          </div>
                        )}
                        {notification.data?.imageUrl && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FaImage style={{ color: '#22c55e', marginRight: '0.5rem' }} />
                            <span style={{ fontSize: '0.875rem', color: theme.secondaryText, marginRight: '0.5rem' }}>
                              Image:
                            </span>
                            <LinkText href={notification.data.imageUrl} target="_blank" rel="noopener noreferrer">
                              View Image
                            </LinkText>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </Card>

                <Card>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.text, marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                    <FaBell style={{ marginRight: '0.5rem', color: '#2563eb' }} />
                    Delivery Status
                  </h3>
                  <StatusGrid>
                    <StatusCard>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <FaBell style={{ color: '#2563eb', marginRight: '0.5rem' }} />
                          <span style={{ fontWeight: 500, color: theme.text }}>Push</span>
                        </div>
                        {getStatusIcon(notification.channels?.push?.sent, notification.channels?.push?.enabled)}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: theme.secondaryText }}>
                        {getStatusText(notification.channels?.push?.sent, notification.channels?.push?.enabled)}
                      </p>
                      {notification.channels?.push?.sentAt && (
                        <p style={{ fontSize: '0.75rem', color: theme.secondaryText, marginTop: '0.25rem' }}>
                          {formatDate(notification.channels.push.sentAt)}
                        </p>
                      )}
                      {notification.channels?.push?.error && (
                        <p style={{ fontSize: '0.75rem', color: theme.error, marginTop: '0.25rem' }}>
                          Error: {notification.channels.push.error}
                        </p>
                      )}
                    </StatusCard>

                    <StatusCard>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <FaEnvelope style={{ color: '#22c55e', marginRight: '0.5rem' }} />
                          <span style={{ fontWeight: 500, color: theme.text }}>Email</span>
                        </div>
                        {getStatusIcon(notification.channels?.email?.sent, notification.channels?.email?.enabled)}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: theme.secondaryText }}>
                        {getStatusText(notification.channels?.email?.sent, notification.channels?.email?.enabled)}
                      </p>
                      {notification.channels?.email?.sentAt && (
                        <p style={{ fontSize: '0.75rem', color: theme.secondaryText, marginTop: '0.25rem' }}>
                          {formatDate(notification.channels.email.sentAt)}
                        </p>
                      )}
                      {notification.channels?.email?.error && (
                        <p style={{ fontSize: '0.75rem', color: theme.error, marginTop: '0.25rem' }}>
                          Error: {notification.channels.email.error}
                        </p>
                      )}
                    </StatusCard>

                    <StatusCard>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <FaSms style={{ color: '#8b5cf6', marginRight: '0.5rem' }} />
                          <span style={{ fontWeight: 500, color: theme.text }}>SMS</span>
                        </div>
                        {getStatusIcon(notification.channels?.sms?.sent, notification.channels?.sms?.enabled)}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: theme.secondaryText }}>
                        {getStatusText(notification.channels?.sms?.sent, notification.channels?.sms?.enabled)}
                      </p>
                      {notification.channels?.sms?.sentAt && (
                        <p style={{ fontSize: '0.75rem', color: theme.secondaryText, marginTop: '0.25rem' }}>
                          {formatDate(notification.channels.sms.sentAt)}
                        </p>
                      )}
                      {notification.channels?.sms?.error && (
                        <p style={{ fontSize: '0.75rem', color: theme.error, marginTop: '0.25rem' }}>
                          Error: {notification.channels.sms.error}
                        </p>
                      )}
                    </StatusCard>
                  </StatusGrid>
                </Card>
              </Section>

              <Section>
                <Card>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.text, marginBottom: '1rem' }}>
                    Basic Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <Label>ID</Label>
                      <MonoValue>{notification._id}</MonoValue>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Value>{notification.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Value>
                    </div>
                    <div>
                      <Label>
                        <FaUsers style={{ marginRight: '0.5rem', color: theme.secondaryText }} />
                        Recipients
                      </Label>
                      <Value>{notification.recipientCount || 1} users</Value>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.text, marginBottom: '1rem' }}>
                    Timeline
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <Label>
                        <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                        Created
                      </Label>
                      <Value>{formatDate(notification.createdAt)}</Value>
                    </div>
                    {notification.scheduledFor && (
                      <div>
                        <Label>
                          <FaClock style={{ marginRight: '0.5rem' }} />
                          Scheduled For
                        </Label>
                        <Value>{formatDate(notification.scheduledFor)}</Value>
                      </div>
                    )}
                    {notification.deliveredAt && (
                      <div>
                        <Label>
                          <FaCheckCircle style={{ marginRight: '0.5rem' }} />
                          Delivered
                        </Label>
                        <Value>{formatDate(notification.deliveredAt)}</Value>
                      </div>
                    )}
                    {notification.readAt && (
                      <div>
                        <Label>
                          <FaEye style={{ marginRight: '0.5rem' }} />
                          Read
                        </Label>
                        <Value>{formatDate(notification.readAt)}</Value>
                      </div>
                    )}
                    {notification.expiresAt && (
                      <div>
                        <Label>
                          <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                          Expires
                        </Label>
                        <Value>{formatDate(notification.expiresAt)}</Value>
                      </div>
                    )}
                  </div>
                </Card>

                {(notification.relatedBooking || notification.relatedBus || notification.relatedRoute) && (
                  <Card>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.text, marginBottom: '1rem' }}>
                      Related Data
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {notification.relatedBooking && (
                        <div>
                          <Label>Booking</Label>
                          <Value>{notification.relatedBooking.bookingNumber || notification.relatedBooking}</Value>
                        </div>
                      )}
                      {notification.relatedBus && (
                        <div>
                          <Label>Bus</Label>
                          <Value>{notification.relatedBus.busNumber || notification.relatedBus}</Value>
                        </div>
                      )}
                      {notification.relatedRoute && (
                        <div>
                          <Label>Route</Label>
                          <Value>
                            {notification.relatedRoute.name ||
                             `${notification.relatedRoute.origin} → ${notification.relatedRoute.destination}` ||
                             notification.relatedRoute}
                          </Value>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </Section>
            </Grid>
          </Content>

          <Footer>
            <CloseButtonFooter onClick={onClose}>
              Close
            </CloseButtonFooter>
          </Footer>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
};

export default NotificationDetailsModal;
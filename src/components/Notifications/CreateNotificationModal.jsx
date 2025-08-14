import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaUsers, 
  FaUser, 
  FaPaperPlane, 
  FaEnvelope, 
  FaSms, 
  FaBell,
  FaCalendarAlt,
  FaImage,
  FaExclamationTriangle,
  FaBullhorn,
  FaInfoCircle,
  FaSearch,
  FaList,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import api from '../../services/api';

// Color Palette
const colors = {
  primary: '#F97316', // Orange
  primaryDark: '#EA580C',
  secondary: '#1F2937',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  text: '#1F2937',
  textSecondary: '#6B7280',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6'
};

// Styled Components
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background: ${colors.surface};
  border-radius: 1.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 95%;
  max-width: 64rem;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid ${colors.border};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid ${colors.border};
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.surface};
  font-size: 1.25rem;
  font-weight: 600;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  color: ${colors.surface};
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
  background: none;
  border: none;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Content = styled.div`
  padding: 2rem;
  background: ${colors.background};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Grid = styled.div`
  display: grid;
  gap: 2rem;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Section = styled.div`
  background: ${colors.surface};
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid ${colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 1rem;
  border-bottom: 2px solid ${colors.primary}33;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${colors.text};
  margin-bottom: 0.5rem;
`;

const RadioGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid ${colors.border};
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background: ${colors.surface};
  position: relative;
  overflow: hidden;
  
  input[type="radio"]:checked ~ & {
    border-color: ${colors.primary};
    background: ${colors.primary}05;
    box-shadow: 0 0 0 3px ${colors.primary}20;
  }
  
  &:has(input[type="radio"]:checked) {
    border-color: ${colors.primary};
    background: ${colors.primary}05;
    box-shadow: 0 0 0 3px ${colors.primary}20;
  }
  
  &:hover {
    border-color: ${colors.primaryDark};
    background: ${colors.primary}05;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

const RadioIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: ${colors.primary}15;
  color: ${colors.primary};
  font-size: 1.125rem;
  flex-shrink: 0;
`;

const RadioContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const RadioTitle = styled.span`
  font-weight: 600;
  color: ${colors.text};
  font-size: 0.875rem;
`;

const RadioDescription = styled.span`
  font-size: 0.75rem;
  color: ${colors.textSecondary};
  margin-top: 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${colors.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: ${colors.surface};
  transition: all 0.2s ease-in-out;
  color: ${colors.text};
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primary}20;
  }
  &:hover {
    border-color: ${colors.primaryDark};
  }
  &::placeholder {
    color: ${colors.textSecondary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${colors.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: ${colors.surface};
  color: ${colors.text};
  transition: all 0.2s ease-in-out;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primary}20;
  }
  &:hover {
    border-color: ${colors.primaryDark};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${colors.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 120px;
  background: ${colors.surface};
  color: ${colors.text};
  transition: all 0.2s ease-in-out;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primary}20;
  }
  &:hover {
    border-color: ${colors.primaryDark};
  }
  &::placeholder {
    color: ${colors.textSecondary};
  }
`;

const UserSearchContainer = styled.div`
  border: 2px solid ${colors.border};
  border-radius: 0.75rem;
  padding: 1.25rem;
  max-height: 20rem;
  overflow-y: auto;
  background: ${colors.surface};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const UserItem = styled.label`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid ${colors.border};
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-bottom: 0.75rem;
  background: ${colors.background};
  
  &:hover {
    background: ${colors.primary}08;
    border-color: ${colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    accent-color: ${colors.primary};
    cursor: pointer;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SelectedUsers = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${colors.border};
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, ${colors.primary}15, ${colors.primary}25);
  color: ${colors.primaryDark};
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid ${colors.primary}30;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TagRemoveButton = styled.button`
  margin-left: 0.5rem;
  color: ${colors.primaryDark};
  background: none;
  border: none;
  font-size: 0.875rem;
  line-height: 1;
  cursor: pointer;
`;

const PreviewContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${colors.surface};
  border-radius: 1rem;
  border: 1px solid ${colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
`;

const PreviewCard = styled.div`
  background: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-top: 1px solid ${colors.border};
  background: ${colors.surface};
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  color: ${colors.text};
  background: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
  font-weight: 500;
  &:hover {
    background: ${colors.primary}10;
    border-color: ${colors.primaryDark};
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${colors.primary};
  color: ${colors.surface};
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border: none;
  &:hover {
    background: ${colors.primaryDark};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PriorityTag = styled.span`
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  ${({ priority }) => {
    switch (priority) {
      case 'urgent':
        return `background: ${colors.error}20; color: ${colors.error};`;
      case 'high':
        return `background: ${colors.warning}20; color: ${colors.warning};`;
      case 'normal':
        return `background: ${colors.primary}20; color: ${colors.primaryDark};`;
      default:
        return `background: ${colors.border}; color: ${colors.textSecondary};`;
    }
  }}
`;

const ErrorMessage = styled.p`
  color: ${colors.error};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid ${colors.border};
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background: ${colors.surface};
  position: relative;
  
  input[type="checkbox"]:checked ~ & {
    border-color: ${colors.primary};
    background: ${colors.primary}05;
    box-shadow: 0 0 0 3px ${colors.primary}20;
  }
  
  &:has(input[type="checkbox"]:checked) {
    border-color: ${colors.primary};
    background: ${colors.primary}05;
    box-shadow: 0 0 0 3px ${colors.primary}20;
  }
  
  &:hover {
    border-color: ${colors.primaryDark};
    background: ${colors.primary}05;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

const CheckboxIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: ${props => props.bgColor || colors.primary}15;
  color: ${props => props.iconColor || colors.primary};
  font-size: 1.125rem;
  flex-shrink: 0;
`;

const CheckboxContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const CheckboxTitle = styled.span`
  font-weight: 600;
  color: ${colors.text};
  font-size: 0.875rem;
`;

const CheckboxDescription = styled.span`
  font-size: 0.75rem;
  color: ${colors.textSecondary};
  margin-top: 0.25rem;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  background: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${colors.text};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: ${colors.primary}10;
    border-color: ${colors.primary};
  }
  
  span {
    flex: 1;
    text-align: left;
    margin-left: 0.5rem;
  }
`;

const CreateNotificationModal = ({ isOpen, onClose, onSubmit }) => {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      recipientType: 'all',
      recipients: [],
      title: '',
      message: '',
      type: 'general',
      category: 'system',
      priority: 'normal',
      channels: {
        push: true,
        email: false,
        sms: false
      },
      scheduledFor: '',
      data: {
        actionUrl: '',
        imageUrl: ''
      }
    }
  });

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSearch, setShowSearch] = useState(true); // Toggle between search and simple list

  const recipientType = watch('recipientType');
  const selectedType = watch('type');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (recipientType === 'all') {
      setSelectedUsers([]);
    }
  }, [recipientType]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const token = localStorage.getItem('token');
      console.log('Auth token available:', !!token);
      if (token) {
        console.log('Token preview:', token.substring(0, 20) + '...');
      }
      const response = await api.get('/users');
      console.log('API Response:', response.data);
      
      // Handle different response structures
      if (response.data.success) {
        setUsers(response.data.data || []);
      } else if (response.data.status === 'success') {
        setUsers(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.warn('Unexpected API response structure:', response.data);
        setUsers([]);
      }
      
      console.log('Users set:', response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.response?.data);
      setUsers([]);
    }
  };

  const handleUserSelect = (user) => {
    const isSelected = selectedUsers.find(u => u._id === user._id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const onFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Build proper notification data structure
      const notificationData = {
        title: data.title,
        message: data.message,
        type: data.type,
        category: data.category,
        priority: data.priority || 'normal',
        channels: {
          push: { enabled: data.channels?.push || false },
          email: { enabled: data.channels?.email || false },
          sms: { enabled: data.channels?.sms || false }
        },
        data: {
          actionUrl: data.data?.actionUrl || '',
          imageUrl: data.data?.imageUrl || ''
        },
        scheduledFor: data.scheduledFor || undefined
      };

      // Handle recipients based on type
      if (recipientType === 'all') {
        notificationData.recipients = 'all';
        notificationData.recipientRole = 'all';
      } else if (recipientType === 'role') {
        notificationData.recipients = 'all';
        notificationData.recipientRole = data.roleType || 'client';
      } else if (recipientType === 'specific') {
        notificationData.recipients = selectedUsers.map(u => u._id);
        notificationData.recipientRole = 'client';
      }

      console.log('Sending notification data:', notificationData);
      await onSubmit(notificationData);
      reset();
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error('Error creating notification:', error);
      // Show error to user
      alert('Failed to create notification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const notificationTypes = [
    { value: 'booking_confirmed', label: 'Booking Confirmed', category: 'booking' },
    { value: 'booking_cancelled', label: 'Booking Cancelled', category: 'booking' },
    { value: 'booking_reminder', label: 'Booking Reminder', category: 'booking' },
    { value: 'payment_successful', label: 'Payment Successful', category: 'payment' },
    { value: 'payment_failed', label: 'Payment Failed', category: 'payment' },
    { value: 'refund_processed', label: 'Refund Processed', category: 'payment' },
    { value: 'bus_delayed', label: 'Bus Delayed', category: 'alert' },
    { value: 'bus_cancelled', label: 'Bus Cancelled', category: 'alert' },
    { value: 'route_updated', label: 'Route Updated', category: 'system' },
    { value: 'promotional', label: 'Promotional', category: 'promotional' },
    { value: 'system_maintenance', label: 'System Maintenance', category: 'system' },
    { value: 'security_alert', label: 'Security Alert', category: 'alert' },
    { value: 'general', label: 'General', category: 'system' }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'promotional':
        return <FaBullhorn style={{ color: colors.warning }} />;
      case 'security_alert':
      case 'bus_delayed':
      case 'bus_cancelled':
        return <FaExclamationTriangle style={{ color: colors.error }} />;
      default:
        return <FaInfoCircle style={{ color: colors.primary }} />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Header>
            <HeaderTitle>
              <FaPaperPlane />
              Create Notification
            </HeaderTitle>
            <CloseButton onClick={onClose}>
              <FaTimes size={20} />
            </CloseButton>
          </Header>

          <Content>
            <Form onSubmit={handleSubmit(onFormSubmit)}>
              <Grid>
                <Section>
                  <SectionTitle>
                    <span role="img" aria-label="content">📝</span>
                    Content & Recipients
                  </SectionTitle>
                  <Label>Recipients</Label>
                  <RadioGroup>
                    <RadioLabel>
                      <Input type="radio" value="all" {...register('recipientType')} />
                      <RadioIcon>
                        <FaUsers />
                      </RadioIcon>
                      <RadioContent>
                        <RadioTitle>All Users</RadioTitle>
                        <RadioDescription>Send to all registered users</RadioDescription>
                      </RadioContent>
                    </RadioLabel>
                    <RadioLabel>
                      <Input type="radio" value="role" {...register('recipientType')} />
                      <RadioIcon>
                        <FaUser />
                      </RadioIcon>
                      <RadioContent>
                        <RadioTitle>By Role</RadioTitle>
                        <RadioDescription>Send to specific user roles</RadioDescription>
                      </RadioContent>
                    </RadioLabel>
                    <RadioLabel>
                      <Input type="radio" value="specific" {...register('recipientType')} />
                      <RadioIcon>
                        <FaUser />
                      </RadioIcon>
                      <RadioContent>
                        <RadioTitle>Specific Users</RadioTitle>
                        <RadioDescription>Choose individual users</RadioDescription>
                      </RadioContent>
                    </RadioLabel>
                  </RadioGroup>

                  {recipientType === 'role' && (
                    <Select {...register('roleType')}>
                      <option value="client">Clients</option>
                      <option value="admin">Admins</option>
                    </Select>
                  )}

                  {recipientType === 'specific' && (
                    <div>
                      <ToggleButton onClick={() => setShowSearch(!showSearch)} type="button">
                        {showSearch ? <FaSearch /> : <FaList />}
                        <span>{showSearch ? 'Using Search Mode' : 'Using List Mode'}</span>
                        {showSearch ? <FaToggleOn style={{ color: colors.primary }} /> : <FaToggleOff style={{ color: colors.textSecondary }} />}
                      </ToggleButton>
                      <UserSearchContainer>
                        {showSearch && (
                          <Input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                          />
                        )}
                        <div style={{ marginTop: showSearch ? '0.75rem' : '0' }}>
                          {users.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: colors.textSecondary }}>
                              <p>No users available. Loading...</p>
                            </div>
                          ) : (showSearch ? filteredUsers : users).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: colors.textSecondary }}>
                              <p>No users found{showSearch ? ' for your search' : ''}.</p>
                            </div>
                          ) : (
                            (showSearch ? filteredUsers : users).map(user => (
                              <UserItem key={user._id || user.id}>
                                <Input
                                  type="checkbox"
                                  checked={selectedUsers.find(u => (u._id || u.id) === (user._id || user.id)) ? true : false}
                                  onChange={() => handleUserSelect(user)}
                                />
                                <div style={{ marginLeft: '0.75rem' }}>
                                  <p style={{ fontWeight: 500, color: colors.text }}>{user.name}</p>
                                  <p style={{ fontSize: '0.875rem', color: colors.textSecondary }}>{user.email}</p>
                                </div>
                              </UserItem>
                            ))
                          )}
                        </div>
                        {selectedUsers.length > 0 && (
                          <SelectedUsers>
                            <p style={{ fontSize: '0.875rem', color: colors.textSecondary, marginBottom: '0.5rem' }}>
                              Selected ({selectedUsers.length}):
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {selectedUsers.map(user => (
                                <Tag key={user._id}>
                                  {user.name}
                                  <TagRemoveButton
                                    type="button"
                                    onClick={() => handleUserSelect(user)}
                                  >
                                    ×
                                  </TagRemoveButton>
                                </Tag>
                              ))}
                            </div>
                          </SelectedUsers>
                        )}
                      </UserSearchContainer>
                    </div>
                  )}

                  <div>
                    <Label>Title *</Label>
                    <Input
                      type="text"
                      {...register('title', { required: 'Title is required' })}
                      placeholder="Enter notification title"
                    />
                    {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
                  </div>

                  <div>
                    <Label>Message *</Label>
                    <TextArea
                      {...register('message', { required: 'Message is required' })}
                      rows={4}
                      placeholder="Enter notification message"
                    />
                    {errors.message && <ErrorMessage>{errors.message.message}</ErrorMessage>}
                  </div>
                </Section>

                <Section>
                  <SectionTitle>
                    <span role="img" aria-label="settings">⚙️</span>
                    Settings & Delivery
                  </SectionTitle>
                  <div>
                    <Label>Type</Label>
                    <Select
                      {...register('type')}
                      onChange={(e) => {
                        const selectedType = notificationTypes.find(t => t.value === e.target.value);
                        if (selectedType) {
                          setValue('category', selectedType.category);
                        }
                      }}
                    >
                      {notificationTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select {...register('priority')}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Select>
                  </div>

                  <div>
                    <Label>Delivery Channels</Label>
                    <CheckboxGroup>
                      <CheckboxLabel>
                        <Input type="checkbox" {...register('channels.push')} />
                        <CheckboxIcon iconColor={colors.primary} bgColor={`${colors.primary}15`}>
                          <FaBell />
                        </CheckboxIcon>
                        <CheckboxContent>
                          <CheckboxTitle>Push Notification</CheckboxTitle>
                          <CheckboxDescription>Send via in-app notification</CheckboxDescription>
                        </CheckboxContent>
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <Input type="checkbox" {...register('channels.email')} />
                        <CheckboxIcon iconColor={colors.success} bgColor={`${colors.success}15`}>
                          <FaEnvelope />
                        </CheckboxIcon>
                        <CheckboxContent>
                          <CheckboxTitle>Email</CheckboxTitle>
                          <CheckboxDescription>Send to user's email address</CheckboxDescription>
                        </CheckboxContent>
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <Input type="checkbox" {...register('channels.sms')} />
                        <CheckboxIcon iconColor={colors.info} bgColor={`${colors.info}15`}>
                          <FaSms />
                        </CheckboxIcon>
                        <CheckboxContent>
                          <CheckboxTitle>SMS</CheckboxTitle>
                          <CheckboxDescription>Send to user's phone number</CheckboxDescription>
                        </CheckboxContent>
                      </CheckboxLabel>
                    </CheckboxGroup>
                  </div>

                  <div>
                    <Label>
                      <FaCalendarAlt />
                      Schedule For (Optional)
                    </Label>
                    <Input type="datetime-local" {...register('scheduledFor')} />
                  </div>

                  <div>
                    <Label>Action URL (Optional)</Label>
                    <Input
                      type="url"
                      {...register('data.actionUrl')}
                      placeholder="https://example.com/action"
                    />
                  </div>

                  <div>
                    <Label>
                      <FaImage />
                      Image URL (Optional)
                    </Label>
                    <Input
                      type="url"
                      {...register('data.imageUrl')}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </Section>
              </Grid>

              <PreviewContainer>
                <SectionTitle>
                  <span role="img" aria-label="preview">👀</span>
                  Preview
                </SectionTitle>
                <PreviewCard>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ marginTop: '0.25rem' }}>
                      {getTypeIcon(selectedType)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 500, color: colors.text }}>
                        {watch('title') || 'Notification title'}
                      </h4>
                      <p style={{ color: colors.textSecondary, fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {watch('message') || 'Notification message will appear here'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', gap: '0.5rem' }}>
                        <PriorityTag priority={watch('priority')}>
                          {watch('priority') || 'normal'}
                        </PriorityTag>
                        <span style={{ fontSize: '0.75rem', color: colors.textSecondary }}>Just now</span>
                      </div>
                    </div>
                  </div>
                </PreviewCard>
              </PreviewContainer>
            </Form>
          </Content>

          <Footer>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              {recipientType === 'all' ? 'Sending to all users' :
               recipientType === 'role' ? `Sending to ${watch('roleType') || 'selected role'}` :
               `Sending to ${selectedUsers.length} selected users`}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <CancelButton type="button" onClick={onClose}>
                Cancel
              </CancelButton>
              <SubmitButton onClick={handleSubmit(onFormSubmit)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div style={{
                      animation: 'spin 1s linear infinite',
                      borderRadius: '50%',
                      height: '1rem',
                      width: '1rem',
                      border: '2px solid transparent',
                      borderBottomColor: colors.surface,
                      marginRight: '0.5rem'
                    }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Notification
                  </>
                )}
              </SubmitButton>
            </div>
          </Footer>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
};

export default CreateNotificationModal;
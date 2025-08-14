import React, { useState } from 'react';
import { FaFilter, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

// Theme for consistency
const theme = {
  background: '#f9fafb',
  text: '#111827',
  secondaryText: '#6b7280',
  border: '#e5e7eb',
  hoverBg: '#f3f4f6',
  primary: '#2563eb',
  primaryHover: '#1e40af',
  active: '#f97316', // Active state
  activeHover: '#ea580c', // Hover on active state
  blueLight: '#dbeafe',
  blueText: '#1e40af',
  greenLight: '#dcfce7',
  greenText: '#16a34a',
  yellowLight: '#fefce8',
  yellowText: '#ca8a04',
  purpleLight: '#f3e8ff',
  purpleText: '#9333ea',
  grayLight: '#f3f4f6',
  grayText: '#374151',
};

// Styled Components
const Container = styled.div`
  position: relative;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid ${({ hasActiveFilters }) => (hasActiveFilters ? theme.primary : theme.border)};
  border-radius: 0.5rem;
  background: ${({ hasActiveFilters }) => (hasActiveFilters ? theme.blueLight : 'white')};
  color: ${({ hasActiveFilters }) => (hasActiveFilters ? theme.primary : theme.text)};
  transition: all 0.2s;
  &:hover {
    background: ${theme.hoverBg};
  }
`;

const FilterCount = styled.span`
  margin-left: 0.5rem;
  background: ${theme.primary};
  color: white;
  font-size: 0.75rem;
  border-radius: 9999px;
  padding: 0.25rem 0.5rem;
`;

const FilterPanel = styled(motion.div)`
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  width: 24rem;
  background: white;
  border: 1px solid ${theme.border};
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.text};
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ClearButton = styled.button`
  font-size: 0.875rem;
  color: ${theme.secondaryText};
  &:hover {
    color: ${theme.text};
  }
`;

const CloseButton = styled.button`
  color: ${theme.secondaryText};
  &:hover {
    color: ${theme.text};
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.text};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${theme.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const DateLabel = styled.label`
  font-size: 0.75rem;
  color: ${theme.secondaryText};
  margin-bottom: 0.25rem;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${theme.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

const ActiveFilters = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${theme.border};
`;

const ActiveFiltersTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.text};
  margin-bottom: 0.5rem;
`;

const FilterTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FilterTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 9999px;
  background: ${({ bg }) => bg};
  color: ${({ color }) => color};
`;

const RemoveFilterButton = styled.button`
  margin-left: 0.25rem;
  color: ${({ color }) => color};
  &:hover {
    color: ${({ hoverColor }) => hoverColor};
  }
`;

const NotificationFilters = ({ filters, onFiltersChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateRangeChange = (type, value) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: value
      }
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: '',
      category: '',
      priority: '',
      status: '',
      dateRange: { from: '', to: '' }
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (typeof value === 'object') {
      return Object.values(value).some(v => v !== '');
    }
    return value !== '';
  });

  return (
    <Container>
      <FilterButton
        onClick={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
      >
        <FaFilter style={{ marginRight: '0.5rem' }} />
        Filters
        {hasActiveFilters && (
          <FilterCount>
            {Object.values(filters).filter(value => {
              if (typeof value === 'object') {
                return Object.values(value).some(v => v !== '');
              }
              return value !== '';
            }).length}
          </FilterCount>
        )}
      </FilterButton>

      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Header>
              <Title>Filters</Title>
              <ButtonGroup>
                {hasActiveFilters && (
                  <ClearButton onClick={clearFilters}>
                    Clear All
                  </ClearButton>
                )}
                <CloseButton onClick={() => setShowFilters(false)}>
                  <FaTimes />
                </CloseButton>
              </ButtonGroup>
            </Header>

            <FiltersContainer>
              <FilterSection>
                <Label>Type</Label>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="booking_confirmed">Booking Confirmed</option>
                  <option value="booking_cancelled">Booking Cancelled</option>
                  <option value="booking_reminder">Booking Reminder</option>
                  <option value="payment_successful">Payment Successful</option>
                  <option value="payment_failed">Payment Failed</option>
                  <option value="refund_processed">Refund Processed</option>
                  <option value="bus_delayed">Bus Delayed</option>
                  <option value="bus_cancelled">Bus Cancelled</option>
                  <option value="route_updated">Route Updated</option>
                  <option value="promotional">Promotional</option>
                  <option value="system_maintenance">System Maintenance</option>
                  <option value="security_alert">Security Alert</option>
                  <option value="general">General</option>
                </Select>
              </FilterSection>

              <FilterSection>
                <Label>Category</Label>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="booking">Booking</option>
                  <option value="payment">Payment</option>
                  <option value="system">System</option>
                  <option value="promotional">Promotional</option>
                  <option value="alert">Alert</option>
                </Select>
              </FilterSection>

              <FilterSection>
                <Label>Priority</Label>
                <Select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </FilterSection>

              <FilterSection>
                <Label>Delivery Status</Label>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="delivered">Delivered</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </Select>
              </FilterSection>

              <FilterSection>
                <Label>
                  <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                  Date Range
                </Label>
                <DateGrid>
                  <div>
                    <DateLabel>From</DateLabel>
                    <DateInput
                      type="date"
                      value={filters.dateRange.from}
                      onChange={(e) => handleDateRangeChange('from', e.target.value)}
                    />
                  </div>
                  <div>
                    <DateLabel>To</DateLabel>
                    <DateInput
                      type="date"
                      value={filters.dateRange.to}
                      onChange={(e) => handleDateRangeChange('to', e.target.value)}
                    />
                  </div>
                </DateGrid>
              </FilterSection>
            </FiltersContainer>

            {hasActiveFilters && (
              <ActiveFilters>
                <ActiveFiltersTitle>Active Filters:</ActiveFiltersTitle>
                <FilterTags>
                  {filters.type && (
                    <FilterTag bg={theme.blueLight} color={theme.blueText}>
                      Type: {filters.type.replace('_', ' ')}
                      <RemoveFilterButton
                        color={theme.blueText}
                        hoverColor={theme.primary}
                        onClick={() => handleFilterChange('type', '')}
                      >
                        ×
                      </RemoveFilterButton>
                    </FilterTag>
                  )}
                  {filters.category && (
                    <FilterTag bg={theme.greenLight} color={theme.greenText}>
                      Category: {filters.category}
                      <RemoveFilterButton
                        color={theme.greenText}
                        hoverColor={theme.greenText}
                        onClick={() => handleFilterChange('category', '')}
                      >
                        ×
                      </RemoveFilterButton>
                    </FilterTag>
                  )}
                  {filters.priority && (
                    <FilterTag bg={theme.yellowLight} color={theme.yellowText}>
                      Priority: {filters.priority}
                      <RemoveFilterButton
                        color={theme.yellowText}
                        hoverColor={theme.yellowText}
                        onClick={() => handleFilterChange('priority', '')}
                      >
                        ×
                      </RemoveFilterButton>
                    </FilterTag>
                  )}
                  {filters.status && (
                    <FilterTag bg={theme.purpleLight} color={theme.purpleText}>
                      Status: {filters.status}
                      <RemoveFilterButton
                        color={theme.purpleText}
                        hoverColor={theme.purpleText}
                        onClick={() => handleFilterChange('status', '')}
                      >
                        ×
                      </RemoveFilterButton>
                    </FilterTag>
                  )}
                  {(filters.dateRange.from || filters.dateRange.to) && (
                    <FilterTag bg={theme.grayLight} color={theme.grayText}>
                      Date: {filters.dateRange.from || '...'} - {filters.dateRange.to || '...'}
                      <RemoveFilterButton
                        color={theme.grayText}
                        hoverColor={theme.text}
                        onClick={() => {
                          handleDateRangeChange('from', '');
                          handleDateRangeChange('to', '');
                        }}
                      >
                        ×
                      </RemoveFilterButton>
                    </FilterTag>
                  )}
                </FilterTags>
              </ActiveFilters>
            )}
          </FilterPanel>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default NotificationFilters;
import React, { useState, useEffect } from 'react';
import { bookingsAPI, routesAPI, busesAPI, usersAPI } from '../services/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    user: '',
    route: '',
    bus: '',
    departureDate: '',
    returnDate: '',
    bookingType: 'One-Way',
    passengers: [{
      name: '',
      age: '',
      gender: 'Male',
      seatNumber: '',
      passengerType: 'Adult'
    }],
    selectedSeats: {
      outbound: [],
      return: []
    },
    totalFare: '',
    status: 'Pending'
  });

  const statuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No-Show', 'Refunded'];

  useEffect(() => {
    fetchBookings();
    fetchRoutes();
    fetchBuses();
    fetchUsers();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await routesAPI.getAll();
      setRoutes(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await busesAPI.getAll();
      setBuses(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch buses:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.data?.users || response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      
      const response = await bookingsAPI.getAll(params);
      setBookings(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.log("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchBookings();
  };

  const handleOpenModal = (booking = null) => {
    setEditingBooking(booking);
    setFormData({
      user: booking?.user?._id || '',
      route: booking?.route?._id || '',
      bus: booking?.bus?._id || '',
      departureDate: booking?.departureDate ? booking.departureDate.split('T')[0] : '',
      returnDate: booking?.returnDate ? booking.returnDate.split('T')[0] : '',
      bookingType: booking?.bookingType || 'One-Way',
      passengers: booking?.passengers || [{
        name: '',
        age: '',
        gender: 'Male',
        seatNumber: '',
        passengerType: 'Adult'
      }],
      selectedSeats: {
        outbound: booking?.selectedSeats?.outbound || [],
        return: booking?.selectedSeats?.return || []
      },
      totalFare: booking?.totalFare || '',
      status: booking?.status || 'Pending'
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBooking(null);
    setError('');
  };

  // Get buses filtered by the selected route
  const getAvailableBuses = () => {
    if (!formData.route) return buses;
    
    const selectedRoute = routes.find(route => route._id === formData.route);
    if (!selectedRoute) return buses;

    // If route has a specific bus assigned, return only that bus
    if (selectedRoute.bus) {
      const routeBus = buses.find(bus => bus._id === selectedRoute.bus._id || bus._id === selectedRoute.bus);
      return routeBus ? [routeBus] : buses;
    }
    
    // Otherwise return all active buses
    return buses.filter(bus => bus.status === 'Active');
  };

  // Calculate total fare based on route, passengers, and trip type
  const calculateTotalFare = () => {
    if (!formData.route || !formData.passengers.length) return 0;
    
    const selectedRoute = routes.find(route => route._id === formData.route);
    if (!selectedRoute || !selectedRoute.baseFare) return 0;

    let totalFare = selectedRoute.baseFare * formData.passengers.length;
    
    // Apply round trip pricing (double the fare)
    if (formData.bookingType === 'Round-Trip') {
      totalFare *= 2;
    }

    return Math.round(totalFare * 100) / 100; // Round to 2 decimal places
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    
    // If route changes, clear bus selection and calculate fare
    if (name === 'route') {
      updatedFormData.bus = '';
      updatedFormData.totalFare = '';
    }
    
    // If booking type changes, recalculate fare
    if (name === 'bookingType') {
      updatedFormData.totalFare = '';
    }
    
    setFormData(updatedFormData);
    
    // Auto-calculate fare after state update
    setTimeout(() => {
      if ((name === 'route' || name === 'bookingType') && formData.route && formData.passengers.length) {
        const calculatedFare = calculateTotalFare();
        if (calculatedFare > 0) {
          setFormData(prev => ({ ...prev, totalFare: calculatedFare.toString() }));
        }
      }
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBooking) {
        await bookingsAPI.update(editingBooking._id, formData);
      } else {
        await bookingsAPI.create(formData);
      }
      fetchBookings();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save booking');
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await bookingsAPI.delete(bookingId);
        fetchBookings();
      } catch (err) {
        setError('Failed to delete booking');
        console.log("Failed to delete bookings", err);
      }
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      fetchBookings();
    } catch (err) {
      setError('Failed to update booking status');
              console.log("Failed to update booking status", err);

    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'status-badge';
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return `${baseClasses} status-confirmed`;
      case 'pending':
        return `${baseClasses} status-pending`;
      case 'cancelled':
        return `${baseClasses} status-cancelled`;
      case 'completed':
        return `${baseClasses} status-completed`;
      case 'paid':
        return `${baseClasses} status-paid`;
      case 'partially paid':
        return `${baseClasses} status-partially-paid`;
      case 'failed':
        return `${baseClasses} status-failed`;
      case 'refunded':
      case 'partially refunded':
        return `${baseClasses} status-refunded`;
      default:
        return `${baseClasses} status-inactive`;
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading">
        <div>Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="page-header">
        <h1>Bookings Management</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          Add Booking
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="btn btn-sm">×</button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="filters-section card">
        <div className="filters-grid" style={{ alignItems: 'center' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ minWidth: 180 }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ minWidth: 150 }}
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <button onClick={handleSearch} className="btn btn-primary" style={{ height: 40, minWidth: 100 }}>
            Search
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card">
        {bookings.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>User</th>
                  <th>Route</th>
                  <th>Departure</th>
                  <th>Passengers</th>
                  <th>Fare</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td style={{ wordBreak: 'break-word', maxWidth: 120 }}>
                      <strong>{booking.bookingNumber || 'N/A'}</strong>
                      <br />
                      <small>{booking.createdAt ? formatDate(booking.createdAt) : ''}</small>
                    </td>
                    <td style={{ wordBreak: 'break-word', maxWidth: 120 }}>{booking.user?.name || 'Unknown User'}<br/><small>{booking.user?.email || 'No Email'}</small></td>
                    <td style={{ wordBreak: 'break-word', maxWidth: 180 }}>
                      {(booking.route?.source && booking.route?.destination)
                        ? `${booking.route.source} → ${booking.route.destination}`
                        : (booking.route || 'N/A')}
                      <br />
                      <small>Bus: {booking.bus?.busNumber || booking.bus || 'N/A'}</small>
                    </td>
                    <td>{booking.departureDate ? formatDate(booking.departureDate) : 'N/A'}</td>
                    <td>{booking.passengers?.length ?? 0}</td>
                    <td>₦{booking.totalFare ?? '0'}</td>
                    <td>
                      <span className={getStatusBadge(booking.paymentStatus)}>
                        {booking.paymentStatus || 'Pending'}
                      </span>
                      <br/>
                      <small>Paid: ₦{booking.paymentMetadata?.totalPaid ?? 0}</small>
                    </td>
                    <td>
                      <span className={getStatusBadge(booking.status)}>
                        {booking.status || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleOpenModal(booking)}
                          className="btn btn-sm btn-secondary"
                          style={{ marginRight: '0.5rem' }}
                        >
                          Edit
                        </button>
                        {booking.status === 'Pending' && (
                          <button
                            onClick={() => handleStatusChange(booking._id, 'Confirmed')}
                            className="btn btn-sm btn-success"
                            style={{ marginRight: '0.5rem' }}
                          >
                            Confirm
                          </button>
                        )}
                        {['Pending', 'Confirmed'].includes(booking.status) && (
                          <button
                            onClick={() => handleStatusChange(booking._id, 'Cancelled')}
                            className="btn btn-sm btn-warning"
                            style={{ marginRight: '0.5rem' }}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">No bookings found</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 22, fontWeight: 600 }}>{editingBooking ? 'Edit Booking' : 'Create New Booking'}</h2>
              <button onClick={handleCloseModal} className="btn btn-sm">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title">Booking Information</h3>
                <div className="form-grid" style={{ gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 500 }}>Select User *</label>
                    <select
                      name="user"
                      value={formData.user}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select a user...</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 500 }}>Booking Type *</label>
                    <select
                      name="bookingType"
                      value={formData.bookingType}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="One-Way">One-Way</option>
                      <option value="Round-Trip">Round-Trip</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 500 }}>Select Route *</label>
                    <select
                      name="route"
                      value={formData.route}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select a route...</option>
                      {routes.map(route => (
                        <option key={route._id} value={route._id}>
                          {route.source} → {route.destination} ({route.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 500 }}>Select Bus *</label>
                    <select
                      name="bus"
                      value={formData.bus}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select a bus...</option>
                      {getAvailableBuses().map(bus => (
                        <option key={bus._id} value={bus._id}>
                          {bus.busNumber} - {bus.type} (Capacity: {bus.capacity})
                        </option>
                      ))}
                    </select>
                    {formData.route && getAvailableBuses().length === 0 && (
                      <small style={{ color: '#ef4444', fontSize: '12px' }}>
                        No buses available for selected route
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 500 }}>Departure Date *</label>
                    <input
                      type="date"
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleChange}
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {formData.bookingType === 'Round-Trip' && (
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 500 }}>Return Date</label>
                      <input
                        type="date"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleChange}
                        className="form-input"
                        min={formData.departureDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Passengers Section */}
              <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <h3 className="section-title">Passengers</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => {
                        const newFormData = {
                          ...prev,
                          passengers: [...prev.passengers, {
                            name: '',
                            age: '',
                            gender: 'Male',
                            seatNumber: '',
                            passengerType: 'Adult'
                          }]
                        };
                        // Recalculate fare after adding passenger
                        if (prev.route) {
                          const selectedRoute = routes.find(route => route._id === prev.route);
                          if (selectedRoute && selectedRoute.baseFare) {
                            let totalFare = selectedRoute.baseFare * newFormData.passengers.length;
                            if (prev.bookingType === 'Round-Trip') {
                              totalFare *= 2;
                            }
                            newFormData.totalFare = Math.round(totalFare * 100) / 100;
                          }
                        }
                        return newFormData;
                      });
                    }}
                    className="btn btn-sm btn-primary"
                  >
                    + Add Passenger
                  </button>
                </div>
                
                {formData.passengers.map((passenger, index) => (
                  <div key={index} className="passenger-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <h4 style={{ margin: 0, fontSize: 16, color: '#374151' }}>Passenger {index + 1}</h4>
                      {formData.passengers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              passengers: prev.passengers.filter((_, i) => i !== index)
                            }));
                          }}
                          className="btn btn-sm btn-danger"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="form-grid" style={{ gap: 15 }}>
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) => {
                            const newPassengers = [...formData.passengers];
                            newPassengers[index].name = e.target.value;
                            setFormData(prev => ({ ...prev, passengers: newPassengers }));
                          }}
                          className="form-input"
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Age *</label>
                        <input
                          type="number"
                          value={passenger.age}
                          onChange={(e) => {
                            const newPassengers = [...formData.passengers];
                            newPassengers[index].age = e.target.value;
                            setFormData(prev => ({ ...prev, passengers: newPassengers }));
                          }}
                          className="form-input"
                          placeholder="Age"
                          min="0"
                          max="120"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => {
                            const newPassengers = [...formData.passengers];
                            newPassengers[index].gender = e.target.value;
                            setFormData(prev => ({ ...prev, passengers: newPassengers }));
                          }}
                          className="form-select"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Seat Number</label>
                        <input
                          type="text"
                          value={passenger.seatNumber}
                          onChange={(e) => {
                            const newPassengers = [...formData.passengers];
                            newPassengers[index].seatNumber = e.target.value;
                            setFormData(prev => ({ ...prev, passengers: newPassengers }));
                          }}
                          className="form-input"
                          placeholder="Seat number"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Type</label>
                        <select
                          value={passenger.passengerType}
                          onChange={(e) => {
                            const newPassengers = [...formData.passengers];
                            newPassengers[index].passengerType = e.target.value;
                            setFormData(prev => ({ ...prev, passengers: newPassengers }));
                          }}
                          className="form-select"
                        >
                          <option value="Adult">Adult</option>
                          <option value="Child">Child</option>
                          <option value="Student">Student</option>
                          <option value="Senior">Senior</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Information */}
              <div className="form-section">
                <h3 className="section-title">Payment & Status</h3>
                <div className="form-grid" style={{ gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 500 }}>Total Fare (₦) *</label>
                    <input
                      type="number"
                      name="totalFare"
                      value={formData.totalFare}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter total fare"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 500 }}>Booking Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-select"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBooking ? 'Update Booking' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .bookings-page {
          padding: 0;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          margin: 0;
          color: #1f2937;
        }

        .error-message {
          background-color: #fef2f2;
          color: #dc2626;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .filters-section {
          margin-bottom: 2rem;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: 1fr 200px auto;
          gap: 1rem;
          align-items: center;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .form-label {
          color: #374151;
          font-size: 15px;
        }

        .form-input, .form-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 15px;
          color: #111827;
          background: #fff;
        }

        .form-input:focus, .form-select:focus {
          outline: 2px solid #f97316;
          border-color: #f97316;
        }

        .no-data {
          text-align: center;
          color: #9ca3af;
          padding: 2rem;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .modal, .modal-large {
          background: white;
          border-radius: 0.5rem;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .modal-footer {
          display: flex;
          justify-content: end;
          gap: 0.5rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th, .table td {
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
          font-size: 15px;
          color: #1f2937;
        }
        .table th {
          background: #f3f4f6;
          font-weight: 600;
        }
        .table tr:last-child td {
          border-bottom: none;
        }
        .table td {
          vertical-align: top;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25em 0.75em;
          border-radius: 1em;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
        }
        .status-confirmed { background: #22c55e; }
        .status-pending { background: #f59e42; }
        .status-cancelled { background: #ef4444; }
        .status-completed { background: #2563eb; }
        .status-paid { background: #10b981; }
        .status-partially-paid { background: #f59e0b; }
        .status-failed { background: #ef4444; }
        .status-refunded { background: #6366f1; }
        .status-inactive { background: #6b7280; }

        .form-section {
          margin-bottom: 2rem;
        }

        .section-title {
          color: #1f2937;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 1rem 0;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .passenger-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .card {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          padding: 1.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #f97316;
          color: white;
        }

        .btn-primary:hover {
          background: #ea580c;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-success {
          background: #059669;
          color: white;
        }

        .btn-success:hover {
          background: #047857;
        }

        .btn-warning {
          background: #d97706;
          color: white;
        }

        .btn-warning:hover {
          background: #b45309;
        }

        .btn-danger {
          background: #dc2626;
          color: white;
        }

        .btn-danger:hover {
          background: #b91c1c;
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 14px;
        }

        @media (max-width: 900px) {
          .table {
            min-width: 700px;
          }
        }
        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default Bookings;

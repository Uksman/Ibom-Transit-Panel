import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { hiringsAPI, busesAPI, usersAPI, routesAPI } from "../services/api";
import {
  FaCaravan,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaCheck,
  FaBan,
} from "react-icons/fa";

const Hirings = () => {
  const [hirings, setHirings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingHiring, setEditingHiring] = useState(null);
  const [formData, setFormData] = useState({
    hiringNumber: "",
    startLocation: "",
    endLocation: "",
    purpose: "",
    startDate: "",
    endDate: "",
    totalCost: "",
    status: "Pending",
    baseRate: "",
    rateType: "Route-Based",
    tripType: "One-Way",
    returnDate: "",
    specialRequirements: "",
    driverAllowance: "",
    bus: "",
    user: "",
    route: "", // Route reference for route-based hiring
    paymentStatus: "Pending",
    contactPerson: "",
    contactPhone: "",
    estimatedDistance: "",
    routePriceMultiplier: "1", // Default multiplier for route-based pricing
  });

  const [buses, setBuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  const statuses = [
    "Pending",
    "Approved",
    "Confirmed",
    "Cancelled",
    "Rejected",
    "In Progress",
    "Completed",
  ];
  
  const rateTypes = [
    "Route-Based",
    "Fixed",
    "Per Day",
    "Per Hour", 
    "Per Kilometer"
  ];
  
  const tripTypes = ["One-Way", "Round-Trip"];
  const paymentStatuses = ["Pending", "Partially Paid", "Paid", "Refunded", "Partially Refunded"];

  useEffect(() => {
    fetchHirings();
    fetchBuses();
    fetchUsers();
    fetchRoutes();
  }, []);
  
  // Auto-calculate total cost when relevant fields change
  useEffect(() => {
    calculateTotalCost();
  }, [formData.bus, formData.route, formData.rateType, formData.baseRate, formData.tripType, formData.routePriceMultiplier, formData.driverAllowance]);

  const fetchHirings = async () => {
    try {
      setLoading(true);
      const response = await hiringsAPI.getAll();
      setHirings(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch hirings");
      console.error("Fetch hirings error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBuses = async () => {
    try {
      const response = await busesAPI.getAll();
      setBuses(response.data.data || []);
    } catch (err) {
      console.error("Fetch buses error:", err);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.data || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };
  
  const fetchRoutes = async () => {
    try {
      const response = await routesAPI.getAll();
      setRoutes(response.data.data || []);
    } catch (err) {
      console.error("Fetch routes error:", err);
    }
  };
  
  const calculateTotalCost = () => {
    if (!selectedBus) return;
    
    let cost = 0;
    
    if (formData.rateType === "Route-Based" && selectedRoute) {
      // Route-based pricing: baseFare × bus capacity × multiplier
      const baseFare = selectedRoute.baseFare || 0;
      const multiplier = parseFloat(formData.routePriceMultiplier) || 1;
      cost = baseFare * selectedBus.capacity * multiplier;
    } else if (formData.rateType === "Fixed") {
      // Fixed rate
      cost = parseFloat(formData.baseRate) || 0;
    } else {
      // Other rate types use base rate
      cost = parseFloat(formData.baseRate) || 0;
    }
    
    // Double for round trip
    if (formData.tripType === "Round-Trip") {
      cost *= 2;
    }
    
    // Add driver allowance
    cost += parseFloat(formData.driverAllowance) || 0;
    
    // Update total cost
    setFormData(prev => ({ ...prev, totalCost: cost.toString() }));
  };

  const handleOpenModal = (hiring = null) => {
    setEditingHiring(hiring);
    setFormData({
      hiringNumber: hiring?.hiringNumber || "",
      startLocation: hiring?.startLocation || "",
      endLocation: hiring?.endLocation || "",
      purpose: hiring?.purpose || "",
      startDate: hiring?.startDate ? hiring.startDate.split("T")[0] : "",
      endDate: hiring?.endDate ? hiring.endDate.split("T")[0] : "",
      returnDate: hiring?.returnDate ? hiring.returnDate.split("T")[0] : "",
      totalCost: hiring?.totalCost || "",
      status: hiring?.status || "Pending",
      estimatedDistance: hiring?.estimatedDistance || "",
      baseRate: hiring?.baseRate || "",
      rateType: hiring?.rateType || "Route-Based",
      tripType: hiring?.tripType || "One-Way",
      specialRequirements: hiring?.specialRequirements || "",
      driverAllowance: hiring?.driverAllowance || "",
      bus: hiring?.bus?._id || hiring?.bus || "",
      user: hiring?.user?._id || hiring?.user || "",
      route: hiring?.route?._id || hiring?.route || "",
      paymentStatus: hiring?.paymentStatus || "Pending",
      contactPerson: hiring?.contactPerson || "",
      contactPhone: hiring?.contactPhone || "",
      routePriceMultiplier: hiring?.routePriceMultiplier?.toString() || "1",
    });
    
    // Set selected bus and route for cost calculation
    if (hiring?.bus) {
      const bus = buses.find(b => b._id === (hiring.bus._id || hiring.bus));
      setSelectedBus(bus || null);
    } else {
      setSelectedBus(null);
    }
    
    if (hiring?.route) {
      const route = routes.find(r => r._id === (hiring.route._id || hiring.route));
      setSelectedRoute(route || null);
    } else {
      setSelectedRoute(null);
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHiring(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Handle bus selection
    if (name === "bus") {
      const bus = buses.find(b => b._id === value);
      setSelectedBus(bus || null);
      
      // Set passenger count to bus capacity for hiring
      if (bus) {
        setFormData(prev => ({ ...prev, passengerCount: bus.capacity.toString() }));
      }
    }
    
    // Handle route selection
    if (name === "route") {
      const route = routes.find(r => r._id === value);
      setSelectedRoute(route || null);
      
      // Auto-fill locations if route is selected
      if (route) {
        setFormData(prev => ({ 
          ...prev, 
          startLocation: route.source || prev.startLocation,
          endLocation: route.destination || prev.endLocation,
          estimatedDistance: route.distance?.toString() || prev.estimatedDistance,
          baseRate: route.baseFare?.toString() || prev.baseRate
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHiring) {
        await hiringsAPI.update(editingHiring._id, formData);
      } else {
        await hiringsAPI.create(formData);
      }
      fetchHirings();
      handleCloseModal();
    } catch (err) {
      setError("Failed to save hiring");
      console.error("Save hiring error:", err);
    }
  };

  const handleDelete = async (hiringId) => {
    if (window.confirm("Are you sure you want to permanently delete this hiring? This action cannot be undone.")) {
      try {
        await hiringsAPI.delete(hiringId);
        fetchHirings();
      } catch (err) {
        setError("Failed to delete hiring");
        console.error("Delete hiring error:", err);
      }
    }
  };

  const handleApprove = async (hiringId) => {
    if (window.confirm("Are you sure you want to approve this hiring request?")) {
      try {
        const notes = prompt("Add any notes for this approval (optional):");
        await hiringsAPI.approve(hiringId, notes || "Approved by admin");
        fetchHirings();
      } catch (err) {
        setError("Failed to approve hiring");
        console.error("Approve hiring error:", err);
      }
    }
  };

  const handleReject = async (hiringId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      try {
        await hiringsAPI.reject(hiringId, reason);
        fetchHirings();
      } catch (err) {
        setError("Failed to reject hiring");
        console.error("Reject hiring error:", err);
      }
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Loading hirings...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <HiringsContainer>
      <PageHeader>
        <HeaderTitle>
          <FaCaravan /> Hirings Management
        </HeaderTitle>
        <AddButton onClick={() => handleOpenModal()}>
          <FaPlus /> Add Hiring
        </AddButton>
      </PageHeader>

      {error && (
        <ErrorMessage>
          <span>{error}</span>
          <CloseErrorButton onClick={() => setError("")}>
            <FaTimes />
          </CloseErrorButton>
        </ErrorMessage>
      )}

      <Card>
        {hirings.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <thead>
              <tr>
                <TableHeader>Hiring Number</TableHeader>
                <TableHeader>User</TableHeader>
                <TableHeader>Route</TableHeader>
                <TableHeader>Bus</TableHeader>
                <TableHeader>Purpose</TableHeader>
                <TableHeader>Dates</TableHeader>
                <TableHeader>Cost</TableHeader>
                <TableHeader>Payment</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {hirings.map((hiring) => (
                <TableRow key={hiring._id}>
                  <TableCell>
                    <strong>{hiring.hiringNumber}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{hiring.user?.name || 'Unknown User'}</strong>
                    <br/>
                    <small>{hiring.user?.email || 'No Email'}</small>
                  </TableCell>
                  <TableCell>
                    {hiring.startLocation} → {hiring.endLocation}
                    <br/>
                    <small>{hiring.tripType || 'One-Way'} • {hiring.estimatedDistance || 0} km</small>
                  </TableCell>
                  <TableCell>
                    <strong>{hiring.bus?.busNumber || 'Unknown Bus'}</strong>
                    <br/>
                    <small>{hiring.bus?.type || 'Unknown Type'} • {hiring.bus?.capacity || 0} seats</small>
                  </TableCell>
                  <TableCell>
                    {hiring.purpose}
                    <br/>
                    <small>{hiring.passengerCount || 0} passenger{(hiring.passengerCount || 0) !== 1 ? 's' : ''}</small>
                  </TableCell>
                  <TableCell>
                    {new Date(hiring.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    <br />
                    <small>
                      to{" "}
                      {new Date(hiring.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </small>
                  </TableCell>
                  <TableCell>
                    ₦{parseFloat(hiring.totalCost).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <PaymentInfo>
                      <PaymentStatusBadge status={hiring.paymentStatus || 'Pending'}>
                        {hiring.paymentStatus || 'Pending'}
                      </PaymentStatusBadge>
                      {hiring.totalPaid > 0 && (
                        <small>
                          Paid: ₦{parseFloat(hiring.totalPaid || 0).toFixed(2)}
                          {hiring.remainingBalance > 0 && (
                            <> / Remaining: ₦{parseFloat(hiring.remainingBalance || hiring.totalCost - (hiring.totalPaid || 0)).toFixed(2)}</>
                          )}
                        </small>
                      )}
                      {hiring.payments && hiring.payments.length > 0 && (
                        <small title={`${hiring.payments.length} payment(s) made`}>
                          📄 {hiring.payments.length} transaction{hiring.payments.length > 1 ? 's' : ''}
                        </small>
                      )}
                    </PaymentInfo>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={hiring.status}>
                      {hiring.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <ActionsContainer>
                      {/* Show Approve and Reject buttons only for Pending hirings */}
                      {hiring.status === "Pending" && (
                        <>
                          <ActionButton
                            onClick={() => handleApprove(hiring._id)}
                            approve
                          >
                            <FaCheck /> Confirm
                          </ActionButton>
                          <ActionButton
                            onClick={() => handleReject(hiring._id)}
                            reject
                          >
                            <FaBan /> Reject
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Edit button for all hirings except completed/cancelled */}
                      {!['Completed', 'Cancelled', 'Rejected'].includes(hiring.status) && (
                        <ActionButton onClick={() => handleOpenModal(hiring)} edit>
                          <FaEdit /> Edit
                        </ActionButton>
                      )}
                      
                      {/* Delete button - permanently removes the hiring record */}
                      <ActionButton
                        onClick={() => handleDelete(hiring._id)}
                        danger
                      >
                        <FaTrash /> Delete
                      </ActionButton>
                    </ActionsContainer>
                  </TableCell>
                </TableRow>
              ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <NoData>No hirings found</NoData>
        )}
      </Card>

      {showModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>{editingHiring ? "Edit Hiring" : "Add Hiring"}</h2>
              <CloseButton onClick={handleCloseModal}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={handleSubmit}>
                <FormGrid>
                  <FormGroup>
                    <FormLabel>Hiring Number</FormLabel>
                    <FormInput
                      type="text"
                      name="hiringNumber"
                      value={formData.hiringNumber}
                      onChange={handleChange}
                      placeholder="Auto-generated if empty"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <FormLabel>User</FormLabel>
                    <FormSelect
                      name="user"
                      value={formData.user}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Bus</FormLabel>
                    <FormSelect
                      name="bus"
                      value={formData.bus}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Bus</option>
                      {buses.map((bus) => (
                        <option key={bus._id} value={bus._id}>
                          {bus.busNumber} - {bus.type} (Capacity: {bus.capacity})
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Trip Type</FormLabel>
                    <FormSelect
                      name="tripType"
                      value={formData.tripType}
                      onChange={handleChange}
                    >
                      {tripTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Start Location</FormLabel>
                    <FormInput
                      type="text"
                      name="startLocation"
                      value={formData.startLocation}
                      onChange={handleChange}
                      placeholder="Enter start location"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <FormLabel>End Location</FormLabel>
                    <FormInput
                      type="text"
                      name="endLocation"
                      value={formData.endLocation}
                      onChange={handleChange}
                      placeholder="Enter end location"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Start Date</FormLabel>
                    <FormInput
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <FormLabel>End Date</FormLabel>
                    <FormInput
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>

                  {formData.tripType === "Round-Trip" && (
                    <FormGroup>
                      <FormLabel>Return Date</FormLabel>
                      <FormInput
                        type="date"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleChange}
                        required={formData.tripType === "Round-Trip"}
                      />
                    </FormGroup>
                  )}

                  <FormGroup>
                    <FormLabel>Purpose</FormLabel>
                    <FormInput
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      placeholder="Enter purpose"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Route (Optional)</FormLabel>
                    <FormSelect
                      name="route"
                      value={formData.route}
                      onChange={handleChange}
                    >
                      <option value="">Select Route (Optional)</option>
                      {routes.map((route) => (
                        <option key={route._id} value={route._id}>
                          {route.name} - {route.source} → {route.destination}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Passenger Capacity</FormLabel>
                    <FormInput
                      type="number"
                      name="passengerCount"
                      value={formData.passengerCount || (selectedBus ? selectedBus.capacity : '')}
                      readOnly
                      placeholder="Auto-set from bus capacity"
                      style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                    />
                    <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Full bus capacity (auto-filled from selected bus)
                    </small>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Estimated Distance (KM)</FormLabel>
                    <FormInput
                      type="number"
                      name="estimatedDistance"
                      value={formData.estimatedDistance}
                      onChange={handleChange}
                      placeholder="Distance in kilometers"
                      required
                      min="1"
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Rate Type</FormLabel>
                    <FormSelect
                      name="rateType"
                      value={formData.rateType}
                      onChange={handleChange}
                    >
                      {rateTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Base Rate (₦)</FormLabel>
                    <FormInput
                      type="number"
                      name="baseRate"
                      value={formData.baseRate}
                      onChange={handleChange}
                      placeholder={selectedRoute ? "Auto-filled from route" : "Enter base rate amount"}
                      required
                      min="0"
                      step="0.01"
                    />
                    {formData.rateType === "Route-Based" && (
                      <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        Route base fare (auto-filled when route is selected)
                      </small>
                    )}
                  </FormGroup>
                  
                  {formData.rateType === "Route-Based" && (
                    <FormGroup>
                      <FormLabel>Route Price Multiplier</FormLabel>
                      <FormInput
                        type="number"
                        name="routePriceMultiplier"
                        value={formData.routePriceMultiplier}
                        onChange={handleChange}
                        placeholder="1.0"
                        min="0.1"
                        step="0.1"
                      />
                      <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        Multiplier for route-based pricing (1.0 = standard rate)
                      </small>
                    </FormGroup>
                  )}

                  <FormGroup>
                    <FormLabel>Driver Allowance (₦)</FormLabel>
                    <FormInput
                      type="number"
                      name="driverAllowance"
                      value={formData.driverAllowance}
                      onChange={handleChange}
                      placeholder="Driver allowance (optional)"
                      min="0"
                      step="0.01"
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Total Cost (₦)</FormLabel>
                    <FormInput
                      type="number"
                      name="totalCost"
                      value={formData.totalCost}
                      onChange={handleChange}
                      placeholder="Auto-calculated or enter manually"
                      required
                      min="0"
                      step="0.01"
                      style={{ 
                        backgroundColor: formData.totalCost ? '#f0f9ff' : '#f9fafb',
                        borderColor: formData.totalCost ? '#0ea5e9' : '#e5e7eb'
                      }}
                    />
                    {formData.rateType === "Route-Based" && selectedBus && selectedRoute && (
                      <small style={{ color: '#0ea5e9', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        Auto-calculated: ₦{selectedRoute.baseFare} × {selectedBus.capacity} seats × {formData.routePriceMultiplier} 
                        {formData.tripType === "Round-Trip" ? " × 2 (round-trip)" : ""}
                        {formData.driverAllowance > 0 ? ` + ₦${formData.driverAllowance} (driver allowance)` : ""}
                      </small>
                    )}
                  </FormGroup>
                  
                  <FormGroup>
                    <FormLabel>Contact Person</FormLabel>
                    <FormInput
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="Contact person name"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormInput
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="Contact phone number"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Payment Status</FormLabel>
                    <FormSelect
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleChange}
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Status</FormLabel>
                    <FormSelect
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </FormGrid>

                <FormGroup>
                  <FormLabel>Special Requirements</FormLabel>
                  <FormTextArea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    placeholder="Any special requirements or notes..."
                    rows="3"
                  />
                </FormGroup>
                <ModalFooter>
                  <CancelButton type="button" onClick={handleCloseModal}>
                    Cancel
                  </CancelButton>
                  <SubmitButton type="submit">
                    <FaSave /> Save
                  </SubmitButton>
                </ModalFooter>
              </Form>
            </ModalBody>
          </Modal>
        </ModalOverlay>
      )}
    </HiringsContainer>
  );
};

export default Hirings;

const HiringsContainer = styled.div`
  padding: 2rem;
  background: #f3f4f6;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1.5rem 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem;
  }
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #f97316;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(to right, #f97316, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #f97316, #ea580c);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }
`;

const ErrorMessage = styled.div`
  background: rgba(254, 226, 226, 0.9);
  color: #dc2626;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  display: flex;
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
`;

const CloseErrorButton = styled.button`
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.2s ease;

  &:hover {
    color: #b91c1c;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-out;

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
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  color: #1f2937;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 1px solid #e5e7eb;
`;

const TableRow = styled.tr`
  transition: all 0.3s ease;

  &:hover {
    background: rgba(243, 244, 246, 0.5);
    transform: translateX(4px);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
  font-size: 0.9rem;

  small {
    color: #6b7280;
  }
`;

const StatusBadge = styled.span`
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;

  ${({ status }) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return `
          background: #fefce8;
          color: #b45309;
        `;
      case "approved":
        return `
          background: #d1fae5;
          color: #10b981;
        `;
      case "confirmed":
        return `
          background: #ffedd5;
          color: #f97316;
        `;
      case "cancelled":
        return `
          background: #fee2e2;
          color: #dc2626;
        `;
      case "rejected":
        return `
          background: #fef2f2;
          color: #dc2626;
        `;
      case "in progress":
        return `
          background: #ffedd5;
          color: #ea580c;
        `;
      case "completed":
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: fit-content;

  ${({ edit, approve, reject, danger }) => {
    if (edit) {
      return `
        background: #6b7280;
        color: white;
        &:hover {
          background: #4b5563;
          transform: translateY(-1px);
        }
      `;
    } else if (approve) {
      return `
        background: #10b981;
        color: white;
        &:hover {
          background: #059669;
          transform: translateY(-1px);
        }
      `;
    } else if (reject) {
      return `
        background: #f59e0b;
        color: white;
        &:hover {
          background: #d97706;
          transform: translateY(-1px);
        }
      `;
    } else if (danger) {
      return `
        background: #dc2626;
        color: white;
        &:hover {
          background: #b91c1c;
          transform: translateY(-1px);
        }
      `;
    } else {
      return `
        background: #6b7280;
        color: white;
        &:hover {
          background: #4b5563;
          transform: translateY(-1px);
        }
      `;
    }
  }}
`;

const NoData = styled.div`
  text-align: center;
  color: #9ca3af;
  padding: 2rem;
  font-size: 0.95rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #1f2937;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.2s ease;

  &:hover {
    color: #f97316;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1f2937;
  font-size: 0.9rem;
`;

const FormInput = styled.input`
  padding: 0.85rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  background: #f9fafb;
  color: #1f2937;
  transition: all 0.3s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    background: #ffffff;
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const FormSelect = styled.select`
  padding: 0.85rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  background: #f9fafb;
  color: #1f2937;
  transition: all 0.3s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    background: #ffffff;
    transform: translateY(-1px);
  }
`;

const FormTextArea = styled.textarea`
  padding: 0.85rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  background: #f9fafb;
  color: #1f2937;
  transition: all 0.3s ease;
  width: 100%;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    background: #ffffff;
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #f97316, #ea580c);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
`;

const Spinner = styled.div`
  width: 2.5rem;
  height: 2.5rem;
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
  font-size: 1.1rem;
  font-weight: 500;
`;

const PaymentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;

  small {
    color: #6b7280;
    font-size: 0.75rem;
    line-height: 1.2;
  }
`;

const PaymentStatusBadge = styled.span`  padding: 0.3rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  margin-bottom: 0.25rem;

  ${({ status }) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return `
          background: #fef3c7;
          color: #b45309;
        `;
      case "partially paid":
        return `
          background: #fde68a;
          color: #b45309;
        `;
      case "paid":
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case "refunded":
        return `
          background: #fee2e2;
          color: #dc2626;
        `;
      case "partially refunded":
        return `
          background: #fecaca;
          color: #dc2626;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;


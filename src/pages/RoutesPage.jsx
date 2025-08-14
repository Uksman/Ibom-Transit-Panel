import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { routesAPI, busesAPI } from "../services/api";
import {
  FaRoute,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
} from "react-icons/fa";

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    routeCode: "",
    name: "",
    source: "",
    destination: "",
    distance: "",
    estimatedDuration: "",
    departureTime: "",
    arrivalTime: "",
    baseFare: "",
    bus: "",
    operatingDays: [],
    isActive: true,
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    fetchRoutes();
    fetchBuses();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      console.log('Fetching routes...');
      const response = await routesAPI.getAll();
      console.log('Routes API response:', response);
      console.log('Routes data:', response.data);
      
      // Handle different possible response structures
      let routesData = [];
      if (response.data.data) {
        routesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        routesData = response.data;
      } else {
        console.warn('Unexpected routes response structure:', response.data);
      }
      
      console.log('Setting routes:', routesData);
      setRoutes(routesData);
    } catch (err) {
      setError("Failed to fetch routes");
      console.error("Failed to fetch routes:", err);
      console.error("Error response:", err.response);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await busesAPI.getAll();
      setBuses(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch buses:", err);
    }
  };

  const handleOpenModal = (route = null) => {
    setEditingRoute(route);
    setFormData({
      routeCode: route?.routeCode || "",
      name: route?.name || "",
      source: route?.source || "",
      destination: route?.destination || "",
      distance: route?.distance || "",
      estimatedDuration: route?.estimatedDuration || "",
      departureTime: route?.departureTime || "",
      arrivalTime: route?.arrivalTime || "",
      baseFare: route?.baseFare || "",
      bus: route?.bus?._id || "",
      operatingDays: route?.operatingDays || [],
      isActive: route?.isActive !== undefined ? route.isActive : true,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoute(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "operatingDays") {
      setFormData((prev) => ({
        ...prev,
        operatingDays: checked
          ? [...prev.operatingDays, value]
          : prev.operatingDays.filter((day) => day !== value),
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Helper function to calculate duration in minutes between two times
  const calculateDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return 0;
    
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
    
    const depTotalMinutes = depHours * 60 + depMinutes;
    const arrTotalMinutes = arrHours * 60 + arrMinutes;
    
    // Handle next-day arrivals (if arrival is before departure, assume next day)
    if (arrTotalMinutes < depTotalMinutes) {
      return (arrTotalMinutes + 24 * 60) - depTotalMinutes;
    } else {
      return arrTotalMinutes - depTotalMinutes;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.routeCode || !formData.name || !formData.source || !formData.destination || 
        !formData.distance || !formData.departureTime || 
        !formData.arrivalTime || !formData.baseFare || !formData.bus || 
        formData.operatingDays.length === 0) {
      setError("Please fill in all required fields and select at least one operating day");
      return;
    }

    // Auto-calculate duration if not provided or if it doesn't match
    const calculatedDuration = calculateDuration(formData.departureTime, formData.arrivalTime);
    
    // Validate that the calculated duration is reasonable (at least 5 minutes)
    if (calculatedDuration < 5) {
      setError("Arrival time must be after departure time (minimum 5 minutes)");
      return;
    }

    try {
      // Prepare the data according to backend requirements
      const routeData = {
        ...formData,
        // Ensure operatingDays is always an array
        operatingDays: formData.operatingDays || [],
        // Convert numeric fields to numbers
        distance: parseFloat(formData.distance),
        // Use calculated duration instead of user input to ensure consistency
        estimatedDuration: calculatedDuration,
        baseFare: parseFloat(formData.baseFare),
        // Ensure bus is provided
        bus: formData.bus || null
      };

      console.log('Sending route data:', routeData);
      console.log('Calculated duration (minutes):', calculatedDuration);
      console.log('Departure time:', formData.departureTime);
      console.log('Arrival time:', formData.arrivalTime);

      let result;
      if (editingRoute) {
        console.log('Updating existing route with ID:', editingRoute._id);
        result = await routesAPI.update(editingRoute._id, routeData);
        console.log('Route update result:', result);
      } else {
        console.log('Creating new route...');
        result = await routesAPI.create(routeData);
        console.log('Route creation result:', result);
      }
      
      console.log('Route operation successful, refreshing list first...');
      
      // First refresh the list
      console.log('Calling fetchRoutes() to refresh the list...');
      await fetchRoutes();
      console.log('fetchRoutes() completed, now closing modal...');
      
      // Then close the modal
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save route:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
        setError(errorMessages);
      } else {
        setError("Failed to save route");
      }
    }
  };

  const handleDelete = async (routeId) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      try {
        console.log('Deleting route with ID:', routeId);
        const result = await routesAPI.delete(routeId);
        console.log('Route deletion result:', result);
        
        console.log('Route deleted successfully, refreshing list...');
        await fetchRoutes();
        console.log('Route list refreshed after deletion');
      } catch (err) {
        setError("Failed to delete route");
        console.error("Failed to delete route:", err);
        console.error("Error response:", err.response);
      }
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Loading routes...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <RoutesContainer>
      <PageHeader>
        <HeaderTitle>
          <FaRoute /> Routes Management
        </HeaderTitle>
        <AddButton onClick={() => handleOpenModal()}>
          <FaPlus /> Add Route
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
        {routes.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <TableHeader>Route Code</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Route</TableHeader>
                <TableHeader>Distance</TableHeader>
                <TableHeader>Fare</TableHeader>
                <TableHeader>Bus</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <TableRow key={route._id}>
                  <TableCell>{route.routeCode}</TableCell>
                  <TableCell>{route.name}</TableCell>
                  <TableCell>
                    {route.source} → {route.destination}
                  </TableCell>
                  <TableCell>{route.distance} km</TableCell>
                  <TableCell>
                    ₦{parseFloat(route.baseFare).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {route.bus
                      ? `${route.bus.busNumber} (${route.bus.type})`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge isActive={route.isActive}>
                      {route.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <ActionButton onClick={() => handleOpenModal(route)} edit>
                      <FaEdit /> Edit
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDelete(route._id)}
                      danger
                    >
                      <FaTrash /> Delete
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        ) : (
          <NoData>No routes found</NoData>
        )}
      </Card>

      {showModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>{editingRoute ? "Edit Route" : "Add Route"}</h2>
              <CloseButton onClick={handleCloseModal}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={handleSubmit}>
                <FormGrid>
                  <FormGroup>
                    <FormLabel>Route Code</FormLabel>
                    <FormInput
                      type="text"
                      name="routeCode"
                      value={formData.routeCode}
                      onChange={handleChange}
                      placeholder="Enter route code"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Route Name</FormLabel>
                    <FormInput
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter route name"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Source</FormLabel>
                    <FormInput
                      type="text"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      placeholder="Enter source city"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Destination</FormLabel>
                    <FormInput
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="Enter destination city"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Distance (km)</FormLabel>
                    <FormInput
                      type="number"
                      name="distance"
                      value={formData.distance}
                      onChange={handleChange}
                      placeholder="Enter distance"
                      required
                      min="0"
                      step="0.1"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>
                      Duration (minutes)
                      {formData.departureTime && formData.arrivalTime && (
                        <span style={{ color: '#f97316', marginLeft: '8px', fontSize: '0.8rem' }}>
                          (Auto-calculated: {calculateDuration(formData.departureTime, formData.arrivalTime)} min)
                        </span>
                      )}
                    </FormLabel>
                    <FormInput
                      type="number"
                      name="estimatedDuration"
                      value={formData.estimatedDuration}
                      onChange={handleChange}
                      placeholder="Auto-calculated from times"
                      min="0"
                      disabled={formData.departureTime && formData.arrivalTime}
                      style={{ 
                        opacity: formData.departureTime && formData.arrivalTime ? 0.6 : 1,
                        cursor: formData.departureTime && formData.arrivalTime ? 'not-allowed' : 'text'
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Departure Time</FormLabel>
                    <FormInput
                      type="time"
                      name="departureTime"
                      value={formData.departureTime}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Arrival Time</FormLabel>
                    <FormInput
                      type="time"
                      name="arrivalTime"
                      value={formData.arrivalTime}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Base Fare (₦)</FormLabel>
                    <FormInput
                      type="number"
                      name="baseFare"
                      value={formData.baseFare}
                      onChange={handleChange}
                      placeholder="Enter base fare"
                      required
                      min="0"
                      step="0.01"
                    />
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
                          {bus.busNumber} - {bus.type}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </FormGrid>
                <FormGroup>
                  <FormLabel>Operating Days</FormLabel>
                  <DaysGrid>
                    {daysOfWeek.map((day) => (
                      <CheckboxLabel key={day}>
                        <CheckboxInput
                          type="checkbox"
                          name="operatingDays"
                          value={day}
                          checked={formData.operatingDays.includes(day)}
                          onChange={handleChange}
                        />
                        {day}
                      </CheckboxLabel>
                    ))}
                  </DaysGrid>
                </FormGroup>
                <FormGroup>
                  <CheckboxLabel>
                    <CheckboxInput
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    Active
                  </CheckboxLabel>
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
    </RoutesContainer>
  );
};

export default RoutesPage;

const RoutesContainer = styled.div`
  padding: 2rem;
  background: #f3f4f6;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
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
  overflow-x: auto;

  @media (max-width: 768px) {
    padding: 1rem;
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
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;

  @media (max-width: 768px) {
    min-width: 600px;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  color: #1f2937;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }
`;

const TableRow = styled.tr`
  transition: all 0.3s ease;

  &:hover {
    background: rgba(243, 244, 246, 0.5);
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
  font-size: 0.9rem;
  vertical-align: middle;

  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }

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
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
  }

  ${({ isActive }) =>
    isActive
      ? `
          background: #dcfce7;
          color: #15803d;
        `
      : `
          background: #fee2e2;
          color: #dc2626;
        `}
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    margin-right: 0.25rem;
    gap: 0.25rem;
  }

  ${({ edit }) =>
    edit
      ? `
    background: #6b7280;
    color: white;
    &:hover {
      background: #4b5563;
      transform: translateY(-1px);
    }
  `
      : `
    background: #dc2626;
    color: white;
    &:hover {
      background: #b91c1c;
      transform: translateY(-1px);
    }
  `}
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
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;

  @media (max-width: 768px) {
    width: 95%;
    max-height: 95vh;
    border-radius: 0.75rem;
  }

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

  @media (max-width: 768px) {
    padding: 1rem;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #1f2937;
    font-weight: 600;

    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
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
    color: #4f46e5;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
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
    gap: 1rem;
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

  @media (max-width: 768px) {
    padding: 0.75rem 0.875rem;
    font-size: 0.9rem;
  }

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

  @media (max-width: 768px) {
    padding: 0.75rem 0.875rem;
    font-size: 0.9rem;
  }

  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    background: #ffffff;
    transform: translateY(-1px);
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 0.5rem;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #1f2937;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.4rem;
  }

  &:hover {
    background: rgba(243, 244, 246, 0.5);
  }
`;

const CheckboxInput = styled.input`
  margin-right: 0.5rem;
  accent-color: #f97316;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
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

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

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

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

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

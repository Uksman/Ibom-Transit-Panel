import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { busesAPI } from "../services/api";
import {
  FaBus,
  FaSearch,
  FaTimes,
  FaSave,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [formData, setFormData] = useState({
    busNumber: "",
    registrationNumber: "",
    type: "Standard",
    capacity: "",
    manufacturer: "",
    model: "",
    yearOfManufacture: new Date().getFullYear(),
    status: "Active",
    amenities: [],
    seatingArrangement: { rows: "", columns: "" },
  });

  const busTypes = ["Standard", "Luxury", "Mini", "Double-Decker", "Sleeper"];
  const busStatuses = ["Active", "Maintenance", "Out of Service", "Reserved"];
  const availableAmenities = [
    "WiFi",
    "AC",
    "TV",
    "Charging Port",
    "Restroom",
    "Reclining Seats",
    "Water",
    "Snacks",
  ];

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      console.log('Fetching buses with params:', params);
      const response = await busesAPI.getAll(params);
      console.log('Buses fetched successfully:', response.data);
      
      const busesData = response.data.data || response.data || [];
      setBuses(busesData);
      
      console.log('Buses state updated with', busesData.length, 'buses');
      
    } catch (err) {
      console.error("Fetch buses error:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg || 
                          'Failed to fetch buses';
      setError(errorMessage);
      setBuses([]); // Clear buses on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchBuses();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(""); // Clear any previous errors
      
      // Validate required fields
      if (!formData.busNumber.trim()) {
        setError("Bus number is required");
        return;
      }
      if (!formData.registrationNumber.trim()) {
        setError("Registration number is required");
        return;
      }
      if (!formData.capacity || parseInt(formData.capacity) <= 0) {
        setError("Valid capacity is required");
        return;
      }
      if (!formData.manufacturer.trim()) {
        setError("Manufacturer is required");
        return;
      }
      if (!formData.model.trim()) {
        setError("Model is required");
        return;
      }
      if (!formData.seatingArrangement.rows || parseInt(formData.seatingArrangement.rows) <= 0) {
        setError("Valid number of rows is required");
        return;
      }
      if (!formData.seatingArrangement.columns || parseInt(formData.seatingArrangement.columns) <= 0) {
        setError("Valid number of columns is required");
        return;
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        yearOfManufacture: parseInt(formData.yearOfManufacture),
        seatingArrangement: {
          rows: parseInt(formData.seatingArrangement.rows),
          columns: parseInt(formData.seatingArrangement.columns)
        }
      };

      let response;
      if (editingBus) {
        response = await busesAPI.update(editingBus._id, submitData);
        console.log('Bus updated successfully:', response.data);
      } else {
        response = await busesAPI.create(submitData);
        console.log('Bus created successfully:', response.data);
      }
      
      // Refresh the buses list to show the changes immediately
      await fetchBuses();
      closeModal();
      
      // Show success message
      const successMessage = editingBus ? 'Bus updated successfully!' : 'Bus created successfully!';
      console.log(successMessage);
      
    } catch (err) {
      console.error('Error saving bus:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg || 
                          `Failed to ${editingBus ? 'update' : 'create'} bus`;
      setError(errorMessage);
    }
  };

  const handleDelete = async (busId) => {
    const busToDelete = buses.find(bus => bus._id === busId);
    const busName = busToDelete ? `${busToDelete.busNumber} (${busToDelete.registrationNumber})` : 'this bus';
    
    if (window.confirm(`Are you sure you want to delete ${busName}? This action cannot be undone.`)) {
      try {
        setError(""); // Clear any previous errors
        console.log('Deleting bus with ID:', busId);
        
        const response = await busesAPI.delete(busId);
        console.log('Bus deleted successfully:', response.data);
        
        // Remove the bus from local state immediately for better UX
        setBuses(prevBuses => prevBuses.filter(bus => bus._id !== busId));
        
        // Also refresh from server to ensure consistency
        await fetchBuses();
        
        console.log('Bus deleted successfully!');
        
      } catch (err) {
        console.error('Error deleting bus:', err);
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.errors?.[0]?.msg || 
                            'Failed to delete bus';
        setError(errorMessage);
        
        // If deletion failed, refresh the list to restore state
        await fetchBuses();
      }
    }
  };

  const openModal = (bus = null) => {
    setError(""); // Clear any previous errors
    
    if (bus) {
      console.log('Opening modal for editing bus:', bus);
      setEditingBus(bus);
      setFormData({
        busNumber: bus.busNumber || "",
        registrationNumber: bus.registrationNumber || "",
        type: bus.type || "Standard",
        capacity: bus.capacity?.toString() || "",
        manufacturer: bus.manufacturer || "",
        model: bus.model || "",
        yearOfManufacture: bus.yearOfManufacture || new Date().getFullYear(),
        status: bus.status || "Active",
        amenities: Array.isArray(bus.amenities) ? bus.amenities : [],
        seatingArrangement: {
          rows: bus.seatingArrangement?.rows?.toString() || "",
          columns: bus.seatingArrangement?.columns?.toString() || "",
        },
      });
    } else {
      console.log('Opening modal for creating new bus');
      setEditingBus(null);
      setFormData({
        busNumber: "",
        registrationNumber: "",
        type: "Standard",
        capacity: "",
        manufacturer: "",
        model: "",
        yearOfManufacture: new Date().getFullYear(),
        status: "Active",
        amenities: [],
        seatingArrangement: { rows: "", columns: "" },
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setShowModal(false);
    setEditingBus(null);
    setError("");
    // Reset form data to initial state
    setFormData({
      busNumber: "",
      registrationNumber: "",
      type: "Standard",
      capacity: "",
      manufacturer: "",
      model: "",
      yearOfManufacture: new Date().getFullYear(),
      status: "Active",
      amenities: [],
      seatingArrangement: { rows: "", columns: "" },
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Loading buses...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <BusesContainer>
      <PageHeader>
        <HeaderTitle>
          <FaBus /> Bus Management
        </HeaderTitle>
        <AddButton onClick={() => openModal()}>
          <FaBus /> Add New Bus
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

      <FiltersSection>
        <FiltersGrid>
          <FormGroup>
            <InputWrapper>
              <FormInput
                type="text"
                placeholder="Search buses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon>
                <FaSearch />
              </SearchIcon>
            </InputWrapper>
          </FormGroup>
          <FormGroup>
            <FormSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {busStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup>
            <FormSelect
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {busTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </FormSelect>
          </FormGroup>
          <SearchButton onClick={handleSearch}>
            <FaSearch /> Search
          </SearchButton>
        </FiltersGrid>
      </FiltersSection>

      <Card>
        {buses.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <TableHeader>Bus Number</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Capacity</TableHeader>
                <TableHeader>Manufacturer</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <TableRow key={bus._id}>
                  <TableCell>
                    <strong>{bus.busNumber}</strong>
                    <br />
                    <small>{bus.registrationNumber}</small>
                  </TableCell>
                  <TableCell>{bus.type}</TableCell>
                  <TableCell>{bus.capacity} seats</TableCell>
                  <TableCell>
                    {bus.manufacturer}
                    <br />
                    <small>
                      {bus.model} ({bus.yearOfManufacture})
                    </small>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={bus.status}>{bus.status}</StatusBadge>
                  </TableCell>
                  <TableCell>
                    <ActionButton onClick={() => openModal(bus)} edit>
                      <FaEdit /> Edit
                    </ActionButton>
                    <ActionButton onClick={() => handleDelete(bus._id)} danger>
                      <FaTrash /> Delete
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        ) : (
          <NoData>No buses found</NoData>
        )}
      </Card>

      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>{editingBus ? "Edit Bus" : "Add New Bus"}</h2>
              <CloseButton onClick={closeModal}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={handleSubmit}>
                <FormGrid>
                  <FormGroup>
                    <FormLabel>Bus Number</FormLabel>
                    <FormInput
                      type="text"
                      name="busNumber"
                      value={formData.busNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Registration Number</FormLabel>
                    <FormInput
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Type</FormLabel>
                    <FormSelect
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      {busTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Capacity</FormLabel>
                    <FormInput
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormInput
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Model</FormLabel>
                    <FormInput
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Year</FormLabel>
                    <FormInput
                      type="number"
                      name="yearOfManufacture"
                      value={formData.yearOfManufacture}
                      onChange={handleInputChange}
                      required
                      min="1950"
                      max={new Date().getFullYear() + 1}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Status</FormLabel>
                    <FormSelect
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      {busStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Rows</FormLabel>
                    <FormInput
                      type="number"
                      name="seatingArrangement.rows"
                      value={formData.seatingArrangement.rows}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Columns</FormLabel>
                    <FormInput
                      type="number"
                      name="seatingArrangement.columns"
                      value={formData.seatingArrangement.columns}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </FormGroup>
                </FormGrid>
                <FormGroup>
                  <FormLabel>Amenities</FormLabel>
                  <AmenitiesGrid>
                    {availableAmenities.map((amenity) => (
                      <CheckboxLabel key={amenity}>
                        <CheckboxInput
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityChange(amenity)}
                        />
                        {amenity}
                      </CheckboxLabel>
                    ))}
                  </AmenitiesGrid>
                </FormGroup>
                <ModalFooter>
                  <CancelButton type="button" onClick={closeModal}>
                    Cancel
                  </CancelButton>
                  <SubmitButton type="submit">
                    <FaSave /> {editingBus ? "Update Bus" : "Create Bus"}
                  </SubmitButton>
                </ModalFooter>
              </Form>
            </ModalBody>
          </Modal>
        </ModalOverlay>
      )}
    </BusesContainer>
  );
};

export default Buses;

const BusesContainer = styled.div`
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

const FiltersSection = styled.div`
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 200px 200px auto;
  gap: 1rem;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputWrapper = styled.div`
  position: relative;
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

const SearchIcon = styled.span`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
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

const SearchButton = styled.button`
  padding: 0.85rem 1.5rem;
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
      case "active":
        return `
          background: #dcfce7;
          color: #15803d;
        `;
      case "maintenance":
        return `
          background: #fefce8;
          color: #b45309;
        `;
      case "out of service":
        return `
          background: #fee2e2;
          color: #dc2626;
        `;
      case "reserved":
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
  max-width: 800px;
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

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1f2937;
  font-size: 0.9rem;
`;

const AmenitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
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

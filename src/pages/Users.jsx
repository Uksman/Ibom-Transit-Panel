import React, { useState, useEffect } from "react";
import styled from "styled-components";
import api, { usersAPI } from "../services/api";
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaSearch,
  FaPowerOff,
} from "react-icons/fa";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "client",
    isActive: true,
  });

  const roles = ["client", "admin"];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.query = searchTerm; // Use 'query' for searchUsers
      if (roleFilter) params.role = roleFilter;

      const endpoint = searchTerm ? "/users/search" : "/users";
      const response = await api.get(endpoint, {
        params,
        headers: { "Cache-Control": "no-cache" },
      });
      console.log("Fetched users:", response.data.data);
      setUsers([...(response.data.data || [])]);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      password: "", // Always empty for security
      phone: user?.phone || "",
      role: user?.role || "client",
      isActive: user?.isActive !== undefined ? user.isActive : true,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }

      if (editingUser) {
        await usersAPI.update(editingUser._id, submitData);
      } else {
        await usersAPI.create(submitData);
      }
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await usersAPI.delete(userId);
        setSearchTerm("");
        setRoleFilter("");
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );
        await fetchUsers();
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to delete user";
        setError(errorMessage);
        console.log("getting err: ", err.response?.data?.message);
        console.error("Failed to delete user:", err);
      }
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await usersAPI.updateStatus(userId, !currentStatus);
      fetchUsers();
    } catch (err) {
      setError("Failed to update user status");
      console.error("Failed to update user status:", err);
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
        <LoadingText>Loading users...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <UsersContainer>
      <PageHeader>
        <HeaderTitle>
          <FaUsers /> Users Management
        </HeaderTitle>
        <AddButton onClick={() => handleOpenModal()}>
          <FaPlus /> Add User
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
                placeholder="Search users..."
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
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
        {users.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Phone</TableHeader>
                <TableHeader>Role</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Created</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge isActive={user.isActive}>
                      {user.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <ActionButton onClick={() => handleOpenModal(user)} edit>
                      <FaEdit /> Edit
                    </ActionButton>
                    <ActionButton
                      onClick={() =>
                        handleStatusToggle(user._id, user.isActive)
                      }
                      toggle
                      isActive={user.isActive}
                    >
                      <FaPowerOff /> {user.isActive ? "Deactivate" : "Activate"}
                    </ActionButton>
                    <ActionButton onClick={() => handleDelete(user._id)} danger>
                      <FaTrash /> Delete
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        ) : (
          <NoData>No users found</NoData>
        )}
      </Card>

      {showModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>{editingUser ? "Edit User" : "Add User"}</h2>
              <CloseButton onClick={handleCloseModal}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={handleSubmit}>
                <FormGrid>
                  <FormGroup>
                    <FormLabel>Full Name</FormLabel>
                    <FormInput
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Email</FormLabel>
                    <FormInput
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Password</FormLabel>
                    <FormInput
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={
                        editingUser
                          ? "New password (leave blank to keep current)"
                          : "Enter password"
                      }
                      required={!editingUser}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Phone Number</FormLabel>
                    <FormInput
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Role</FormLabel>
                    <FormSelect
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </FormSelect>
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
                </FormGrid>
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
    </UsersContainer>
  );
};

export default Users;

const UsersContainer = styled.div`
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

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 200px auto;
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
  color: #070d14;
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
  color: #070d14;
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
`;

const StatusBadge = styled.span`
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;

  ${({ isActive }) =>
    isActive
      ? `
          background: #ffedd5;
          color: #f97316;
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

  ${({ edit, toggle, isActive }) =>
    edit
      ? `
    background: #6b7280;
    color: white;
    &:hover {
      background: #4b5563;
      transform: translateY(-1px);
    }
  `
      : toggle
      ? `
    background: ${isActive ? "#ea580c" : "#f97316"};
    color: white;
    &:hover {
      background: ${isActive ? "#c2410c" : "#d97706"};
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

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1f2937;
  font-size: 0.9rem;
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

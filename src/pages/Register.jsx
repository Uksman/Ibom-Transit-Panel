import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom"; // Add useNavigate
import { useAuth } from "../contexts/AuthContext";
import styled from "styled-components";
import { FaBus, FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "admin", // Default to admin for this panel
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, register } = useAuth(); // Add register from useAuth
  const navigate = useNavigate(); // For programmatic navigation

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.phone,
      formData.role
    );

    if (result.success) {
      navigate("/dashboard", { replace: true }); // Redirect to dashboard
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <LogoContainer>
          <FaBus size={40} />
        </LogoContainer>
        <RegisterHeader>
          <h1>Bus Admin Panel</h1>
          <p>Create your admin account</p>
        </RegisterHeader>

        <RegisterForm onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage>
              <span>{error}</span>
            </ErrorMessage>
          )}

          <FormGroup>
            <FormLabel htmlFor="name">Full Name</FormLabel>
            <InputWrapper>
              <FormInput
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="email">Email Address</FormLabel>
            <InputWrapper>
              <FormInput
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="password">Password</FormLabel>
            <InputWrapper>
              <FormInput
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              <TogglePassword
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </TogglePassword>
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="phone">Phone Number</FormLabel>
            <InputWrapper>
              <FormInput
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </InputWrapper>
          </FormGroup>

          <RegisterBtn type="submit" disabled={loading}>
            {loading ? <Spinner /> : "Sign Up"}
          </RegisterBtn>
        </RegisterForm>

        <RegisterFooter>
          <p>Already have an account?</p>
          <LoginLink href="/login">Sign in here</LoginLink>
        </RegisterFooter>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;

// Styled components (unchanged from previous response)
const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #f97316 0%, #ea580c 100%);
  padding: 1rem;
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
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    );
    pointer-events: none;
  }
`;

const RegisterCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  width: 100%;
  max-width: 420px;
  position: relative;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
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

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: #f97316;
`;

const RegisterHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
    background: linear-gradient(to right, #f97316, #ea580c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #6b7280;
    margin: 0;
    font-size: 0.95rem;
  }
`;

const RegisterForm = styled.form`
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
  position: relative;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1f2937;
  font-size: 0.9rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  color: #3c3c41;
  background: #f9fafb;
  transition: all 0.3s ease;
  box-sizing: border-box;

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

const TogglePassword = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  display: flex;
  align-items: center;

  &:hover {
    color: #f97316;
  }
`;

const RegisterBtn = styled.button`
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(to right, #f97316, #ea580c);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(254, 226, 226, 0.9);
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  animation: slideIn 0.3s ease-out;

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

const RegisterFooter = styled.div`
  text-align: center;
  font-size: 0.85rem;
  color: #6b7280;
`;

const LoginLink = styled.a`
  display: block;
  margin-top: 0.75rem;
  color: #f97316;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s ease;

  &:hover {
    color: #ea580c;
    text-decoration: underline;
  }
`;
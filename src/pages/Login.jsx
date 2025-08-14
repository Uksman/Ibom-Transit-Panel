import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styled from "styled-components";
import { FaBus, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, isAuthenticated, forgotPassword } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    const result = await forgotPassword(forgotPasswordEmail);

    if (result.success) {
      setSuccessMessage("A password reset link has been sent to your email.");
      setForgotPasswordEmail("");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const toggleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPassword(!showForgotPassword);
    setError("");
    setSuccessMessage("");
    setForgotPasswordEmail("");
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LogoContainer>
          <FaBus size={32} />
        </LogoContainer>
        <LoginHeader>
          <h1>Ibom Transit</h1>
          <p>{showForgotPassword ? "Reset your password" : "Admin Login"}</p>
        </LoginHeader>

        {showForgotPassword ? (
          <LoginForm onSubmit={handleForgotPasswordSubmit}>
            {error && (
              <ErrorMessage>
                <span>{error}</span>
              </ErrorMessage>
            )}
            {successMessage && (
              <SuccessMessage>
                <span>{successMessage}</span>
              </SuccessMessage>
            )}

            <FormGroup>
              <FormLabel htmlFor="forgot-email">Email Address</FormLabel>
              <InputWrapper>
                <FormInput
                  type="email"
                  id="forgot-email"
                  name="email"
                  value={forgotPasswordEmail}
                  onChange={handleForgotPasswordChange}
                  required
                  placeholder="Enter your email"
                />
              </InputWrapper>
            </FormGroup>

            <LoginBtn type="submit" disabled={loading}>
              {loading ? <Spinner /> : "Send Reset Link"}
            </LoginBtn>
            <BackLink href="#" onClick={toggleForgotPassword}>
              Back to Login
            </BackLink>
          </LoginForm>
        ) : (
          <LoginForm onSubmit={handleSubmit}>
            {error && (
              <ErrorMessage>
                <span>{error}</span>
              </ErrorMessage>
            )}

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

            <LoginBtn type="submit" disabled={loading}>
              {loading ? <Spinner /> : "Login"}
            </LoginBtn>
          </LoginForm>
        )}

        <LoginFooter>
          <p>Authorized access only</p>
          {/* {!showForgotPassword && (
            <>
              <ForgotPassword href="#" onClick={toggleForgotPassword}>
                Forgot password?
              </ForgotPassword>
              <RegisterLink href="/register">
                Don't have an account? Sign up
              </RegisterLink>
            </>
          )} */}
        </LoginFooter>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;

// Styled components with responsive adjustments to match Register.jsx
const LoginContainer = styled.div`
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

  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.2);
  width: 100%;
  max-width: 360px; /* Reduced from 420px to match Register */
  position: relative;
  animation: fadeIn 0.5s ease-out;

  @media (max-width: 480px) {
    max-width: 90%;
    padding: 1.5rem;
  }

  @media (max-width: 360px) {
    padding: 1.25rem;
  }

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
  margin-bottom: 1.25rem;
  color: #f97316;

  @media (max-width: 480px) {
    margin-bottom: 1rem;
    svg {
      font-size: 28px;
    }
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;

  h1 {
    font-size: 1.75rem;
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
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    h1 {
      font-size: 1.5rem;
    }
    p {
      font-size: 0.85rem;
    }
  }
`;

const LoginForm = styled.form`
  margin-bottom: 1.25rem;

  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  position: relative;

  @media (max-width: 480px) {
    margin-bottom: 0.75rem;
  }
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
  color: #1f2937;
  font-size: 0.85rem;

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const InputWrapper = styled.div`
  position: relative;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.9rem;
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

  @media (max-width: 480px) {
    padding: 0.65rem 0.8rem;
    font-size: 0.85rem;
  }
`;

const TogglePassword = styled.button`
  position: absolute;
  right: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.2rem;
  display: flex;
  align-items: center;

  &:hover {
    color: #f97316;
  }

  @media (max-width: 480px) {
    right: 0.8rem;
  }
`;

const LoginBtn = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(to right, #f97316, #ea580c);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.95rem;
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

  @media (max-width: 480px) {
    padding: 0.65rem;
    font-size: 0.9rem;
  }
`;

const Spinner = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @media (max-width: 480px) {
    width: 1.1rem;
    height: 1.1rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(254, 226, 226, 0.9);
  color: #dc2626;
  padding: 0.65rem 0.9rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  animation: slideIn 0.3s ease-out;

  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

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

const SuccessMessage = styled.div`
  background: rgba(209, 250, 229, 0.9);
  color: #047857;
  padding: 0.65rem 0.9rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  animation: slideIn 0.3s ease-out;

  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

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

const LoginFooter = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: #6b7280;

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const ForgotPassword = styled.a`
  display: block;
  margin-top: 0.65rem;
  color: #f97316;
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.2s ease;

  &:hover {
    color: #ea580c;
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }
`;

const RegisterLink = styled.a`
  display: block;
  margin-top: 0.65rem;
  color: #f97316;
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.2s ease;

  &:hover {
    color: #ea580c;
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }
`;

const BackLink = styled.a`
  display: block;
  margin-top: 0.65rem;
  color: #f97316;
  text-decoration: none;
  font-size: 0.8rem;
  text-align: center;
  transition: color 0.2s ease;

  &:hover {
    color: #ea580c;
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }
`;

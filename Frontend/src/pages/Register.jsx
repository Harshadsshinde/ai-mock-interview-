import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dob: "",
  });
  const [emailSent, setEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Invalid phone number (10 digits required)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Registration failed");

      setEmailSent(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!otp) {
      setError("Please enter OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Invalid OTP");

      navigate("/login", { state: { registrationSuccess: true } });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-purple-500 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          {emailSent ? "Verify Your Email" : "Create New Account"}
        </h2>

        {error && (
          <motion.div
            className="text-red-500 text-sm text-center mt-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {!emailSent ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <InputField label="Full Name" type="text" name="name" value={formData.name} onChange={handleChange} />
            <InputField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
            <InputField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />
            <InputField label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
            <InputField label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} pattern="[0-9]{10}" />
            <InputField label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} max={new Date().toISOString().split("T")[0]} />

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-200 flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : "Create Account"}
            </button>
          </form>
        ) : (
          <motion.div className="mt-6 space-y-4">
            <p className="text-center text-gray-600">We've sent a verification code to</p>
            <p className="text-center font-medium text-gray-900">{formData.email}</p>

            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
              <InputField label="Verification Code" type="text" name="otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
            </motion.div>

            <button
              onClick={handleOtpVerification}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition duration-200 flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : "Verify Code"}
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

const InputField = ({ label, type, name, value, onChange, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <motion.input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      whileFocus={{ scale: 1.02 }}
      {...props}
    />
  </div>
);

const LoadingSpinner = () => (
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

export default Register;

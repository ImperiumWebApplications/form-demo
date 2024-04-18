import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    birthdate: {
      day: "",
      month: "",
      year: "",
    },
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");

  const [focusedField, setFocusedField] = useState(null);

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const emailRegex = /^[\w]+@([\w-]+\.)+[\w-]{2,4}$/;
  const contactNumberRegex =
    /^(\+1|1)?[-.\s]?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let tempErrors = {};
    let formIsValid = true;

    // Full Name Validation
    if (!formData.fullName.trim()) {
      formIsValid = false;
      tempErrors["fullName"] = "Full name is required.";
    } else if (/[^a-zA-Z\s]/.test(formData.fullName)) {
      formIsValid = false;
      tempErrors["fullName"] = "Full name should not contain symbols.";
    }

    // Contact Number Validation
    if (!formData.contactNumber.trim()) {
      formIsValid = false;
      tempErrors["contactNumber"] = "Contact number is required.";
    } else if (!contactNumberRegex.test(formData.contactNumber)) {
      formIsValid = false;
      tempErrors["contactNumber"] =
        "Contact number should be in a valid Canadian phone number format.";
    }

    // Email Validation
    if (!emailRegex.test(formData.email)) {
      formIsValid = false;
      tempErrors["email"] = "Email is not formatted correctly.";
    }

    // Birthdate Validation
    const currentDate = new Date();
    const selectedDate = new Date(
      formData.birthdate.year,
      formData.birthdate.month - 1,
      formData.birthdate.day
    );

    if (
      formData.birthdate.day === "" ||
      formData.birthdate.month === "" ||
      formData.birthdate.year === ""
    ) {
      formIsValid = false;
      tempErrors["birthdate"] = "Please select a valid birthdate.";
    } else if (selectedDate > currentDate) {
      formIsValid = false;
      tempErrors["birthdate"] = "Birthdate cannot be a future date.";
    } else {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();

      if (
        formData.birthdate.year > currentYear ||
        (formData.birthdate.year === currentYear &&
          (formData.birthdate.month > currentMonth + 1 ||
            (formData.birthdate.month === currentMonth + 1 &&
              formData.birthdate.day > currentDay)))
      ) {
        formIsValid = false;
        tempErrors["birthdate"] = "Birthdate cannot be a future date.";
      }
    }

    // Password Validation
    if (!formData.password) {
      formIsValid = false;
      tempErrors["password"] = "Password is required.";
    } else if (!passwordRegex.test(formData.password)) {
      formIsValid = false;
      tempErrors["password"] =
        "Password should contain at least 8 characters, including lowercase, uppercase, and numbers.";
    }

    // Password Matching Validation
    if (formData.password !== formData.confirmPassword) {
      formIsValid = false;
      tempErrors["confirmPassword"] = "Passwords do not match.";
    }

    setErrors(tempErrors);

    if (formIsValid) {
      try {
        const payload = {
          full_name: formData.fullName,
          contact_number: formData.contactNumber,
          email: formData.email,
          date_of_birth: `${formData.birthdate.year}-${formData.birthdate.month}-${formData.birthdate.day}`,
          password: formData.password,
          confirm_password: formData.confirmPassword,
        };

        await axios.post(
          "https://fullstack-test-navy.vercel.app/api/users/create",
          payload
        );

        // Reset form data after successful submission
        setFormData({
          fullName: "",
          contactNumber: "",
          birthdate: {
            day: "",
            month: "",
            year: "",
          },
          email: "",
          password: "",
          confirmPassword: "",
        });

        // Reset errors
        setErrors({});

        // Show success message
        setSuccessMessage("User account successfully created.");

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (error) {
        console.error("Error submitting form:", error);
        // Show failure message
        setFailureMessage("An error occurred while creating the user account.");
        // Clear failure message after 3 seconds
        setTimeout(() => {
          setFailureMessage("");
        }, 3000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("birthdate")) {
      const [_, field] = name.split(".");
      setFormData((prevFormData) => ({
        ...prevFormData,
        birthdate: {
          ...prevFormData.birthdate,
          [field]: value,
        },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  useEffect(() => {
    // Check if the field becomes valid and remove the validation error
    if (
      errors.fullName &&
      formData.fullName.trim() &&
      !/[^a-zA-Z\s]/.test(formData.fullName)
    ) {
      setErrors((prevErrors) => ({ ...prevErrors, fullName: "" }));
    }
    if (
      errors.contactNumber &&
      contactNumberRegex.test(formData.contactNumber)
    ) {
      setErrors((prevErrors) => ({ ...prevErrors, contactNumber: "" }));
    }
    if (errors.email && emailRegex.test(formData.email)) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
    }
    if (
      errors.birthdate &&
      formData.birthdate.day !== "" &&
      formData.birthdate.month !== "" &&
      formData.birthdate.year !== ""
    ) {
      const currentDate = new Date();
      const selectedDate = new Date(
        formData.birthdate.year,
        formData.birthdate.month - 1,
        formData.birthdate.day
      );
      if (selectedDate <= currentDate) {
        setErrors((prevErrors) => ({ ...prevErrors, birthdate: "" }));
      }
    }
    if (errors.password && passwordRegex.test(formData.password)) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
    }
    if (
      errors.confirmPassword &&
      formData.password === formData.confirmPassword
    ) {
      setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: "" }));
    }
  }, [formData, errors]);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
      <div className="hidden md:block">
        {successMessage && (
          <div className="bg-green-100 text-green-800 px-4 py-2 mb-4 rounded-md text-center sm:text-left">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            {successMessage}
          </div>
        )}
        {failureMessage && (
          <div className="bg-red-100 text-red-800 px-4 py-2 mb-4 rounded-md text-center sm:text-left">
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
            {failureMessage}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block mb-2 font-bold text-gray-700"
          >
            Full Name*
          </label>
          <input
            type="text"
            onChange={handleChange}
            id="fullName"
            name="fullName"
            value={formData.fullName}
            className="w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:border-teal-500"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="contactNumber"
            className="block mb-2 font-bold text-gray-700"
          >
            Contact Number*
          </label>
          <div className="relative">
            <input
              type="tel"
              name="contactNumber"
              onChange={handleChange}
              maxLength={10}
              value={formData.contactNumber}
              onFocus={() => handleFocus("contactNumber")}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 pt-4 text-gray-700 border ${
                errors.contactNumber ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:border-teal-500`}
              required
            />
            <label
              htmlFor="contactNumber"
              onClick={() => handleFocus("contactNumber")}
              className={`absolute top-0 left-0 px-1 py-0 text-sm transition-all duration-200 ease-in-out origin-left cursor-text ${
                errors.contactNumber
                  ? "text-red-500 transform -translate-y-2 text-xs bg-white"
                  : focusedField === "contactNumber" || formData.contactNumber
                  ? "transform -translate-y-2 text-teal-500 text-xs bg-white"
                  : "text-gray-600"
              }`}
            >
              Contact Number*
            </label>
          </div>
          {errors.contactNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-bold text-gray-700">
            Birthdate*
          </label>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <select
              name="birthdate.day"
              value={formData.birthdate.day}
              onChange={handleChange}
              className="w-1/3 px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:border-teal-500"
              required
            >
              <option value="">Day*</option>
              {/* Add day options */}
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <select
              name="birthdate.month"
              value={formData.birthdate.month}
              onChange={handleChange}
              className="w-1/3 px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:border-teal-500"
              required
            >
              <option value="">Month*</option>
              {/* Add month options */}
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <select
              name="birthdate.year"
              value={formData.birthdate.year}
              onChange={handleChange}
              className="w-1/3 px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:border-teal-500"
              required
            >
              <option value="">Year*</option>
              {/* Add year options */}
              {Array.from({ length: 100 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          {errors.birthdate && (
            <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 font-bold text-gray-700">
            Email Address*
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              onFocus={() => handleFocus("email")}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 pt-4 text-gray-700 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:border-teal-500`}
              required
            />
            <label
              htmlFor="email"
              onClick={() => handleFocus("email")}
              className={`absolute top-0 left-0 px-1 py-0 text-sm transition-all duration-200 ease-in-out origin-left cursor-text ${
                errors.email
                  ? "text-red-500 transform -translate-y-2 text-xs bg-white"
                  : focusedField === "email" || formData.email
                  ? "transform -translate-y-2 text-teal-500 text-xs bg-white"
                  : "text-gray-600"
              }`}
            >
              Email Address*
            </label>
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block mb-2 font-bold text-gray-700"
          >
            Password*
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:border-teal-500"
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="block mb-2 font-bold text-gray-700"
          >
            Confirm Password*
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            id="confirmPassword"
            className="w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:border-teal-500"
            required
          />
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
        <div className="lg:hidden">
          {successMessage && (
            <div className="bg-green-100 text-green-800 px-4 py-2 mb-4 rounded-md text-center sm:text-left">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              {successMessage}
            </div>
          )}
          {failureMessage && (
            <div className="bg-red-100 text-red-800 px-4 py-2 mb-4 rounded-md text-center sm:text-left">
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
              {failureMessage}
            </div>
          )}
        </div>

        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
        <div className="flex flex-col sm:flex-row sm:justify-center gap-4 mt-4">
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-2 text-teal-600 border border-teal-600 rounded-md focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 text-white bg-teal-600 rounded-md focus:outline-none hover:bg-teal-700"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backButton from '../assets/ReturnArrow.png';
import userProfile from '../assets/6.png';
import '../Styling/SignUpPage.css';
import { getDatabase, ref, set, push, get } from "firebase/database";
import app from '../../firebaseConfi';
import bcrypt from 'bcryptjs';

function SignUpPage() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    username: '',
    email: '',
    password: '',
    signupAsTutor: false,
  });

  const navigate = useNavigate();

  const countries = [
    { value: '', label: 'Select your country' },
    { value: 'usa', label: 'United States' },
    { value: 'canada', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'australia', label: 'Australia' },
    { value: 'germany', label: 'Germany' },
    { value: 'france', label: 'France' },
    { value: 'japan', label: 'Japan' },
    { value: 'china', label: 'China' },
    { value: 'brazil', label: 'Brazil' },
    { value: 'india', label: 'India' },
  ];

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const handleCountryChange = (e) => {
    const value = e.target.value;
    setSelectedCountry(value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      country: value,
      state: '',
    }));
    setSelectedState('');
  };

  const handleStateChange = (e) => {
    const value = e.target.value;
    setSelectedState(value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      state: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    const { email, password, signUpAsTutor, ...userData } = formData;

    if (Object.values(userData).some((field) => field === '')) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    const termsAccepted = document.getElementById('TermsAndService').checked;
    if (!termsAccepted) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    // Check for existing email
    const db = getDatabase(app);
    const userRef = ref(db, "account/user");
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const emailExists = Object.values(snapshot.val()).some((user) => user.email_ === email);
      if (emailExists) {
        setErrorMessage('Email already exists. Please log in.');
        return;
      }
    }

    setErrorMessage('');
    const hashedPassword = await bcrypt.hash(password, 10);
    const dataToSave = { ...userData, email_: email, password_: hashedPassword };

    if (signUpAsTutor) {
      navigate('/tutorSignup', { state: dataToSave });
    } else {
      // Save user data directly
      const userRef = push(ref(db, "account/user"));
      await set(userRef, dataToSave);
      navigate('/AccountConfirmation');
    }
  }; 

  return (
    <div className="SignUpPageRootContainer">
      <div className="SignUpPageMainContent">
        <div className="NewUserPPSec">
          <img className="NewUserProfile" src={userProfile} alt="userProfile" />
          <button className="AddNewProfilePicButton" type="button">+</button>
        </div>

        <h1 className="heading">Create New Account</h1>

        <form onSubmit={handleFormSubmit}>
          <div className="InputFirstRow">
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First Name*"
              required
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />

            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Last Name*"
              required
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <div className="InputSecondRow">
            <select id="country" name="country" value={formData.country} onChange={handleCountryChange} required>
              {countries.map((country) => (
                <option id="countryOptions" key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>

            <select id="state" name="state" value={formData.state} onChange={handleStateChange} required>
              <option value="" disabled>Select your state</option>
              {selectedCountry === 'usa' ? (
                usStates.map((state) => (
                  <option id="stateOptions" key={state} value={state}>
                    {state}
                  </option>
                ))
              ) : (
                <option value="International">International</option>
              )}
            </select>

            <input
              type="text"
              id="city"
              name="city"
              placeholder="City*"
              required
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />

            <input
              type="number"
              id="postalCode"
              name="postalCode"
              placeholder="Postal Code*"
              required
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
          </div>
 
          <div className="InputThirdSection">
            <input
              type="text"
              id="userName"
              name="username"
              placeholder="Username*"
              required
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />

            <input
              type="email"
              id="newEmail"
              name="newEmail"
              placeholder="Email*"
              required
              value={formData.email}  // Make sure value is set here
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <input
              type="password"
              id="newUserPassword"
              name="newUserPassword"
              placeholder="Password*"
              required
              value={formData.password}  // Make sure value is set here
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <div className="TutorSelection">
              <input
                type="checkbox"
                id="signUpAsTutor"
                name="signUpAsTutor"
                checked={formData.signUpAsTutor}
                onChange={(e) => setFormData({ ...formData, signUpAsTutor: e.target.checked })}
              />
              <label htmlFor="signUpAsTutor">Sign up as a Tutor</label>
            </div>

            <div className="TermsAndServiceSection">
              <input type="checkbox" id="TermsAndService" required />
              <label className="TermsAndServiceLabel" htmlFor="TermsAndService">I agree to the Terms of Service and Privacy Policy</label>
            </div>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button className="LogInPageButtons" type="submit">
            {formData.signUpAsTutor ? 'Next' : 'Sign Up'}
          </button>
        </form>

        <Link to="/Login">
          <button className="BackButtonSignUpPage"><img src={backButton} alt="Back" /></button>
        </Link>
      </div>
    </div>
  );
}

export default SignUpPage;
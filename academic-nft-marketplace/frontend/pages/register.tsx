import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/Layout/Layout';

const universities = [
  'Eastern Michigan University',
  'Eastern University', 
  'Thomas Edison State University',
  'Oakland University',
  'Virginia Tech'
];

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    universityEmail: '',
    firstName: '',
    lastName: '',
    university: '',
    studentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setSubmitError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Starting registration for:', formData.email);
      const result = await register(formData);
      
      if (result.needsVerification) {
        console.log('📧 Registration requires verification, redirecting...');
        // Redirect to email verification page
        router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
      } else {
        console.log('✅ Registration complete, redirecting to dashboard...');
        // Direct login success (demo users)
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      setSubmitError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout title="Register - Academic NFT Marketplace">
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-600">🎓</h1>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join the academic achievement marketplace
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {submitError && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Registration Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{submitError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field mt-1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                  University
                </label>
                <select
                  id="university"
                  name="university"
                  required
                  value={formData.university}
                  onChange={handleChange}
                  className="input-field mt-1"
                >
                  <option value="">Select your university</option>
                  {universities.map((uni) => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="universityEmail" className="block text-sm font-medium text-gray-700">
                  University Email
                </label>
                <input
                  id="universityEmail"
                  name="universityEmail"
                  type="email"
                  required
                  value={formData.universityEmail}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="your.name@university.edu"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use your official university email address for verification
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Personal Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="your.personal@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Enter secure password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Confirm your password"
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                  Student ID (Optional)
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
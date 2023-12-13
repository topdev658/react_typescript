import { SERVER_BASE_URL } from '../constants/urles';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  userId?: number; // Add userId to the LoginResponse interface
  error?: string;
  mobile?:string;
  is2FaEnable?:boolean;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${SERVER_BASE_URL}/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const userData = await response.json();
    console.log(userData);

    if (!response.ok) {
      return { success: false, error: userData?.error };
    }

    // Include userId in the response if available
    return { success: true, token: userData?.token, userId: userData?.data?.id,mobile:userData?.data?.mobile,is2FaEnable:userData?.data.is2FAEnabled };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, error: 'An error occurred during login.' };
  }
};

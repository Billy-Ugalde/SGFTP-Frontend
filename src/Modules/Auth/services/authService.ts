// import axios from 'axios';

// export const loginRequest = async (credentials: { email: string; password: string }) => {
//   const response = await axios.post('/api/auth/login', credentials);
//   return response.data.token;
// };
export const loginRequest = async (credentials: { email: string; password: string }) => {
  const { email, password } = credentials;

  if (email === 'admin' && password === '1234') {
    return 'fake-jwt-token-123';
  } else {
    throw new Error('Credenciales inválidas');
  }
};

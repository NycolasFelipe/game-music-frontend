/** Public user data returned by the backend. */
export interface User {
  id: string;
  username: string;
}

/** Credentials sent to the login endpoint. */
export interface LoginInput {
  username: string;
  password: string;
}

/** Successful login response from the backend. */
export interface LoginResponse {
  accessToken: string;
  user: User;
}

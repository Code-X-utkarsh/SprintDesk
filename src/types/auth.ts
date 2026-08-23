export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  image?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface LoginResponse extends AuthUser {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export type AuthStatus = 'idle' | 'initializing' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  error: string | null;
  isSimulatedExpired: boolean;
}

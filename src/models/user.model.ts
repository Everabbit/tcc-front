export interface UserI {
  id?: number;
  fullName: string;
  email: string;
  password: string;
  username?: string | null;
  lastAcess?: Date | null;
  image?: string | null;
  userPreferences?: UserPreferencesI;
}

export interface UserPreferencesI {
  id?: number;
  userId?: number;
  user?: UserI;
  theme?: string;
  darkMode?: boolean;
  notifyEnabled?: boolean;
  notifyEmail?: boolean;
  notifyPush?: boolean;
}

export interface UserRegisterI {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

export interface UserLoginI {
  email: string;
  password: string;
}

export interface UserBasicI {
  id: number;
  fullName?: string;
  email?: string;
  image?: string;
  username?: string;
  userPreferences?: UserPreferencesI;
}

export interface PasswordChangeI {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

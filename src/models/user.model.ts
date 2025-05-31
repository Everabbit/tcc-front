export interface UserI {
  id?: number;
  fullName: string;
  email: string;
  password: string;
  username?: string | null;
  lastAcess?: Date | null;
  image?: string | null;
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
  initials?: string;
}

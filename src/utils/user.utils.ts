import { UserBasicI } from 'src/models/user.model';

const USER_BASIC_KEY = 'user_basic_info';

export const setUserBasicInfo = (user: UserBasicI | null): void => {
  if (user) {
    localStorage.setItem(USER_BASIC_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_BASIC_KEY);
  }
};

export const getUserBasicInfo = (): UserBasicI | null => {
  const storedUser = localStorage.getItem(USER_BASIC_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
};

export const clearUserBasicInfo = (): void => {
  localStorage.removeItem(USER_BASIC_KEY);
};

export const toBase64 = (str: string) => {
  return window.btoa(str);
};

export const fromBase64 = (str: string) => {
  return window.atob(str);
};

export const clone = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

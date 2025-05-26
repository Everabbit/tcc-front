export const toBase64 = (str: string) => {
  return window.btoa(str);
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove o prefixo (ex: "data:image/png;base64,") se necessário
        const base64String = reader.result.split(',')[1] || reader.result;
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const fileFromBase64 = (base64: string, filename: string, mimeType: string): File => {
  // Converte a string base64 para um array de bytes
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  return new File([blob], filename, { type: mimeType });
};

export const fromBase64 = (str: string) => {
  return window.atob(str);
};

export const clone = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

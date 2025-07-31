export const getRandomColor = (): string => {
  const pastelColors = [
    '#FFB3BA', // Pastel Red
    '#FFDFBA', // Pastel Orange
    '#FFFFBA', // Pastel Yellow
    '#BAFFC9', // Pastel Green
    '#BAE1FF', // Pastel Blue
    '#E0BBE4', // Pastel Purple
    '#FFC0CB', // Pink
    '#F0E68C', // Khaki
    '#ADD8E6', // Light Blue
    '#90EE90', // Light Green
  ];
  const randomIndex = Math.floor(Math.random() * pastelColors.length);
  return pastelColors[randomIndex];
};

export const getContrastColor = (color: string): string => {
  const getBrightness = (hexColor: string): number => {
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  return getBrightness(color) > 180 ? '#000000' : '#FFFFFF';
};

export const getUsernameInitials = (username: string): string => {
  if (!username) return '';
  const names = username.split(' ');
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase();
  } else {
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  }
};

export const getIconForFileType = (type: string): string => {
  if (type.startsWith('image/')) return 'mdi-image';
  if (type === 'application/pdf') return 'mdi-file-pdf-box';
  if (type === 'application/zip') return 'mdi-folder-zip';
  return 'mdi-file-document-outline';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (date: Date): string => {
  if (!date) {
    return '';
  }
  const newDate = new Date(date.toString());
  const day = newDate.getDate().toString().padStart(2, '0');
  const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
  const year = newDate.getFullYear();
  return `${day}/${month}/${year}`;
};

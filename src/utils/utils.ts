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

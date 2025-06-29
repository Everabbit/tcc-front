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

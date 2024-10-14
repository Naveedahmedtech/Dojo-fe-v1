export const getRandomColor = () => {
  const warmColors = [
    "#FF6B6B", // Light red - energetic, motivating
    "#FFD93D", // Warm yellow - happy, bright
    "#FF7F50", // Coral - warm, inviting
    "#FFA500", // Orange - warm, motivational
    "#F9A602", // Golden yellow - warmth, energy
    "#FFB74D", // Light orange - warm, optimistic
    "#FFCC80", // Light peach - warm, soft
    "#FF8C00", // Dark orange - energetic, motivational
    "#FF6347", // Tomato - warm, vibrant
    "#FF4500", // Orange-red - bold, motivating
    "#FFD700", // Gold - warm, luxurious
    "#FFE4B5", // Moccasin - light, warm
    "#FFB6C1", // Light pink - soft, warm
    "#FF69B4", // Hot pink - energetic, happy
    "#F4A460", // Sandy brown - warm, inviting
    "#DAA520", // Goldenrod - warm, motivational
    "#BDB76B", // Dark khaki - earthy, warm
    "#CD5C5C", // Indian red - warm, motivating
    "#FF1493", // Deep pink - bold, happy
    "#FF69B4", // Hot pink - vibrant, happy
  ];

  // Randomly select a color from the warmColors array
  const randomColor = warmColors[Math.floor(Math.random() * warmColors.length)];

  return randomColor;
};

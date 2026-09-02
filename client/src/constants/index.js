export const THEMES = [
  { id: "navy-gold", name: "Navy Gold", colors: ["#1d4352", "#d6b878", "#0d2734", "#f3dfb0"] },
  { id: "wine-rose", name: "Wine Rose", colors: ["#542b42", "#e9a6b8", "#291727", "#f2c5d5"] },
  { id: "burnt-orange", name: "Burnt Orange", colors: ["#68422d", "#f3d3a3", "#332016", "#f7dfbb"] },
  { id: "icy-silver", name: "Icy Silver", colors: ["#294b60", "#c9e8ed", "#162d3d", "#e4f2f4"] },
  { id: "olive-lime", name: "Olive Lime", colors: ["#354a35", "#d8e6a8", "#1c2a20", "#e5ebc5"] },
  { id: "charcoal-coral", name: "Charcoal Coral", colors: ["#351e25", "#ef9a9a", "#171317", "#f2c2bd"] },
  { id: "navy-amber", name: "Navy Amber", colors: ["#1f405c", "#f2b866", "#102437", "#f3dfb0"] },
  { id: "graphite-turquoise", name: "Graphite Turquoise", colors: ["#29464d", "#67d8d2", "#18272d", "#c8e8e7"] },
  { id: "forest-gold", name: "Forest Gold", colors: ["#294836", "#d6b878", "#172a20", "#ead8a8"] },
  { id: "midnight-lavender", name: "Midnight Lavender", colors: ["#263b67", "#c4b5fd", "#121c38", "#e5ddff"] },
  { id: "smoky-coral", name: "Smoky Coral", colors: ["#40352f", "#f29a78", "#211d1c", "#f5c2ad"] },
  { id: "charcoal-neon-pink", name: "Neon Pink", colors: ["#30233d", "#f472b6", "#171522", "#f2c5df"] },
];

export const getTheme = (themeId) => THEMES.find((theme) => theme.id === themeId) || THEMES[0];

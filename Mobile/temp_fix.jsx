// Clean wallpaper calculation functions
const calculateWallpaperRolls = (width, height) => {
  const squareInches = (parseFloat(width) || 0) * (parseFloat(height) || 0);
  const squareFeet = squareInches / 144;
  let rolls = squareFeet / 50;
  const decimal = rolls - Math.floor(rolls);
  if (decimal >= 0.3) {
    rolls = Math.ceil(rolls);
  } else {
    rolls = Math.max(1, Math.floor(rolls));
  }
  return rolls;
};

const calculateWallpaperCost = (width, height, costPerRoll, implementationCostPerRoll) => {
  const rolls = calculateWallpaperRolls(width, height);
  const totalCost = (rolls * (parseFloat(costPerRoll) || 0)) + (rolls * (parseFloat(implementationCostPerRoll) || 0));
  return totalCost;
};

// JSX fragments for wallpaper table cells
const WallpaperTableCells = ({ m }) => (
  <>
    <View style={[styles.tableCell, styles.mediumColumn]}>
      <Text style={styles.cellText}>
        {(
          ((parseFloat(m.width) || 0) * (parseFloat(m.height) || 0)) / 144
        ).toFixed(1)}
      </Text>
    </View>
    <View style={[styles.tableCell, styles.smallColumn]}>
      <Text style={styles.cellText}>
        {calculateWallpaperRolls(m.width, m.height)}
      </Text>
    </View>
  </>
);

const WallpaperTotalCell = ({ m, type }) => (
  <View style={[styles.tableCell, styles.totalColumn]}>
    <Text style={[styles.cellText, styles.totalCostText]}>
      ₹
      {(() => {
        if (m.totalCost) {
          return m.totalCost.toLocaleString("en-IN");
        } else if (type === "wallpapers") {
          const totalCost = calculateWallpaperCost(
            m.width, 
            m.height, 
            m.costPerRoll, 
            m.implementationCostPerRoll
          );
          return totalCost.toLocaleString("en-IN");
        } else {
          return (m.materialCost || 0).toLocaleString("en-IN");
        }
      })()}
    </Text>
  </View>
);

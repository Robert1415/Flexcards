export const printSpec = {
  cardSizeIn: {
    width: 2.5,
    height: 3.5,
  },
  bleedIn: 0.125,
  safeIn: 0.125,
  dpi: 300,
};

export const inchesToPx = (inches: number, dpi: number) =>
  Math.round(inches * dpi);

export const getTrimSizePx = () => ({
  width: inchesToPx(printSpec.cardSizeIn.width, printSpec.dpi),
  height: inchesToPx(printSpec.cardSizeIn.height, printSpec.dpi),
});

export const getFullBleedSizePx = () => ({
  width: inchesToPx(
    printSpec.cardSizeIn.width + printSpec.bleedIn * 2,
    printSpec.dpi
  ),
  height: inchesToPx(
    printSpec.cardSizeIn.height + printSpec.bleedIn * 2,
    printSpec.dpi
  ),
});

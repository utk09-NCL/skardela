// The sine and the cosine of a whole number of degrees, with only + − × ÷.
// The ECMAScript spec lets each browser approximate "Math.sin", "Math.cos", "Math.atan2", "Math.hypot" and "**".
// Thus two browsers can give a different last bit. Then the same launch could reach the ring in one browser
// and miss in a different browser, and the generator could make a different board for the same day.
// The four operators and "Math.sqrt" give the same result in each browser.

const radiansPerDegree = Math.PI / 180;

// The Taylor series of the sine, for an angle from 0° to 45°: x − x³/3! + x⁵/5! − … + x¹⁷/17!, as nested products.
// Up to 45°, the next term is less than 1e-19, thus the series is as accurate as a number can be.
function smallSine(degrees: number): number {
  const x = degrees * radiansPerDegree;
  let sum = 1;
  for (let n = 17; n >= 3; n -= 2) sum = 1 - ((x * x) / (n * (n - 1))) * sum;
  return x * sum;
}

// The Taylor series of the cosine, for an angle from 0° to 45°: 1 − x²/2! + x⁴/4! − … + x¹⁶/16!.
function smallCosine(degrees: number): number {
  const x = degrees * radiansPerDegree;
  let sum = 1;
  for (let n = 16; n >= 2; n -= 2) sum = 1 - ((x * x) / (n * (n - 1))) * sum;
  return sum;
}

// The sine of an angle from 0° to 90°. Above 45°, it is the cosine of the rest to 90°.
function quarterSine(degrees: number): number {
  return degrees <= 45 ? smallSine(degrees) : smallCosine(90 - degrees);
}

// The sine of a whole number of degrees from 0 to 359. The symmetry of the sine brings each angle to 0° to 90°.
// It is exact at 0°, 90°, 180° and 270°. "0 - value" gives 0 for 0, not -0.
export function sineOf(degrees: number): number {
  const rest = degrees % 90;
  switch ((degrees - rest) / 90) {
    case 0:
      return quarterSine(rest);
    case 1:
      return quarterSine(90 - rest);
    case 2:
      return 0 - quarterSine(rest);
    default:
      return 0 - quarterSine(90 - rest);
  }
}

// The cosine of a whole number of degrees from 0 to 359: the sine of the angle 90° after it.
export function cosineOf(degrees: number): number {
  return sineOf((degrees + 90) % 360);
}

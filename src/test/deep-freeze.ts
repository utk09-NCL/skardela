// The machine tests of each puzzle type use this helper. It freezes a state and each object in it.
// Then a change in place throws an error, thus a test finds a "transition" that changes its input.
export function deepFreeze<Value>(value: Value): Value {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) deepFreeze(inner);
  }
  return value;
}

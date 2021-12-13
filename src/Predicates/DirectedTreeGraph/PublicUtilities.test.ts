import { Incrementor } from "./Incrementor";

describe("Incrementor", () => {
  it("Should create an increment class, incrementor increments for each call to either nextValue or getNextValue", () => {
    const incrementor = new Incrementor();
    expect(incrementor.nextValue).toBe(0);
    expect(incrementor.getNextValue()).toBe(1);
    expect(incrementor.getNextValue()).not.toBe(1);

    expect(incrementor.currentValue).toBe(3);
    expect(incrementor.getNextValue()).toBe(3);
    expect(incrementor.currentValue).toBe(4);

    expect(incrementor.nextValue).toBe(4);
  });
});

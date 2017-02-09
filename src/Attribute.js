class Attribute 
{
  constructor(name, base, delta = 0) {
    if (isNaN(base)) { 
      throw new TypeError(`Base attribute must be a number, got ${base}.`); 
    }
    if (isNaN(delta)) {
      throw new TypeError(`Attribute delta must be a number, got ${delta}.`);
    }
    this.name = name;
    this.base = base;
    this.delta = delta;
  }

  lower(amount) {
    this.raise(-amount);
  }

  raise(amount) {
    const newDelta = Math.min(this.delta + amount, 0);
    this.delta = newDelta;
  }

  setBase(amount) {
    this.base = Math.max(amount, 0);
  }

  setDelta(amount) {
    this.delta = Math.min(amount, 0);
  }

  serialize() {
    const { delta, base } = this;
    return { delta, base };
  }
}

module.exports = Attribute;

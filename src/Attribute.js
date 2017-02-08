class Attribute 
{
  constructor(name, base, delta = 0) {
    if (isNaN(base)) { 
      throw new TypeError("Base attribute must be a number."); 
    }
    if (isNaN(delta)) {
      throw new TypeError("Attribute delta must be a number.");
    }
    this.name = name;
    this.base = base;
    this.delta = delta;
  }

  lower(amount) {
    this.raise(-amount);
  }

  raise(amount) {
    const newDelta = Math.min(this.delta - amount, 0);
    this.delta = newDelta;
  }

  setBase(amount) {
    this.base = amount;
  }

  serialize() {
    const { delta, base, name } = this;
    return { delta, base, name };
  }
}

module.exports = Attribute;
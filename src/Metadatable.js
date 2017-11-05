/**
 * Mixin for objects which have a `metadata` property
 * @mixin
 */
const Metadatable = parentClass => class extends parentClass {
  /**
   * Set a metadata value.
   * Warning: Does _not_ autovivify, you will need to create the parent objects if they don't exist
   * @param {string} key   Key to set. Supports dot notation e.g., `"foo.bar"`
   * @param {*}      value Value must be JSON.stringify-able
   *
   * @memberof Metadatable
   * @instance
   * @throws Error
   * @throws RangeError
   */
  setMeta(key, value) {
    if (!this.metadata) {
      throw new Error('Class does not have metadata property');
    }

    let parts = key.split('.');
    const property = parts.pop();
    let base = this.metadata;

    while (parts.length) {
      let part = parts.pop();
      if (!(part in base)) {
        throw new RangeError(`Metadata path invalid: ${key}`);
      }
      base = base[part];
    }

    base[property] = value;
  }

  /**
   * Get metadata by dot notation
   * Warning: This method is _very_ permissive and will not error on a non-existent key. Rather, it will return false.
   * @param {string} key Key to fetch. Supports dot notation e.g., `"foo.bar"`
   * @return {*}
   *
   * @memberof Metadatable
   * @instance
   * @throws Error
   */
  getMeta(key) {
    if (!this.metadata) {
      throw new Error('Class does not have metadata property');
    }

    const base = this.metadata;
    return key.split('.').reduce((obj, index) => obj && obj[index], base);
  }
};

module.exports = Metadatable;

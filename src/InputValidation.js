class InputValidation {
  
  /**
   * Helper for basic input checks such as name entry.
   * @param input
   * @param failure callback
   * @param [optional] regex
   * @return function
   */
  static test(input, regex) {
    regex = regex || /[^a-z]/i;
    if (regex.test(input) || !input) {
      return true
    } 
    return false;
  }

  static isAlphabetic(input) {
    return test(input);
  }

  static isInvalidName(name) {
    if (!name) {
      return 'Please enter a name.';
    }
    if (name.length > 20) {
      return 'Too long, try a shorter name.';
    }
    if (name.length < 3) {
      return 'Too short, try a longer name.';
    }
    if (!/^[a-z]+$/i.test(name)) {
      return 'Your name may only contain A-Z without spaces or special characters.';
    }
    return false;
  }

}

module.exports = InputValidation;
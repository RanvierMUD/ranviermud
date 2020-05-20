
const Random = jest.genMockFromModule('rando-js')

let randomNumber;

function inRange () {
  return randomNumber;
}

function __setRandomReturn(number) {
  randomNumber = number;
}

Random.inRange = inRange;
Random.__setRandomReturn = __setRandomReturn;

module.exports = Random
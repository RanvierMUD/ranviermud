// const Perception = require('../index')
const Engagement = require('../../Engagement')
const PlayerOne = require('../../../playerFixtures/tom.json')
const _ = require('lodash')
const Guard = require('../../intraRoundCommitments/Guard')
const Perception = require('../index')

// jest.mock('../index.js')

describe('Perception', () => {
  // const spyReturns = returnValue => jest.fn(() => returnValue);
  // const setup = (mockOverrides) => {
  //   const mockedFunctions = {
  //     rollDice: spyReturns(1),
  //     ...mockOverrides
  //   }
  //   return {
  //     mockedModule: jest.doMock('../index', () => mockedFunctions)
  //   }
  // }
  const playerOne = PlayerOne
  const playerTwo = _.cloneDeep(PlayerOne)
  playerOne.emit = jest.fn()
  playerTwo.emit = jest.fn()
  playerOne.combatants = new Set()
  playerOne.combatants.add(playerTwo)
  playerOne.combatData.decision = new Guard(playerOne, playerTwo)
  playerTwo.combatData.decision = new Guard(playerTwo, playerOne)
  const engagement = new Engagement(playerOne)
  it('On a 1, emits a crit fail', () => {
    Perception.rollDice = jest.fn(() => 1)
    Perception.perceptionCheck(engagement)

    expect(playerOne.emit).toHaveBeenCalledWith("criticalPerceptFailure", playerTwo)
  })
  it('On a 100, emits a success', () => {
    const threshold = grabPlayersActionPerceptionThreshold(playerTwo)
    Perception.rollDice = jest.fn(() => threshold + 1)
    Perception.perceptionCheck(engagement)
    expect(playerOne.emit).toHaveBeenCalledWith("perceptSuccess",playerTwo.combatData.decision, playerTwo)
  })
  it('Just under the threshold, returns a partial success', () => {
    const threshold = grabPlayersActionPerceptionThreshold(playerTwo)
    Perception.rollDice = jest.fn(() => threshold - 1)
    Perception.perceptionCheck(engagement)
    expect(playerOne.emit).toHaveBeenCalledWith("partialPerceptSuccess",playerTwo.combatData.decision, playerTwo)
  })
})

const grabPlayersActionPerceptionThreshold = (player) => {
  return player.combatData.decision.config.perceptThreshold
}
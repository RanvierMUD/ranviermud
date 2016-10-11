'use strict';

const expect = require('chai').expect;

const Items = require('../../src/items').Items;
const Item = require('../../src/items').Item;

const testItemConfig = {
  short_description: 'potato',
  keywords:          ['potato', 'spud'],
  description:       'a potato',
  inventory:         [],
  room:              2,
  vnum:              4
};
const createTestItems = config => Array(5).fill({}).map(_ => new Item(config));


describe('Item manager', () => {
  const items = new Items();
  const testItems = createTestItems(testItemConfig);

  describe('should be able to get directory strings', () =>{
    expect(typeof items.getScriptsDir() === 'string').to.be.true;
    expect(typeof items.getL10nDir() === 'string').to.be.true;
  });

});

describe('Item class', () => {
  const testItem = new Item({});
});

'use strict';

const expect = require('chai').expect;

const Items = require('../../src/items').Items;
const Item = require('../../src/item').Item;

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

});

describe('Item class', () => {
  const testItem = new Item({});
});

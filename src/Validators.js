var joi = require('joi');

module.exports = {
  item: joi.object().keys({
    id: joi.number().integer().required(),
    name: joi.string().required(),
    roomDesc: joi.string().required(),
    keywords: joi.array().items(joi.string()).min(1),
    description: joi.string()
  }),

  room: joi.object().keys({
    id: joi.number().integer().min(1).required(),
    title: joi.string().required(),
    description: joi.string().required(),
    npcs: joi.array().items(joi.string()),
    items: joi.array().items(joi.string()),
    exits: joi.array().items(joi.object({
      roomId: joi.string().required(),
      direction: joi.string().required(),
      leaveMessage: joi.string().required()
    })).min(0)
  }),

  npc: joi.object().keys({
    id: joi.number().integer().required().min(1),
    name: joi.string().required(),
    keywords: joi.array().items(joi.string()).min(1),
    level: joi.number().integer().required().min(1),
    description: joi.string().required(),
    items: joi.array().items(joi.string()),
    quests: joi.array().items(joi.string()),
    damaage: joi.string()
  }),

  area: joi.object().keys({
    name: joi.string().required(),
    title: joi.string().required(),
    suggestedLevel: joi.string().required()
  }),

  config: joi.object().keys({
    port: joi.number().integer().required(),
    webPort: joi.number().integer().required(),
    webWhitelist: joi.array().items(joi.string()).required(),
    bundles: joi.array().items(joi.string()),
    maxAccountNameLength: joi.number().integer().required(),
    minAccountNameLength: joi.number().integer().required(),
    maxPlayerNameLength: joi.number().integer().required(),
    minPlayerNameLength: joi.number().integer().required(),
    maxCharacters: joi.number().integer().required(),
    allowMultiplay: joi.boolean().required(),
    startingRoom: joi.string().required(),
    moveCommand: joi.string().required(),
    defaultAttributes: joi.object({
      health: joi.number().integer().required(),
      mana: joi.number().integer().required(),
      energy: joi.number().integer().required(),
      strength: joi.number().integer().required(),
      intelligence: joi.number().integer().required(),
      wisdom: joi.number().integer().required(),
      dexterity: joi.number().integer().required(),
      constitution: joi.number().integer().required(),
    }),
    skillLag: joi.number().integer().required()
  })
}
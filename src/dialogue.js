'use strict';

const Random = require('./random').Random;
const _ = require('./helpers');
const util = require('util');

const getTopicWeight = (topic, name, sentence) => {
  let points = 0;

  if (!topic.keywords) {
    throw new ReferenceError('You must supply keywords for ' + name + '.');
  }

  const priority = typeof topic.priority === 'function' ?
    topic.priority() :
    topic.priority;

  const foundEvery = topic.keywords.every ?
   _.toArray(topic.keywords.every)
    .every(str => sentence.includes(str)) :
    false;

  const foundSome = topic.keywords.some ?
   _.toArray(topic.keywords.some)
    .some(str => sentence.includes(str)) :
    false;

  const foundEach = topic.keywords.find ?
   _.toArray(topic.keywords.find)
    .reduce((sum, str) => sentence.includes(str) ? sum + 1 : sum, 0) :
    0;

  if (sentence.includes(name)) { points++; }

  points += foundEvery ? 5 : 0;
  points += foundSome  ? 2 : 0;
  points += foundEach;
  points += priority;

  return points;
};

const getPriorityTopic = (config, sentence) => {
  const priority = { points: 0, topic: null };

  for (let prop in config) {
    const topic = config[prop];
    if (prop === 'player' || prop === 'npc') { continue; }

    const topicWeight = getTopicWeight(topic, prop, sentence);

    if (topicWeight > priority.points) {
      priority.points = topicWeight;
      priority.topic  = topic;
    }
  }

  return priority.topic;
};

// Turns a string into an array of tokens (words)
const stripPunctuation = sentence => sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
const tokenizeSentence = sentence => stripPunctuation(sentence).split(' ');

const handleInteraction = (config, sentence) => {
  const npc    = config.npc;
  const player = config.player;
  if (!npc || !player) {
    throw new ReferenceError('You must include an NPC and a Player in your dialogue config.');
  }

  const priorityTopic = getPriorityTopic(config, sentence);

  if (!priorityTopic) { return; }

  const dialogueHandler = getDialogueHandler(priorityTopic.dialogue.type);
  dialogueHandler(player, npc, priorityTopic);

};

const getDialogueHandler = type => {
  //TODO: Consider using a map instead?
  switch(type) {
    case Types.SIMPLE:
      return simpleDialogueHandler;
    case Types.RANDOM:
      return randomDialogueHandler;
    default:
      throw new ReferenceError("Unsupported dialogue type.");
  }
}

const simpleDialogueHandler = (player, npc, topic) => {
  const spoken = topic.dialogue.say;
  const action = topic.dialogue.action;
  enactDialogue(player, spoken, action);
}

const randomDialogueHandler = (player, npc, topic) => {
  const choice = Random.fromArray(topic.dialogue.choices);
  const spoken = choice.say;
  const action = choice.action;
  enactDialogue(player, spoken, action);
}

const enactDialogue = (player, spoken, action) => {
  if (spoken) { player.say(spoken); }
  if (action) { action(); }
}

//TODO: Consider extracting these enums/consts from the main dialogue script file.
const Priority = Object.freeze({
  'LOWEST':  1,
  'LOW':     2,
  'MEDIUM':  3,
  'HIGH':    4,
  'HIGHEST': 5
});

const Keywords = Object.freeze({
  'QUEST': [
    'quest',
    'mission',
    'explore',
    'journey',
    'adventure',
    'job',
    'gig',
    'opportunity'
  ],
  'BACKSTORY': [
    'history',
    'backstory',
    'awaken',
    'past',
    'before',
    'quarantine',
    'ended'
  ]
});

const Types = Object.freeze({
  'SIMPLE':    'simple',
  'RANDOM':    'random',
  'TIMED':     'timed',
  'SEQUENCED': 'sequenced'
});

exports.Dialogue = {
  stripPunctuation,
  getPriorityTopic,
  handleInteraction,

  /*           Constants                */
  Priority,            Keywords,
  Types
};

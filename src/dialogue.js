'use strict';

const Random = require('./random').Random;
const Type = require('./type').Type;
const _ = require('./helpers');

const getTopicWeight = (topic, name, sentence) => {
  let points = 0;

  if (!topic.keywords) {
    throw new ReferenceError('You must supply keywords for ' + name + '.');
  }

  const priority = typeof topic.priority === 'function' ?
    topic.priority() :
    topic.priority;

  const foundEvery = topic.keywords.every &&
   _.toArray(topic.keywords.every)
    .every(str => sentence.includes(str));

  const foundSome = topic.keywords.some &&
   _.toArray(topic.keywords.some)
    .some(str => sentence.includes(str));

  const foundEach = topic.keywords.find &&
   _.toArray(topic.keywords.find)
    .reduce((sum, str) => sentence.includes(str) ? sum + 1 : sum, 0);

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
    if (Type.isPlayer(topic) || Type.isNpc(topic)) { continue; }

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
//TODO: Consider using an iterator or generator to iterate through NPC dialogue.
// Example -- the 1st time you mention a topic, they say one thing. Then another.
// Or return a function to pass the player obj into.
// Or configure dialogue so if the .dialogue property is an array,
// And the config has a delay setting,
// It will say the dialogue once every `delay` ms.
// Unless the player leaves the room.

const dialogueFrom = topic => {
  if (topic.dialogue.substring) { return topic.dialogue; }
  if (Array.isArray(topic.dialogue)) {
    return Random.fromArray(topic.dialogue);
  }
};


const handleInteraction = (config, sentence) => {
  const npc    = config.npc;
  const player = config.player;
  if (!npc || !player) {
    throw new ReferenceError('You must include an NPC and a Player in your dialogue config.');
  }
};

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

const timed = (sentence, config) => {};
const sequence = (sentence, config) => {};


exports.Dialogue = {
  stripPunctuation,
  getPriorityTopic,
  handleInteraction,

  /*           Constants                */
  Priority,            Keywords,
  Types
};

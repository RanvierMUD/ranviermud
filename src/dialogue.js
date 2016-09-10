'use strict';

const Random = require('./random').Random;
const _ = require('./helpers');
/**
 * Did the tokenized dialogue contain a keyword?
 * @param  tokens -- array of strings to search
 * @param  topic -- a string describing a topic
 * @return boolean isFound
 */
const hasKeyword = (tokens, topic) => {
  const keywords = topic.keywords;
  const found = keywords.reduce((found, keyword) => found || _.has(tokens, keyword), false);
  return found;
};
/**
 * Get a list of potential topics based on dialogue.
 * @param tokens -- array of strings to search
 * @param config -- the NPC's dialogue config
 * @return [] topics the dialogue might be about
 */
const findPotentialTopics = (tokens, config) => {
  const topics = [];

  for (let topic in config) {
    const found = hasKeyword(tokens, config[topic]);
    if (found) { topics.push(topic); }
  }

  return topics;
};

const getPriorityTopic = (topicList, config) => {
  const priorityTopic = topicList.reduce((highest, topic) => {
    const currentTopic = config[topic];
    if (!highest) { return currentTopic; }

    if (currentTopic.priority > highest.priority) { return currentTopic; }
    return highest;
  }, null);
  return priorityTopic;
};

// Turns a string into an array of tokens (words)
const tokenizeSentence = sentence => sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').split(' ');

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
}

/**
 *
 * @param
 * @param
 * @return
 */
const getNpcResponse = (sentence, config) => {
  const tokens = tokenizeSentence(sentence);
  const topics = findPotentialTopics(tokens, config);

  if (!topics.length) { return null; }

  const priorityTopic = getPriorityTopic(topics, config);
  return dialogueFrom(priorityTopic);
};

const handleInteraction = (player, sentence, config) => {
  console.log('stuff');
}

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
    'adventure'
  ]
});

exports.Dialogue = {
  hasKeyword,          tokenizeSentence,
  findPotentialTopics, getPriorityTopic,
  getNpcResponse,      handleInteraction,
  /*           Constants                */
  Priority,            Keywords,
};

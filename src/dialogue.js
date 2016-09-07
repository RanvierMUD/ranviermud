'use strict';

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

/** *  * @param  * @param  * @return  */
const parseSentence = (sentence, config) => {
  const tokens = tokenizeSentence(sentence);
  const topics = findPotentialTopics(tokens, config);
};



exports.Dialogue = {
  hasKeyword,          tokenizeSentence,
  findPotentialTopics, getPriorityTopic,
};

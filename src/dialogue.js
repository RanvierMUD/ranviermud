'use strict';

const _ = require('./helpers');

const hasKeyword = (tokens, topic) => {
  const keywords = topic.keywords;
  const found = keywords.reduce((found, keyword) => found || _.has(tokens, keyword), false);
  return found;
};

const findPotentialTopics = (tokens, config) => {
  const topics = [];

  for (let topic in config) {
    const found = hasKeyword(tokens, config[topic]);
    if (found) { topics.push(topic); }
  }

  return topics;
};

const tokenizeSentence = sentence => sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').split(' ');

const parseSentence = (sentence, config) => {
  const tokens = tokenizeSentence(sentence);
  const topics = findPotentialTopics(tokens, config);
};


exports.Dialogue = {
  hasKeyword,          tokenizeSentence,
  findPotentialTopics,
};

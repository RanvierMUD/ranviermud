'use strict';

const _ = require('./helpers');

const hasKeyword = (tokens, topic) => {
  const keywords = topic.keywords;
  const found = keywords.reduce((found, keyword) => found || _.has(tokens, keyword), false);
  return found;
};

const parseSentence = (sentence, config) => {
  const tokens = tokenizeSentence(sentence);
  const topics = [];

  for (let topic in config) {
    const found = hasKeyword(tokens, config[topic]);
    if (found) { topics.push(topic); }
  }


};



const tokenizeSentence = sentence => sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').split(' ');

exports.Dialogue = {
  hasKeyword, tokenizeSentence
};

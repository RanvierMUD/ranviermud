const hasKeyword = (sentence, config) => {
  const tokens = tokenizeSentence(sentence);
};

const tokenizeSentence = sentence => sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').split(' ');

exports.Dialogue = {
  hasKeyword, tokenizeSentence
};

"use strict";

module.exports = {
  getEntropy: (text) => {
    const symbolCount = new Map();

    countOccurencesOfEachSymbol(text, symbolCount);
    const probabilities = calculateProbabilityForEachSymbol(symbolCount, text);

    return calculateEntropy(probabilities);
  },
};
const calculateEntropy = (probabilities) =>
  -probabilities.reduce(
    (sum, probability) => sum + probability * Math.log2(probability),
    0
  );

const calculateProbabilityForEachSymbol = (symbolCount, text) =>
  Array.from(symbolCount.values(), (count) => count / text.length);

const countOccurencesOfEachSymbol = (text, symbolCount) =>
  [...text].forEach((symbol) =>
    symbolCount.set(symbol, (symbolCount.get(symbol) ?? 0) + 1)
  );

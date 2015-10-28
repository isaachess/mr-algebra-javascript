// @flow

import {parseExpression, printExpression} from './expression-parser.js';
import {Expression} from './types.js';

var input:string = process.argv[2];

var expression:Expression = parseExpression(input);
console.log('expression', expression);

var printedExpression = printExpression(expression);
console.log('printedExpression', printedExpression)

// @flow

import {readExpression, showExpression, simplify} from './expression-parser.js';
import {Expression} from './types.js';

var input:string = process.argv[2];
var expression:Expression = readExpression(input);
var printedExpression = showExpression(expression);
var simplified = simplify(expression);
console.log('simplified', showExpression(simplified));

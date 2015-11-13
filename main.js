// @flow

import {readExpression, showExpression, simplify} from './expression-parser.js';
import {Expression} from './types.js';

var input:string = process.argv[2];

var expression:Expression = readExpression(input);
console.log('expression', expression);

var printedExpression = showExpression(expression);
console.log('printedExpression', printedExpression);

var simplified = simplify(expression);
console.log('simplified', simplified);
console.log('simplified', showExpression(simplified));

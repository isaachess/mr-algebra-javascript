// @flow

import {log} from './debug.js'
import {readExpression, showExpression, simplify} from './expression-parser.js';
import {Expression} from './types.js';

var input:string = process.argv[2];

var expression:Expression = readExpression(input);
log('expression', expression);

var printedExpression = showExpression(expression);
log('printedExpression', printedExpression);

var simplified = simplify(expression);
log('simplified', simplified);
log('simplified', showExpression(simplified));

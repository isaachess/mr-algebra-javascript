// @flow

import _ from 'lodash'
import {isNully} from './modash.js' // need some mo?
import {Expression} from './types.js';
import {operatorsByPrecedence} from './constants.js';

var numberOperations = {
    '+': (o1, o2) => o1 + o2,
    '-': (o1, o2) => o1 - o1,
    '/': (o1, o2) => o1 / o2,
    '*': (o1, o2) => o2 * o2,
    '^': (o1, o2) => o1 ^ o2
}

export function parseExpression(input:string):Expression {
    var nextOperatorIndex = findNextOperator(input);
    if (!isNully(nextOperatorIndex)) {
        var operand1 = input.slice(0, nextOperatorIndex);
        var operand2 = input.slice(nextOperatorIndex+1);
        return constructBinaryOperation(input[nextOperatorIndex], parseExpression(operand1), parseExpression(operand2));
    } else if (isNumber(input)){
        return Number(input);
    } else {
        return input;
    }
}

export function printExpression(exp:Expression):string {
    if (isNumber(exp)) {
        return String(exp);
    } else if (isVariable(exp)) {
        return exp;
    } else if (isOperation(exp)) {
        if (exp.operands.length !== 2) throw new Error('Operands are not binary.');
        return printExpression(exp.operands[0]) + exp.operator + printExpression(exp.operands[1]);
    } else throw new Error('Cannot determine print expression type for expression' + exp);
}

export function simplifyExpression(exp:Expression):Expression {
    if (isNumber(exp)) {
        return String(exp);
    } else if (isVariable(exp)) {
        return exp;
    } else if (isOperation(exp)) {
        if (exp.operands.length !== 2) throw new Error('Operands are not binary.');
        return printExpression(exp.operands[0]) + exp.operator + printExpression(exp.operands[1]);
    } else throw new Error('Cannot determine print expression type for expression' + exp);
}

//function simplifyOperation(operation:Operation):Expression {
//}

function combineNumbers(operation:Operation):number {
    return numberOperations[operation.operator]()
}

function constructBinaryOperation(operator:Operator, operand1:Expression, operand2:Expression):Operation {
    return {
        operator: operator,
        operands: [operand1, operand2]
    };
}

function findNextOperator(input:string):number { // returns index of the operator
    var indices = _.map(operatorsByPrecedence, (operator) => {
        return input.indexOf(operator);
    });
    return _.find(indices, (index) => index >= 0);
}

function constructOperation(operation, location, input):Operation {

}

function isNumber(exp:Expression):boolean {
    var numExp = Number(exp);
    return _.isFinite(numExp);
}

function isOperation(exp:Expression):boolean {
    return _.isObject(exp) && !!exp.operator;
}

function isVariable(exp:Expression):boolean {
    return _.isString(exp) && exp.length === 1;
}

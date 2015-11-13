// @flow

import _ from 'lodash'
import {isNully} from './modash.js' // need some mo?
import {Expression, ExpOperation, ExpVariable, ExpVariablePowers, ExpNumber, Operator} from './types.js';
import {operatorsByPrecedence} from './constants.js';

var numberOperations = {
    '+': (o1, o2) => o1 + o2,
    '-': (o1, o2) => o1 - o1,
    '/': (o1, o2) => o1 / o2,
    '*': (o1, o2) => o2 * o2,
    '^': (o1, o2) => o1 ^ o2
}

// Read

export function readExpression(input:string):Expression {
    var nextOperatorIndex = findNextOperator(input);

    if (!isNully(nextOperatorIndex)) {
        var operand1 = input.slice(0, nextOperatorIndex);
        var operand2 = input.slice(nextOperatorIndex+1);
        var operator:any = input[nextOperatorIndex];
        return newExpOperation(operator, [readExpression(operand1), readExpression(operand2)]);
    } else if (isNumber(input)) {
        return newExpNumber(Number(input));
    } else {
        return newUnaryExpVariable(1, input);
    }
}

// Show

export function showExpression(exp:Expression):string {
    if (exp.type === "ExpNumber") return showNumber(exp);
    else if (exp.type === "ExpVariable") return showVariable(exp);
    else if (exp.type === "ExpOperation") return showOperation(exp);
    else throw new Error('Cannot determine print expression type for expression' + exp);
}

function showNumber(expNum:ExpNumber):string {
    return String(expNum.num);
}

function showVariable(expVar:ExpVariable):string {
    return String(expVar.coefficient) + showVariablePowers(expVar.powers);
}

function showVariablePowers(expVarPowers:ExpVariablePowers):string {
    var variables = _.sortBy(_.keys(expVarPowers));

    var strings = _.map(variables, (variable) => {
        var power = expVarPowers[variable];
        if (power === 1) return variable;
        else return variable + "^" + String(power);
    })
    return strings.join('');
}

function showOperation(expOp:ExpOperation):string {
    return expOp.operands.map(showExpression).join(expOp.operator);
}

function simplify(exp:Expression):Expression {
    return simplifyMultiplication(exp);
}

function simplifyMultiplication(exp:Expression):Expression {
    if (exp.type === 'ExpNumber') return exp;
    if (exp.type === 'ExpVariable') return exp;
    if (exp.type === 'ExpOperation') {
        if (exp.operator === '+') {
            return newExpOperation('+', exp.operands.map(simplifyMultiplication));
        }
        else if (exp.operator === '*') {
            return simplifyMultiplication(performMultiplication(exp));
        } else {
            throw new Error('Cannot determine operator for simplifyMultiplication operation.');
        }
    } else {
        throw new Error('Cannot determine expression type for simplifyMultiplication');
    }
}

function performMultiplication(exp:ExpOperation):Expression {
    if (exp.operator !== '*') throw new Error('Expression is not multiplication in performMultiplication.');
    return exp.operands.reduce((acc:Expression, operand:Expression) => {
        if (acc.type === 'ExpNumber' && operand.type === 'ExpNumber') return multiplyExpNumbers(acc, operand);
        if (acc.type === 'ExpNumber' && operand.type === 'ExpVariable') return multiplyExpNumberExpVariable(acc, operand);
        if (acc.type === 'ExpVariable' && operand.type === 'ExpNumber') return multiplyExpNumberExpVariable(operand, acc);
        if (acc.type === 'ExpVariable' && operand.type === 'ExpVariable') return multiplyExpVars(acc, operand)
    });
}

function multiplyExpNumbers(expNum1:ExpNumber, expNum2:ExpNumber):ExpNumber {
    return newExpNumber(expNum1.num * expNum2.num);
}

function multiplyExpNumberExpVariable(expNum:ExpNumber, expVar:ExpVariable):ExpVariable {
    return newExpVariable(expNum.num * expVar.coefficient, expVar.powers);
}

function multiplyExpVars(expVar1:ExpVariable, expVar2:ExpVariable):ExpVariable {
    var coefficient = expVar1.coefficient * expVar2.coefficient;
    var powers = _.merge(expVar1.powers, expVar2.powers, (power1, power2, key) => {
        return (power1 || 0) + (power2 || 0);
    })
    return newExpVariable(coefficient, powers);
}

function operandsAreNumbers(operands:Expression[]):boolean {
    return _.every(operands.map((operand) => operand.type === 'ExpNumber'));
}

// Simplify

// export function simplifyExpression(exp:Expression):Expression {
//     if (isNumber(exp)) {
//         return String(exp);
//     } else if (isVariable(exp)) {
//         return exp;
//     } else if (isOperation(exp)) {
//         if (exp.operands.length !== 2) throw new Error('Operands are not binary.');
//         return printExpression(exp.operands[0]) + exp.operator + printExpression(exp.operands[1]);
//     } else throw new Error('Cannot determine print expression type for expression' + exp);
// }

//function simplifyOperation(operation:Operation):Expression {
//}

// function combineNumbers(operation:ExpOperation):number {
//     return numberOperations[operation.operator]()
// }



function findNextOperator(input:string):number { // returns index of the operator
    var indices = _.map(operatorsByPrecedence, (operator) => {
        return input.indexOf(operator);
    });
    return _.find(indices, (index) => index >= 0);
}

// function constructOperation(operation, location, input):ExpOperation {

// }

function isNumber(exp:string):boolean {
    var numExp = Number(exp);
    return _.isFinite(numExp);
}

// function isOperation(exp:Expression):boolean {
//     return _.isObject(exp) && !!exp.operator;
// }

// function isVariable(exp:Expression):boolean {
//     return _.isString(exp) && exp.length === 1;
// }


// Constructors

function newExpOperation(operator:Operator, operands:Expression[]):ExpOperation {
    return {
        type: 'ExpOperation',
        operator: operator,
        operands: operands
    };
}

function newUnaryExpVariable(coefficient:number, variable:string):ExpVariable {
    var variablePowers = {}
    variablePowers[variable] = 1
    return newExpVariable(coefficient, variablePowers)
}

function newExpVariable(coefficient:number, variablePowers:ExpVariablePowers):ExpVariable {
    return {
        type: 'ExpVariable',
        coefficient: coefficient,
        powers: variablePowers
    }
}

function newExpNumber(num:number):ExpNumber {
    return {
        type: 'ExpNumber',
        num: num
    }
}


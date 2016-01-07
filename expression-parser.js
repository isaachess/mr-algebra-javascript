// @flow

import _ from 'lodash'
import {isNully} from './modash.js' // need some mo?
import {Expression, ExpOperation, ExpVariable, ExpVariablePowers, Operator} from './types.js';
import {operatorsByPrecedence} from './constants.js';
import {log} from './debug.js';

var numberOperations = {
    '+': (o1, o2) => o1 + o2,
    // '-': (o1, o2) => o1 - o1,
    // '/': (o1, o2) => o1 / o2,
    '*': (o1, o2) => o2 * o2,
    // '^': (o1, o2) => o1 ^ o2
}

// Read

export function readExpression(input:string):Expression {
    var nextOperatorIndex = findNextOperator(input);

    if (!isNully(nextOperatorIndex)) {
        var operand1 = input.slice(0, nextOperatorIndex);
        var operand2 = input.slice(nextOperatorIndex+1);
        var operator:any = input[nextOperatorIndex];
        return newExpOperation(operator, [readExpression(operand1), readExpression(operand2)]);
    } else if (isVariable(input)) {
        return readExpVariable(input)
    }
    // else you must be wrapped in parens, so we strip them
    else {
        return readExpression(stripParens(input))
    }
}

export function readExpVariable(input:string):ExpVariable {
    var expVar = newExpVariable(1, {})
    var words = splitByChars(input)
    words.forEach((word) => {
        if (isNumber(word)) expVar.coefficient = Number(word)
        else {
            let splitWord = word.split('^')
            let power = (splitWord.length == 1) ? 1 : Number(splitWord[1])
            let powers = {}
            if (splitWord[0].length > 0) powers[splitWord[0]] = power
            expVar = multiplyExpVars(expVar, newExpVariable(1, powers))
        }
    })

    return expVar
}



function splitByChars(input:string):string[] {
    var splitted = []
    var previousIndex = 0
    for (var i = 0; i < input.length; i++) {
        if (isLetterChar(input.charAt(i))) {
            splitted.push(input.slice(previousIndex, i))
            previousIndex = i
        }
    }
    splitted.push(input.slice(previousIndex))
    return splitted
}

function isLetterChar(cha:string):boolean {
    return /[a-zA-Z]/.test(cha)
}

// Show

export function showExpression(exp:Expression):string {
    if (exp.type === "ExpVariable") return showVariable(exp);
    else if (exp.type === "ExpOperation") return '(' + showOperation(exp) + ')';
    else throw new Error('Cannot determine print expression type for expression' + exp);
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

export function simplify(exp:Expression):Expression {
    var multiplied = simplifyMultiplication(exp);
    log("multiplied", showExpression(multiplied))
    return simplifyAddition(multiplied);
}

// Addition

function simplifyAddition(exp:Expression):Expression {
    var operands = flattenedOperands(exp)
    var simplifiedOperands = operands.reduce((acc:ExpVariable[], operand:ExpVariable) => {
        var addableEdibleIndex = _.findIndex(acc, (expVar:ExpVariable) => canAddExpVariables(expVar, operand))
        if (addableEdibleIndex < 0) acc.push(operand)
        else acc[addableEdibleIndex].coefficient = acc[addableEdibleIndex].coefficient + operand.coefficient
        return acc
    }, [])
    return newExpOperation('+', simplifiedOperands)
}

function canAddExpVariables(expVar1:ExpVariable, expVar2:ExpVariable):boolean {
    return _.isEqual(expVar1.powers, expVar2.powers)
}

function flattenedOperands(exp:Expression):ExpVariable[] {
    if (exp.type === 'ExpVariable') return [exp]
    return exp.operands.reduce((acc:Expression[], operand:Expression) => {
        return acc.concat(flattenedOperands(operand))
    }, [])
}

// Multiplication

function simplifyMultiplication(exp:Expression):Expression {
    exp = _.cloneDeep(exp)
    log('simplifying', showExpression(exp))
    if (exp.type === 'ExpVariable') return exp;
    else if (exp.type === 'ExpOperation') {
        if (exp.operator === '+') {
            return newExpOperation('+', exp.operands.map(simplifyMultiplication));
        }
        else if (exp.operator === '*') {
            return simplifyMultiplication(performMultiplication(exp));
        }
        else {
            throw new Error('Cannot determine operator for simplifyMultiplication operation.');
        }
    }
    else {
        throw new Error('Cannot determine expression type for simplifyMultiplication');
    }
}

function performMultiplication(exp:ExpOperation):Expression {
    exp = _.cloneDeep(exp)
    if (exp.operator !== '*') throw new Error('Expression is not multiplication in performMultiplication.');
    log('performMultiplication', showExpression(exp))
    var x = exp.operands.reduce(performBinaryMultiplication, newExpVariable(1, {}));
    log('x', showExpression(x))
    return x
}

function performBinaryMultiplication(exp1:Expression, exp2:Expression):Expression {
    var x;
    exp1 = _.cloneDeep(exp1)  // I hate mutations!
    exp2 = _.cloneDeep(exp2)

    if (exp1.type === 'ExpVariable' && exp2.type === 'ExpVariable') x = multiplyExpVars(exp1, exp2);
    else if (exp2.type === 'ExpOperation') x = multiplyExpressionExpOperation(exp1, exp2);
    else if (exp1.type === 'ExpOperation') x = multiplyExpressionExpOperation(exp2, exp1);
    //throw new Error('Cannot find performMultiplication case to execute.');
    console.log('exp1', showExpression(exp1), 'exp2', showExpression(exp2), 'result', showExpression(x))
    return x
}

function multiplyExpVars(expVar1:ExpVariable, expVar2:ExpVariable):ExpVariable {

    var coefficient = expVar1.coefficient * expVar2.coefficient;
    var powers = _.merge(_.cloneDeep(expVar1.powers), _.cloneDeep(expVar2.powers), (power1, power2, key) => {
        return (power1 || 0) + (power2 || 0);
    })
    return newExpVariable(coefficient, powers);
}

function multiplyExpressionExpOperation(exp:Expression, expOperation:ExpOperation):ExpOperation {
    // if (exp.type === 'ExpOperation') {
    //     if (exp.operator === '+' && expOperation.operator === '+') return newExpOperation('+', expOperation.operands.map((operand) => performBinaryMultiplication(operand, exp)));
    //     else if (exp.operator === '+' && expOperation.operator === '*') return newExpOperation('+', exp.    operands.map((operand) => performBinaryMultiplication(operand, exp)));
    // }
    // else {

    // }

    if (expOperation.operator === '+') return newExpOperation('+', expOperation.operands.map((operand) => performBinaryMultiplication(operand, exp)));
    if (expOperation.operator === '*') return newExpOperation('*', mapFirst(expOperation.operands, (operand) => performBinaryMultiplication(operand, exp)));
    throw new Error('Unsupported operator in multiplyExpressionExpOperation.')
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

function stripParens(input:string):string {
    if (input.length === 0) return '';
    if (input[0] !== '(' || input[input.length-1] !== ')') throw new Error("Strip parens but ain't parens!");
    else return input.slice(1, input.length-1)
}

function findNextOperator(input:string):number { // returns index of the operator
    var indices = _.map(operatorsByPrecedence, (operator) => {
        return findTopLevelIndexOfOperator(input, operator);
    });
    return _.find(indices, (index) => index >= 0);
}

function findTopLevelIndexOfOperator(input:string, operator:string):number {
    var inputArray = input.split('');
    var finalAcc = inputArray.reduce((acc, character, index) => {
        if (character === '(') acc.parenDepth = acc.parenDepth + 1;
        else if (character === ')') acc.parenDepth = acc.parenDepth - 1;
        else if (acc.parenDepth === 0 && character === operator) acc.index = index;
        return acc;
    }, {
        index: -1,
        parenDepth: 0,
    });
    return finalAcc.index;
}


function isNumber(exp:string):boolean {
    if (exp.length === 0) return false
    var numExp = Number(exp);
    return _.isFinite(numExp);
}


function isVariable(exp:string):boolean {
    return /^\d*(?:[a-zA-Z](?:\^\d+)*)*$/.test(exp)
}


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


/////////////////////
/// Crap functions // // Need some crap?
/////////////////////

function mapFirst<T>(array:T[], func:(item:T)=>T):T[] {
    array[0] = func(array[0]);
    return array;
}

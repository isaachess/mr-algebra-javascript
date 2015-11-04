// @flow

export type Expression = ExpOperation | ExpVariable | ExpNumber;
export type ExpressionType = 'ExpOperation' | 'ExpVariable' | 'ExpNumber';

export type ExpOperation = {
    type: 'ExpOperation';
    operator: Operator;
    operands: Expression[];
}

export type ExpVariable = {
    type: 'ExpVariable';
    coefficient: number;
    powers: ExpVariablePowers;
}

export type ExpVariablePowers = {
    [key:string]:number;  // the number they contain is to which the power they raised be. stuff.
}

export type ExpNumber = {
    type: 'ExpNumber';
    num: number;
}

export type Operator = '+' | '/' | '-' | '*' | '^';



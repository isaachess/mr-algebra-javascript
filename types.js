// @flow

export type Expression = ExpOperation | ExpVariable;
export type ExpressionType = 'ExpOperation' | 'ExpVariable';

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

export type Operator = '+' | '*';



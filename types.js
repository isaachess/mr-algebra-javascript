// @flow

export type Expression = Operation | Variable | number;

export type Operation = {
    operator: Operator;
    operands: Expression[];
}

export type Operator = '+' | '/' | '-' | '*' | '^';

export type Variable = string;

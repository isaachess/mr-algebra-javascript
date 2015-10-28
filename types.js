// @flow

export type Operation = {
    operator: Operator;
    operands: Expression[];
}

export type Operator = '+' | '/' | '-' | '*' | '^';

export type Expression = Operation | Variable | number;

export type Variable = string;

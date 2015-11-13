# 2015-11-12

One bug right now when we did nested parens: 
    - `node index.js '(x+1)*(2*(x+2))'`
    - Returned: `2x^2+2x+4x^2+4`
    - Fix it

Where we left off:
- Just finished handling basic parens (see bug above).
- Need to:
    - Fix the bug above
    - Read non-unary variables and powers
    - Handle plus simplification (we just finished multiplication simplification)

Note: we rock.

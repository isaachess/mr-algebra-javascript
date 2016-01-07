import util from 'util'

export function log(title, obj) {
    console.log(title, util.inspect(obj, {showHidden:false, depth: null}))
}
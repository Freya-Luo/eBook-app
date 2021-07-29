/* eslint-disable*/
Array.prototype.pushWithoutDuplicate = function () {
    for (let i = 0; i < arguments.length; i++) {
        const each = arguments[i]
        // "this" refers to the Array that calls this function
        if (this.indexOf(each) === -1) {
            this.push(each)
        }
    }
}
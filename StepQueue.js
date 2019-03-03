/* Pseudoclass StepQueue */
module.exports = function() {
    let api = new Object();
    let queue = [];
    var idx = 0;

    function append(step) {
        queue.push(step);
    }

    function next() {
        if (queue.length > idx) {
            return queue[idx++];
        } else {
            return null;
        }
    }

    function current() {
        if (queue.length > 0) {
            return queue[idx - 1];
        } else {
            return null;
        }
    }

    function last() {
        if (queue.length > 0) {
            return queue[queue.length - 1];
        } else {
            return null;
        }
    }

    api.append = append;
    api.next = next;
    api.current = current;
    api.last = last;
    return api;
}
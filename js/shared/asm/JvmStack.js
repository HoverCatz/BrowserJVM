class JvmStack {

    /** @type StackNode */ node;

    /** @type boolean */ empty = true;
    /** @type int */ size = 0;

    constructor() {
        this.node = new StackNode(null, null);
    }

    add(object) {
        this.node.next = this.empty ? null : new StackNode(this.node.object, this.node.next);
        this.node.object = object;
        this.empty = false;
        this.size++;
    }

    push(object) {
        this.add(object);
    }

    pop() {
        return this.popNode(this.node);
    }

    popNode(node) {
        if (this.empty)
            throw new Error('EmptyCustomStackException');
        const object = node.object;
        const next = node.next;
        if (next != null) {
            node.object = node.next.object;
            node.next = node.next.next;
        }
        this.empty = next === null;
        this.size--;
        return object;
    }

    popIndex(index) {
        return this.get(index, true);
    }

    getIndex(index) {
        return this.get(index, false);
    }

    get(index, pop) {
        if (index < 0)
            throw new Error('OutOfBoundsCustomStackException');
        if (this.empty)
            throw new Error('EmptyCustomStackException');
        if (index === 0)
            return pop ? this.popNode(this.node) : this.node.object;
        let size = this.size;
        if (index >= size)
            throw new Error('OutOfBoundsCustomStackException');
        let current = this.node;
        let i;
        for (i = 1; i < index; i++)
            current = current.next;
        if (!pop)
            return current.next.object;
        if (index === size - 1) {
            const object = current.next.object;
            current.next = null;
            this.size--;
            return object;
        }
        return this.popNode(current.next);
    }

    getSize() {
        return this.size;
    }

    isEmpty() {
        return this.size === 0;
    }

    toString() {
        if (this.empty) return '[]';
        let result = '';
        let current = this.node;
        let separator = '';
        do {
            result += separator + current.object;
            current = current.next;
            separator = ', ';
        } while (current != null);
        return '[' + result + ']';
    }

}

class StackNode {

    /** @type any */ object;
    /** @type StackNode */ next;

    constructor(object, next) {
        this.object = object;
        this.next = next;
    }

}
class Node {
    constructor(type, value = null, left = null, right = null) {
      this.type = type;   // "operator" for AND/OR or "operand" for conditions
      this.value = value; // Optional value for operand nodes
      this.left = left;   // Left child node
      this.right = right; // Right child node
    }
  
    print() {
      if (this.type === 'operator') {
        process.stdout.write('(');
        if (this.left) this.left.print();
        process.stdout.write(` ${this.value} `);
        if (this.right) this.right.print();
        process.stdout.write(')');
      } else {
        process.stdout.write(this.value);
      }
    }
  }
  
  module.exports = Node;
  
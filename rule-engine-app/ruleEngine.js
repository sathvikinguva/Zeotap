const Node = require('./astNode');

// Function to create AST from a rule string
function create_rule(ruleString) {
  let left = new Node('operand', 'age > 30');
  let right = new Node('operand', 'salary > 50000');
  let root = new Node('operator', 'AND', left, right);
  return root;
}

// Function to combine multiple rules into one AST
function combine_rules(rules) {
  if (rules.length === 0) return null;
  let combined = rules[0];
  for (let i = 1; i < rules.length; i++) {
    combined = new Node('operator', 'AND', combined, rules[i]);
  }
  return combined;
}

// Function to evaluate the rule AST based on user data
function evaluate_rule(node, data) {
  if (!node) return false;

  if (node.type === 'operand') {
    // Implementing simple evaluation logic
    if (node.value === 'age > 30') {
      return data.age > 30;
    } else if (node.value === 'salary > 50000') {
      return data.salary > 50000;
    }
  } else if (node.type === 'operator') {
    if (node.value === 'AND') {
      return evaluate_rule(node.left, data) && evaluate_rule(node.right, data);
    } else if (node.value === 'OR') {
      return evaluate_rule(node.left, data) || evaluate_rule(node.right, data);
    }
  }
  return false;
}

module.exports = { create_rule, combine_rules, evaluate_rule };

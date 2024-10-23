const { create_rule, combine_rules, evaluate_rule } = require('./ruleEngine');

// Create individual rules
let rule1 = create_rule('age > 30 AND salary > 50000');
let rule2 = create_rule('experience > 5 AND department = "Sales"');

// Combine the rules
let combinedRule = combine_rules([rule1, rule2]);

// Print the AST structure of combined rule
combinedRule.print();
console.log('\n');

// Evaluate the combined rule with sample user data
let userData1 = { age: 35, salary: 60000, experience: 3, department: 'Sales' };
let result1 = evaluate_rule(combinedRule, userData1);
console.log('Evaluation Result for User 1:', result1); // Expected true

let userData2 = { age: 25, salary: 30000, experience: 6, department: 'Sales' };
let result2 = evaluate_rule(combinedRule, userData2);
console.log('Evaluation Result for User 2:', result2); // Expected false

const expressionInput = document.getElementById('expression-input');
const evaluateBtn = document.getElementById('evaluate-btn');
const clearBtn = document.getElementById('clear-btn');
const exampleBtn = document.getElementById('example-btn');
const copyResultsBtn = document.getElementById('copy-results-btn');
const downloadResultsBtn = document.getElementById('download-results-btn');
const errorBox = document.getElementById('error-box');
const resultsSection = document.getElementById('results');

const detectedVariablesEl = document.getElementById('detected-variables');
const normalizedExpressionEl = document.getElementById('normalized-expression');
const minimalSopEl = document.getElementById('minimal-sop');
const minimalPosEl = document.getElementById('minimal-pos');
const canonicalDnfEl = document.getElementById('canonical-dnf');
const canonicalCnfEl = document.getElementById('canonical-cnf');
const simplificationStepsEl = document.getElementById('simplification-steps');
const truthTableEl = document.getElementById('truth-table');
const kmapContainer = document.getElementById('kmap-container');
const circuitDiagramEl = document.getElementById('circuit-diagram');

const KEYWORDS = {
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  XOR: 'XOR',
  NAND: 'NAND',
  NOR: 'NOR'
};

const SYMBOL_ALIASES = {
  '+': 'OR',
  '|': 'OR',
  '∨': 'OR',
  '⊕': 'XOR',
  '^': 'XOR',
  '⊻': 'XOR',
  '*': 'AND',
  '·': 'AND',
  '&': 'AND',
  '∧': 'AND',
  '×': 'AND',
  '!': 'NOT',
  '~': 'NOT',
  '¬': 'NOT'
};

function tokenize(input) {
  const tokens = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (ch === '(' || ch === ')') {
      tokens.push({ type: ch === '(' ? 'LPAREN' : 'RPAREN', lexeme: ch });
      i += 1;
      continue;
    }

    if (ch === "'") {
      tokens.push({ type: 'NOT_POSTFIX', lexeme: "'" });
      i += 1;
      continue;
    }

    if (/[01]/.test(ch)) {
      tokens.push({ type: 'CONST', value: ch === '1', lexeme: ch });
      i += 1;
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      let start = i;
      while (
        i < input.length &&
        /[A-Za-z0-9_]/.test(input[i])
      ) {
        i += 1;
      }
      const word = input.slice(start, i);
      const keyword = KEYWORDS[word.toUpperCase()];
      if (keyword) {
        tokens.push({ type: 'OP', value: keyword, lexeme: word });
      } else {
        tokens.push({ type: 'VAR', value: word, lexeme: word });
      }
      continue;
    }

    const twoChars = input.slice(i, i + 2);
    if (twoChars === '&&') {
      tokens.push({ type: 'OP', value: 'AND', lexeme: twoChars });
      i += 2;
      continue;
    }
    if (twoChars === '||') {
      tokens.push({ type: 'OP', value: 'OR', lexeme: twoChars });
      i += 2;
      continue;
    }

    const alias = SYMBOL_ALIASES[ch];
    if (alias) {
      tokens.push({ type: 'OP', value: alias, lexeme: ch });
      i += 1;
      continue;
    }

    throw new Error(`Unrecognized symbol "${ch}"`);
  }

  return tokens;
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  parse() {
    const expr = this.parseExpression();
    if (!this.isAtEnd()) {
      const next = this.peek();
      throw new Error(`Unexpected token "${next.lexeme ?? next.value}"`);
    }
    return expr;
  }

  parseExpression() {
    return this.parseOr();
  }

  parseOr() {
    let node = this.parseXor();
    while (this.matchOp('OR') || this.matchOp('NOR')) {
      const operator = this.previous();
      const right = this.parseXor();
      node = {
        type: operator.value,
        left: node,
        right
      };
    }
    return node;
  }

  parseXor() {
    let node = this.parseAnd();
    while (this.matchOp('XOR')) {
      const operator = this.previous();
      const right = this.parseAnd();
      node = {
        type: operator.value,
        left: node,
        right
      };
    }
    return node;
  }

  parseAnd() {
    let node = this.parseUnary();
    // Support chained AND/NAND and implicit multiplication
    for (;;) {
      if (this.matchOp('AND') || this.matchOp('NAND')) {
        const operator = this.previous();
        const right = this.parseUnary();
        node = {
          type: operator.value,
          left: node,
          right
        };
        continue;
      }
      if (this.isImplicitAnd()) {
        const right = this.parseUnary();
        node = {
          type: 'AND',
          left: node,
          right
        };
        continue;
      }
      break;
    }
    return node;
  }

  parseUnary() {
    if (this.matchOp('NOT')) {
      return {
        type: 'NOT',
        operand: this.parseUnary()
      };
    }

    let node = this.parsePrimary();
    while (this.matchType('NOT_POSTFIX')) {
      node = {
        type: 'NOT',
        operand: node
      };
    }
    return node;
  }

  parsePrimary() {
    if (this.matchType('LPAREN')) {
      const expr = this.parseExpression();
      this.consume('RPAREN', 'Expected closing parenthesis ")"');
      let node = expr;
      while (this.matchType('NOT_POSTFIX')) {
        node = { type: 'NOT', operand: node };
      }
      return node;
    }

    if (this.matchType('CONST')) {
      return {
        type: 'CONST',
        value: this.previous().value
      };
    }

    if (this.matchType('VAR')) {
      return {
        type: 'VAR',
        name: this.previous().value
      };
    }

    if (this.matchOp('NAND') || this.matchOp('NOR') || this.matchOp('AND') || this.matchOp('OR')) {
      throw new Error('Binary operator missing left operand');
    }

    throw new Error('Expected variable, constant, or parenthesized expression');
  }

  isImplicitAnd() {
    if (this.isAtEnd()) return false;
    const next = this.peek();
    if (next.type === 'VAR' || next.type === 'CONST' || next.type === 'LPAREN') {
      return true;
    }
    if (next.type === 'OP' && next.value === 'NOT') {
      return true;
    }
    return false;
  }

  matchOp(value) {
    if (this.checkOp(value)) {
      this.advance();
      return true;
    }
    return false;
  }

  checkOp(value) {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    return token.type === 'OP' && token.value === value;
  }

  matchType(type) {
    if (this.checkType(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  checkType(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  consume(type, message) {
    if (this.checkType(type)) {
      return this.advance();
    }
    throw new Error(message);
  }

  advance() {
    if (!this.isAtEnd()) this.current += 1;
    return this.previous();
  }

  isAtEnd() {
    return this.current >= this.tokens.length;
  }

  peek() {
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }
}

function parseExpressionInput(raw) {
  const tokens = tokenize(raw);
  if (!tokens.length) {
    throw new Error('Expression is empty');
  }
  const parser = new Parser(tokens);
  const ast = parser.parse();
  return ast;
}

function collectVariables(ast, set = new Set()) {
  if (!ast) return set;
  switch (ast.type) {
    case 'VAR':
      set.add(ast.name);
      break;
    case 'NOT':
      collectVariables(ast.operand, set);
      break;
    case 'CONST':
      break;
    default:
      collectVariables(ast.left, set);
      collectVariables(ast.right, set);
  }
  return set;
}

function evaluateAst(ast, assignment) {
  switch (ast.type) {
    case 'CONST':
      return ast.value;
    case 'VAR':
      return assignment[ast.name] ?? false;
    case 'NOT':
      return !evaluateAst(ast.operand, assignment);
    case 'AND':
      return evaluateAst(ast.left, assignment) && evaluateAst(ast.right, assignment);
    case 'NAND':
      return !(evaluateAst(ast.left, assignment) && evaluateAst(ast.right, assignment));
    case 'OR':
      return evaluateAst(ast.left, assignment) || evaluateAst(ast.right, assignment);
    case 'NOR':
      return !(evaluateAst(ast.left, assignment) || evaluateAst(ast.right, assignment));
    case 'XOR': {
      const a = evaluateAst(ast.left, assignment);
      const b = evaluateAst(ast.right, assignment);
      return Boolean(a) !== Boolean(b);
    }
    default:
      throw new Error(`Unsupported AST node type: ${ast.type}`);
  }
}

function astToInfix(ast) {
  switch (ast.type) {
    case 'CONST':
      return ast.value ? '1' : '0';
    case 'VAR':
      return ast.name;
    case 'NOT': {
      const operand = astToInfix(ast.operand);
      if (ast.operand.type === 'VAR' || ast.operand.type === 'CONST') {
        return `¬${operand}`;
      }
      return `¬(${operand})`;
    }
    case 'AND':
      return `${wrap(ast.left, ['OR', 'NOR', 'XOR'])} · ${wrap(ast.right, ['OR', 'NOR', 'XOR'])}`;
    case 'NAND':
      return `${wrap(ast.left, [])} ⊼ ${wrap(ast.right, [])}`;
    case 'OR':
      return `${wrap(ast.left, ['OR', 'NOR'])} + ${wrap(ast.right, ['OR', 'NOR'])}`;
    case 'NOR':
      return `${wrap(ast.left, [])} ⊽ ${wrap(ast.right, [])}`;
    case 'XOR':
      return `${wrap(ast.left, ['OR', 'NOR'])} ⊕ ${wrap(ast.right, ['OR', 'NOR'])}`;
    default:
      return '?';
  }
}

function wrap(node, lowerPrecedenceTypes) {
  if (!lowerPrecedenceTypes.includes(node.type)) {
    return astToInfix(node);
  }
  return `(${astToInfix(node)})`;
}

function buildTruthTable(ast, variables) {
  const rows = [];
  const count = 1 << variables.length;
  for (let i = 0; i < count; i += 1) {
    const assignment = {};
    for (let bit = 0; bit < variables.length; bit += 1) {
      assignment[variables[bit]] = Boolean((i >> (variables.length - bit - 1)) & 1);
    }
    const output = evaluateAst(ast, assignment);
    rows.push({ assignment, output });
  }
  return rows;
}

function assignmentToKey(assignment, variables) {
  return variables
    .map((variable) => (assignment[variable] ? '1' : '0'))
    .join('');
}

function formatProductTerm(bits, variables) {
  const literals = [];
  for (let i = 0; i < bits.length; i += 1) {
    if (bits[i] === '-') continue;
    literals.push(bits[i] === '1' ? variables[i] : `¬${variables[i]}`);
  }
  if (!literals.length) {
    return '1';
  }
  return literals.join(' · ');
}

function formatSumTerm(bits, variables) {
  const literals = [];
  for (let i = 0; i < bits.length; i += 1) {
    if (bits[i] === '-') continue;
    literals.push(bits[i] === '0' ? variables[i] : `¬${variables[i]}`);
  }
  if (!literals.length) {
    return '0';
  }
  return literals.join(' + ');
}

function bitsToAssignment(bits, variables) {
  const terms = [];
  for (let i = 0; i < bits.length; i += 1) {
    terms.push(bits[i] === '1' ? variables[i] : `¬${variables[i]}`);
  }
  return terms.join(' · ');
}

function canonicalDNF(minterms, variables) {
  if (!minterms.length) return '0';
  return minterms.map((bits) => bitsToAssignment(bits, variables)).join(' + ');
}

function canonicalCNF(maxterms, variables) {
  if (!maxterms.length) return '1';
  return maxterms
    .map((bits) => {
      const literals = [];
      for (let i = 0; i < bits.length; i += 1) {
        literals.push(bits[i] === '1' ? `¬${variables[i]}` : variables[i]);
      }
      return `(${literals.join(' + ')})`;
    })
    .join(' · ');
}

function quineMcCluskey(mintermIndices, dontCareIndices, variables) {
  const steps = [];
  if (mintermIndices.length === 0) {
    return {
      expression: '0',
      implicants: [],
      steps,
      chart: []
    };
  }
  if (mintermIndices.length === 1 && dontCareIndices.length === 0) {
    const bits = decimalToBits(mintermIndices[0], variables.length);
    const term = bitsToAssignment(bits, variables);
    steps.push(`Single minterm ${mintermIndices[0]} results in term ${term}.`);
    return {
      expression: term,
      implicants: [
        {
          bits,
          minterms: new Set([mintermIndices[0]])
        }
      ],
      steps,
      chart: []
    };
  }

  const terms = mintermIndices
    .concat(dontCareIndices)
    .map((index) => ({
      bits: decimalToBits(index, variables.length),
      minterms: new Set([index])
    }));

  let groups = groupByOnes(terms);
  steps.push(`Grouped terms by number of ones: ${describeGroups(groups)}.`);
  const primeCandidates = [];
  let iteration = 1;
  while (true) {
    const {
      nextGroups,
      newPrimeCandidates,
      merged
    } = combineGroups(groups, variables.length, steps, iteration);
    primeCandidates.push(...newPrimeCandidates);
    if (!merged) break;
    groups = nextGroups;
    iteration += 1;
  }

  const primes = primeCandidates.filter((candidate) => !candidate.used);
  const primeImplicants = primes.filter((pi) => {
    return [...pi.minterms].some((m) => mintermIndices.includes(m));
  });

  const { selectionSteps, selected } = selectPrimeImplicants(
    primeImplicants,
    mintermIndices,
    variables
  );
  steps.push(...selectionSteps);

  const expression = selected
    .map((implicant) => formatProductTerm(implicant.bits, variables))
    .join(' + ');

  return {
    expression: expression || '0',
    implicants: selected,
    steps,
    chart: buildPrimeChart(primeImplicants, mintermIndices, variables)
  };
}

function decimalToBits(decimal, width) {
  return decimal
    .toString(2)
    .padStart(width, '0')
    .split('');
}

function countOnes(bits) {
  return bits.reduce((acc, bit) => (bit === '1' ? acc + 1 : acc), 0);
}

function groupByOnes(terms) {
  const groups = new Map();
  for (const term of terms) {
    const ones = countOnes(term.bits);
    if (!groups.has(ones)) groups.set(ones, []);
    groups.get(ones).push({ ...term, used: false });
  }
  return groups;
}

function describeGroups(groups) {
  const parts = [];
  const sortedKeys = [...groups.keys()].sort((a, b) => a - b);
  for (const key of sortedKeys) {
    const group = groups.get(key);
    const desc = group
      .map((term) => `${bitsToString(term.bits)} [${[...term.minterms].join(', ')}]`)
      .join('; ');
    parts.push(`${key}: ${desc}`);
  }
  return parts.join(' | ');
}

function bitsToString(bits) {
  return bits.join('');
}

function combineGroups(groups, bitWidth, steps, iteration) {
  const nextGroups = new Map();
  const usedPairs = new Set();
  let merged = false;
  const newPrimeCandidates = [];
  const groupKeys = [...groups.keys()].sort((a, b) => a - b);

  for (let i = 0; i < groupKeys.length - 1; i += 1) {
    const key = groupKeys[i];
    const nextKey = groupKeys[i + 1];
    const group = groups.get(key);
    const nextGroup = groups.get(nextKey);
    for (const term of group) {
      for (const term2 of nextGroup) {
        const diff = differencePosition(term.bits, term2.bits);
        if (diff === -1) continue;
        merged = true;
        term.used = true;
        term2.used = true;
        const combinedBits = [...term.bits];
        combinedBits[diff] = '-';
        const minterms = new Set([...term.minterms, ...term2.minterms]);
        const combinedKey = combinedBits.join('');
        const targetGroupKey = countOnes(combinedBits.filter((b) => b !== '-'));
        if (!nextGroups.has(targetGroupKey)) nextGroups.set(targetGroupKey, []);
        if (!usedPairs.has(combinedKey)) {
          nextGroups.get(targetGroupKey).push({
            bits: combinedBits,
            minterms,
            used: false
          });
          usedPairs.add(combinedKey);
        } else {
          const existing = nextGroups
            .get(targetGroupKey)
            .find((candidate) => candidate.bits.join('') === combinedKey);
          if (existing) {
            minterms.forEach((m) => existing.minterms.add(m));
          }
        }
        steps.push(
          `Iteration ${iteration}: Combined ${bitsToString(term.bits)} and ${bitsToString(
            term2.bits
          )} → ${combinedKey} (Adjacency Law).`
        );
      }
    }
  }

  for (const group of groups.values()) {
    for (const term of group) {
      if (!term.used) {
        newPrimeCandidates.push(term);
      }
    }
  }

  return { nextGroups, newPrimeCandidates, merged };
}

function differencePosition(bits1, bits2) {
  let diffIndex = -1;
  for (let i = 0; i < bits1.length; i += 1) {
    const b1 = bits1[i];
    const b2 = bits2[i];
    if (b1 === b2) continue;
    if (b1 === '-' || b2 === '-') return -1;
    if (diffIndex !== -1) return -1;
    diffIndex = i;
  }
  return diffIndex;
}

function selectPrimeImplicants(implicants, minterms, variables) {
  const steps = [];
  const chart = new Map();
  for (const implicant of implicants) {
    for (const minterm of implicant.minterms) {
      if (!minterms.includes(minterm)) continue;
      if (!chart.has(minterm)) chart.set(minterm, []);
      chart.get(minterm).push(implicant);
    }
  }

  const selected = new Set();
  const covered = new Set();

  for (const [minterm, covering] of chart.entries()) {
    if (covering.length === 1) {
      const implicant = covering[0];
      if (!selected.has(implicant)) {
        selected.add(implicant);
        steps.push(
          `Essential prime implicant ${formatProductTerm(implicant.bits, variables)} covers minterm ${minterm}.`
        );
      }
      covering[0].minterms.forEach((m) => covered.add(m));
    }
  }

  const remainingMinterms = minterms.filter((m) => !covered.has(m));
  if (remainingMinterms.length === 0) {
    return { selectionSteps: steps, selected: [...selected] };
  }

  const sums = remainingMinterms.map((m) => chart.get(m) || []);
  const combinations = petricksMethod(sums);
  if (!combinations.length) {
    steps.push('No additional implicants required.');
    return { selectionSteps: steps, selected: [...selected] };
  }

  const bestCombo = combinations[0];
  for (const implicant of bestCombo) {
    if (!selected.has(implicant)) {
      selected.add(implicant);
    }
  }

  steps.push(
    `Selected additional implicants via Petrick’s method: ${bestCombo
      .map((imp) => formatProductTerm(imp.bits, variables))
      .join(', ')}.`
  );

  return { selectionSteps: steps, selected: [...selected] };
}

function petricksMethod(sums) {
  if (sums.some((options) => options.length === 0)) {
    return [];
  }
  let products = [[]];
  for (const sum of sums) {
    const newProducts = [];
    for (const product of products) {
      for (const implicant of sum) {
        const newProduct = [...product];
        if (!newProduct.includes(implicant)) {
          newProduct.push(implicant);
        }
        newProducts.push(newProduct);
      }
    }
    products = newProducts;
  }

  const unique = [];
  for (const product of products) {
    const sorted = [...product].sort((a, b) => (a.bits > b.bits ? 1 : -1));
    if (!unique.some((existing) => arraysEqual(existing, sorted))) {
      unique.push(sorted);
    }
  }

  unique.sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    const costA = a.reduce((acc, imp) => acc + literalCount(imp.bits), 0);
    const costB = b.reduce((acc, imp) => acc + literalCount(imp.bits), 0);
    return costA - costB;
  });

  return unique;
}

function literalCount(bits) {
  return bits.filter((bit) => bit !== '-').length;
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function buildPrimeChart(implicants, minterms, variables) {
  return implicants.map((implicant) => ({
    implicant: formatProductTerm(implicant.bits, variables),
    minterms: [...implicant.minterms].filter((m) => minterms.includes(m))
  }));
}

function computeSimplifications(truthTable, variables) {
  const minterms = [];
  const maxterms = [];
  const mintermBits = [];
  const maxtermBits = [];

  truthTable.forEach((row, index) => {
    const keyBits = assignmentToKey(row.assignment, variables);
    if (row.output) {
      minterms.push(index);
      mintermBits.push(keyBits);
    } else {
      maxterms.push(index);
      maxtermBits.push(keyBits);
    }
  });

  const qmResult = quineMcCluskey(minterms, [], variables);
  const minimalSOP = qmResult.expression || '0';

  const posResult = quineMcCluskey(maxterms, [], variables);
  const minimalPOS = maxterms.length
    ? convertComplementProductToSum(posResult.implicants, variables)
    : '1';

  const steps = qmResult.steps.slice();
  if (posResult.steps.length) {
    steps.push('---');
    steps.push(...posResult.steps.map((step) => `[POS] ${step}`));
  }

  const canonicalDnf = canonicalDNF(mintermBits, variables);
  const canonicalCnf = canonicalCNF(maxtermBits, variables);

  return {
    minimalSOP,
    minimalPOS,
    canonicalDNF,
    canonicalCNF,
    steps
  };
}

function convertComplementProductToSum(implicants, variables) {
  if (!implicants.length) return '1';
  let hasContradiction = false;
  const clauses = implicants.map((implicant) => {
    const literals = [];
    for (let i = 0; i < implicant.bits.length; i += 1) {
      const bit = implicant.bits[i];
      if (bit === '-') continue;
      literals.push(bit === '1' ? `¬${variables[i]}` : variables[i]);
    }
    if (!literals.length) {
      hasContradiction = true;
      return '(0)';
    }
    return `(${literals.join(' + ')})`;
  });
  if (hasContradiction) return '0';
  return clauses.join(' · ');
}

function renderTruthTable(table, variables) {
  const headers = [...variables, 'F'];
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach((header) => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  table.forEach((row) => {
    const tr = document.createElement('tr');
    variables.forEach((variable) => {
      const td = document.createElement('td');
      td.textContent = row.assignment[variable] ? '1' : '0';
      tr.appendChild(td);
    });
    const outputTd = document.createElement('td');
    outputTd.textContent = row.output ? '1' : '0';
    tr.appendChild(outputTd);
    tbody.appendChild(tr);
  });

  truthTableEl.innerHTML = '';
  truthTableEl.appendChild(thead);
  truthTableEl.appendChild(tbody);
}

function grayCode(n) {
  if (n === 0) return [''];
  const prev = grayCode(n - 1);
  const result = [];
  for (const code of prev) {
    result.push('0' + code);
  }
  for (let i = prev.length - 1; i >= 0; i -= 1) {
    result.push('1' + prev[i]);
  }
  return result;
}

function renderKMap(container, truthTable, variables) {
  container.innerHTML = '';
  const varCount = variables.length;
  if (varCount === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'K-map not available for constant expressions.';
    container.appendChild(msg);
    return;
  }

  const truthMap = new Map();
  truthTable.forEach((row) => {
    const key = assignmentToKey(row.assignment, variables);
    truthMap.set(key, row.output ? 1 : 0);
  });

  if (varCount === 1) {
    const grid = createKMapTable(
      variables,
      ['0', '1'],
      [''],
      truthMap,
      { rows: [variables[0]], cols: [] }
    );
    container.appendChild(grid);
    return;
  }

  if (varCount === 2) {
    const cols = grayCode(1);
    const rows = grayCode(1);
    const grid = createKMapTable(variables, cols, rows, truthMap, {
      rows: [variables[0]],
      cols: [variables[1]]
    });
    container.appendChild(grid);
    return;
  }

  if (varCount === 3) {
    const cols = grayCode(2);
    const rows = grayCode(1);
    const grid = createKMapTable(variables, cols, rows, truthMap, {
      rows: [variables[0]],
      cols: [variables[1], variables[2]]
    });
    container.appendChild(grid);
    return;
  }

  if (varCount === 4) {
    const cols = grayCode(2);
    const rows = grayCode(2);
    const grid = createKMapTable(variables, cols, rows, truthMap, {
      rows: [variables[0], variables[1]],
      cols: [variables[2], variables[3]]
    });
    container.appendChild(grid);
    return;
  }

  // varCount === 5
  const cols = grayCode(2);
  const rows = grayCode(2);
  const extraVar = variables[0];
  const remainingVars = variables.slice(1);
  ['0', '1'].forEach((extraValue) => {
    const filteredTruthMap = new Map();
    truthTable.forEach((row) => {
      if ((row.assignment[extraVar] ? '1' : '0') === extraValue) {
        const key = remainingVars
          .map((variable) => (row.assignment[variable] ? '1' : '0'))
          .join('');
        filteredTruthMap.set(key, row.output ? 1 : 0);
      }
    });
    const grid = createKMapTable(remainingVars, cols, rows, filteredTruthMap, {
      rows: [remainingVars[0], remainingVars[1]],
      cols: [remainingVars[2], remainingVars[3]],
      caption: `${extraVar} = ${extraValue}`
    });
    container.appendChild(grid);
  });
}

function createKMapTable(variables, cols, rows, truthMap, meta) {
  const table = document.createElement('table');
  table.classList.add('kmap-grid');

  if (meta.caption) {
    const caption = document.createElement('caption');
    caption.textContent = meta.caption;
    table.appendChild(caption);
  }

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const corner = document.createElement('th');
  if (meta.rows?.length && meta.cols?.length) {
    corner.textContent = `${meta.rows.join('')} | ${meta.cols.join('')}`;
  } else if (meta.rows?.length) {
    corner.textContent = meta.rows.join('');
  } else if (meta.cols?.length) {
    corner.textContent = meta.cols.join('');
  } else {
    corner.textContent = '';
  }
  headerRow.appendChild(corner);
  cols.forEach((code) => {
    const th = document.createElement('th');
    th.textContent = code;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  rows.forEach((rowCode) => {
    const tr = document.createElement('tr');
    const rowHeader = document.createElement('th');
    rowHeader.textContent = rowCode;
    tr.appendChild(rowHeader);
    cols.forEach((colCode) => {
      const td = document.createElement('td');
      const mapKey = meta.cols.length + (meta.rows?.length ?? 0) === variables.length
        ? rowCode + colCode
        : padKey(rowCode, colCode, variables.length);
      const value = truthMap.get(mapKey) ?? 0;
      td.textContent = value;
      td.className = value ? 'kmap-cell-on' : 'kmap-cell-off';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  return table;
}

function padKey(rowCode, colCode, totalLength) {
  const combined = rowCode + colCode;
  if (combined.length === totalLength) return combined;
  return combined.padEnd(totalLength, '0');
}

function renderSimplificationSteps(steps) {
  simplificationStepsEl.innerHTML = '';
  if (!steps.length) {
    const li = document.createElement('li');
    li.textContent = 'Expression is already in simplest form (constant).';
    simplificationStepsEl.appendChild(li);
    return;
  }
  steps.forEach((step) => {
    const li = document.createElement('li');
    li.textContent = step === '---' ? '— Minimal POS derivation —' : step;
    simplificationStepsEl.appendChild(li);
  });
}

async function renderCircuitDiagram(ast) {
  circuitDiagramEl.innerHTML = '';
  if (!ast) {
    const placeholder = document.createElement('p');
    placeholder.className = 'circuit-placeholder';
    placeholder.textContent = 'No circuit diagram available.';
    circuitDiagramEl.appendChild(placeholder);
    return;
  }

  const mermaidDefinition = generateMermaid(ast);
  try {
    const renderId = `circuitDiagram_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const { svg } = await mermaid.render(renderId, mermaidDefinition);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = svg;
    circuitDiagramEl.appendChild(wrapper);
  } catch (error) {
    const placeholder = document.createElement('p');
    placeholder.className = 'circuit-placeholder';
    placeholder.textContent = 'Unable to render circuit diagram.';
    circuitDiagramEl.appendChild(placeholder);
    console.error(error);
  }
}

function generateMermaid(ast) {
  const lines = ['graph TD'];
  const definitions = new Set();
  const edges = [];
  let counter = 0;

  function traverse(node) {
    if (!node) return null;
    if (node.type === 'CONST') {
      const id = `c${counter++}`;
      definitions.add(`${id}[${node.value ? '1' : '0'}]`);
      return { id };
    }
    if (node.type === 'VAR') {
      const id = `v${sanitizeId(node.name)}${counter++}`;
      definitions.add(`${id}[${node.name}]`);
      return { id };
    }
    if (node.type === 'NOT') {
      const child = traverse(node.operand);
      const id = `n${counter++}`;
      definitions.add(`${id}((NOT))`);
      edges.push(`${child.id} --> ${id}`);
      return { id };
    }
    const left = traverse(node.left);
    const right = traverse(node.right);
    const nodeId = `g${counter++}`;
    const label = gateLabel(node.type);
    definitions.add(`${nodeId}((${label}))`);
    edges.push(`${left.id} --> ${nodeId}`);
    edges.push(`${right.id} --> ${nodeId}`);
    return { id: nodeId };
  }

  const root = traverse(ast);
  definitions.forEach((line) => lines.push(line));
  edges.forEach((edge) => lines.push(edge));
  lines.push(`${root.id} --> o0[Output]`);
  return lines.join('\n');
}

function gateLabel(type) {
  switch (type) {
    case 'AND':
      return 'AND';
    case 'OR':
      return 'OR';
    case 'XOR':
      return 'XOR';
    case 'NAND':
      return 'NAND';
    case 'NOR':
      return 'NOR';
    default:
      return type;
  }
}

function sanitizeId(text) {
  return text.replace(/[^a-zA-Z0-9]/g, '');
}

function resetOutputs() {
  resultsSection.hidden = true;
  errorBox.hidden = true;
  errorBox.textContent = '';
  truthTableEl.innerHTML = '';
  kmapContainer.innerHTML = '';
  simplificationStepsEl.innerHTML = '';
  circuitDiagramEl.innerHTML = '';
  minimalSopEl.textContent = '';
  minimalPosEl.textContent = '';
  canonicalDnfEl.textContent = '';
  canonicalCnfEl.textContent = '';
  detectedVariablesEl.textContent = '';
  normalizedExpressionEl.textContent = '';
}

function showError(message) {
  errorBox.hidden = false;
  errorBox.textContent = message;
  resultsSection.hidden = true;
}

evaluateBtn.addEventListener('click', () => {
  const raw = expressionInput.value.trim();
  resetOutputs();
  if (!raw) {
    showError('Please enter a Boolean expression.');
    return;
  }

  let ast;
  try {
    ast = parseExpressionInput(raw);
  } catch (error) {
    showError(error.message);
    return;
  }

  const variables = [...collectVariables(ast)].sort((a, b) => a.localeCompare(b));
  if (variables.length > 5) {
    showError('Expressions with more than 5 variables are not supported.');
    return;
  }

  const truthTable = buildTruthTable(ast, variables);
  const { minimalSOP, minimalPOS, canonicalDNF, canonicalCNF, steps } =
    computeSimplifications(truthTable, variables);

  detectedVariablesEl.textContent = variables.length
    ? variables.join(', ')
    : '(none – constant output)';
  normalizedExpressionEl.textContent = astToInfix(ast);
  minimalSopEl.textContent = minimalSOP;
  minimalPosEl.textContent = minimalPOS;
  canonicalDnfEl.textContent = canonicalDNF;
  canonicalCnfEl.textContent = canonicalCNF;

  renderSimplificationSteps(steps);
  renderTruthTable(truthTable, variables);
  renderKMap(kmapContainer, truthTable, variables);
  renderCircuitDiagram(ast);

  // Store results for export
  const truthTableRows = truthTable.map(row => {
    const vals = variables.map(v => row.assignment[v] ? '1' : '0');
    return `${vals.join(' | ')} | ${row.output ? '1' : '0'}`;
  });

  lastResults = {
    originalExpression: raw,
    normalizedExpression: astToInfix(ast),
    variables: variables.length ? variables.join(', ') : '(none)',
    minimalSOP,
    minimalPOS,
    canonicalDNF,
    canonicalCNF,
    steps,
    truthTable: {
      variables,
      rows: truthTableRows
    }
  };

  resultsSection.hidden = false;
});

clearBtn.addEventListener('click', () => {
  expressionInput.value = '';
  resetOutputs();
});

// Example expressions for demonstration
const exampleExpressions = [
  "(A AND B) OR (C AND D)",
  "A' + B · C",
  "(A XOR B) AND (C OR D')",
  "A NAND B",
  "(A + B) · (C + D)",
  "A · B' + C",
  "NOT(A OR B) AND C"
];

let currentExampleIndex = 0;

exampleBtn.addEventListener('click', () => {
  expressionInput.value = exampleExpressions[currentExampleIndex];
  currentExampleIndex = (currentExampleIndex + 1) % exampleExpressions.length;
  resetOutputs();
});

// Export functionality
let lastResults = null;

copyResultsBtn.addEventListener('click', async () => {
  if (!lastResults) return;
  
  const text = formatResultsAsText(lastResults);
  
  try {
    await navigator.clipboard.writeText(text);
    copyResultsBtn.textContent = '✅ Copied!';
    setTimeout(() => {
      copyResultsBtn.textContent = '📋 Copy All Results';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    copyResultsBtn.textContent = '❌ Copy Failed';
    setTimeout(() => {
      copyResultsBtn.textContent = '📋 Copy All Results';
    }, 2000);
  }
});

downloadResultsBtn.addEventListener('click', () => {
  if (!lastResults) return;
  
  const text = formatResultsAsText(lastResults);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `boolean-calculator-results-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

function formatResultsAsText(results) {
  const lines = [];
  lines.push('═══════════════════════════════════════════════');
  lines.push('   BOOLEAN ALGEBRA CALCULATOR - RESULTS');
  lines.push('═══════════════════════════════════════════════');
  lines.push('');
  lines.push(`Expression: ${results.originalExpression}`);
  lines.push(`Normalized: ${results.normalizedExpression}`);
  lines.push(`Variables: ${results.variables}`);
  lines.push('');
  lines.push('───────────────────────────────────────────────');
  lines.push('SIMPLIFIED FORMS');
  lines.push('───────────────────────────────────────────────');
  lines.push(`Minimal SOP: ${results.minimalSOP}`);
  lines.push(`Minimal POS: ${results.minimalPOS}`);
  lines.push(`Canonical DNF: ${results.canonicalDNF}`);
  lines.push(`Canonical CNF: ${results.canonicalCNF}`);
  lines.push('');
  lines.push('───────────────────────────────────────────────');
  lines.push('SIMPLIFICATION STEPS');
  lines.push('───────────────────────────────────────────────');
  results.steps.forEach((step, idx) => {
    lines.push(`${idx + 1}. ${step}`);
  });
  lines.push('');
  lines.push('───────────────────────────────────────────────');
  lines.push('TRUTH TABLE');
  lines.push('───────────────────────────────────────────────');
  
  // Header
  const headerVars = results.truthTable.variables.join(' | ');
  lines.push(`${headerVars} | F`);
  lines.push('─'.repeat(headerVars.length + 6));
  
  // Rows
  results.truthTable.rows.forEach(row => {
    lines.push(row);
  });
  
  lines.push('');
  lines.push('═══════════════════════════════════════════════');
  lines.push(`Generated on: ${new Date().toLocaleString()}`);
  lines.push('═══════════════════════════════════════════════');
  
  return lines.join('\n');
}

// Initialize
resetOutputs();

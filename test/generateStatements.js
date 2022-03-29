const { faker } = require("@faker-js/faker");

const dataTypes = ["INTEGER", "REAL", "TEXT", "BLOB"];
const statementTypes = ["INSERT", "UPDATE", "DELETE", "CREATE"];

const toSnakeCase = (str) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join("_");

/**
 * Example new FakeDatabase().generateOrderedStatements(10);
 * This will return 10 statements.
 * These statements are ordered so they could actually
 * be used and create a real (if useless database)
 */

module.exports = class FakeDatabase {
  tables = [];

  constructor(seed = 5) {
    faker.seed(seed);
  }

  generateDatabase(numberOfTables) {
    for (let i = numberOfTables; i > 0; i--) {
      this.tables.push(this.generateTable());
    }
  }

  grabRandomTable() {
    const table = this.tables[faker.datatype.number(this.tables.length - 1)];
    return table;
  }

  generateRow() {
    const type = dataTypes[faker.datatype.number(3)];
    const name = toSnakeCase(faker.company.bsNoun());
    const value = faker.lorem.words(faker.datatype.number({ min: 1, max: 9 }));
    return { type, name, value };
  }

  addTable() {
    const table = this.generateTable();
    this.tables.push(table);
    return table;
  }

  generateTable() {
    const table = `${toSnakeCase(faker.hacker.noun())}_${faker.datatype.number(
      10000
    )}`;
    let i = faker.datatype.number({ min: 1, max: 9 });
    const columns = [];
    let rowsStatement = "";
    const rows = [];
    while (i > 0) {
      let row;
      do {
        row = this.generateRow();
      } while (columns.find((column) => column === row.name) + 1);
      columns.push(row.name);
      rowsStatement += `, ${row.name} ${row.type}`;
      rows.push({ name: row.name, type: row.type });
      i--;
    }

    return {
      statement: `CREATE TABLE ${table} (id INTEGER PRIMARY KEY ${rowsStatement} );`,
      name: table,
      columns: rows,
    };
  }

  generateInsertStatement(table) {
    if (!table) {
      table = this.grabRandomTable();
    }

    let columns = table.columns.map((row) => {
      return row.name;
    });

    columns = columns.join(", ");

    let values = table.columns.map((row) => {
      switch (row.type) {
        case "INTEGER":
          return faker.datatype.number(10000);
        case "REAL":
          return faker.datatype.float({ max: 100000 });
        default:
          return `'${faker.lorem.words(
            faker.datatype.number({ min: 1, max: 9 })
          )}'`;
      }
    });

    values = values.join(", ");

    return `INSERT INTO ${table.name} (${columns}) VALUES (${values});`;
  }

  generateCondition() {
    return `id=${faker.datatype.number(10000)}`;
  }

  generateDeleteStatement() {
    const condition = this.generateCondition();

    return `DELETE FROM ${this.grabRandomTable().name} WHERE ${condition};`;
  }

  generateUpdateStatement(table) {
    return `UPDATE ${this.grabRandomTable().name} 
        SET id=5
        WHERE ${this.generateCondition()};`;
  }

  generateRandomStatement() {
    const numero = faker.datatype.number(
      Math.floor(Math.log(this.tables.length + 5) * 5) + 1
    );
    let type;
    if (numero === 1) {
      type = "CREATE";
    } else {
      type = statementTypes[faker.datatype.number(2)];
    }

    switch (type) {
      case "CREATE":
        return this.addTable().statement;

      case "DELETE":
        return this.generateDeleteStatement();

      case "INSERT":
        return this.generateInsertStatement();

      case "UPDATE":
        return this.generateUpdateStatement();
    }
  }

  generateOrderedStatements(numberOfStatements) {
    const statements = [];
    if (this.tables.length === 0) {
      statements.push(this.addTable().statement);
    }

    while (statements.length < numberOfStatements) {
      statements.push(this.generateRandomStatement());
    }

    return statements;
  }
}

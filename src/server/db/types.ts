export type Sql = string;

export type Db = {
  query<T = Record<string, unknown>>(text: Sql, params?: unknown[]): Promise<T[]>;
  exec(script: Sql): Promise<void>;
};

export function serializeDb(db: Db): Db {
  let chain = Promise.resolve();
  const enqueue = <T,>(work: () => Promise<T>): Promise<T> => {
    const run = chain.then(work, work);
    chain = run.then(() => undefined, () => undefined);
    return run;
  };
  return {
    query: (text, params) => enqueue(() => db.query(text, params)),
    exec: (script) => enqueue(() => db.exec(script)),
  };
}

export function sqlStatements(script: string): string[] {
  return script
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

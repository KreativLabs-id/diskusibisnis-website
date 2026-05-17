import pool from '../config/database';

const columnExistsCache = new Map<string, Promise<boolean>>();

export const hasTableColumn = async (
  tableSchema: string,
  tableName: string,
  columnName: string
): Promise<boolean> => {
  const cacheKey = `${tableSchema}.${tableName}.${columnName}`;

  if (!columnExistsCache.has(cacheKey)) {
    const lookup = pool.query(
      `SELECT EXISTS (
         SELECT 1
         FROM information_schema.columns
         WHERE table_schema = $1
           AND table_name = $2
           AND column_name = $3
       ) AS exists`,
      [tableSchema, tableName, columnName]
    )
      .then(result => Boolean(result.rows[0]?.exists))
      .catch((error) => {
        columnExistsCache.delete(cacheKey);
        throw error;
      });

    columnExistsCache.set(cacheKey, lookup);
  }

  return columnExistsCache.get(cacheKey)!;
};

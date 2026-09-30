const DEFAULT_PAGE_SIZE = 1000;

export async function fetchAllRows(createQuery, pageSize = DEFAULT_PAGE_SIZE) {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError("pageSize must be a positive integer");
  }

  const rows = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await createQuery().range(offset, offset + pageSize - 1);
    if (error) return { data: null, error };

    const page = data ?? [];
    rows.push(...page);

    if (page.length < pageSize) {
      return { data: rows, error: null };
    }
  }
}

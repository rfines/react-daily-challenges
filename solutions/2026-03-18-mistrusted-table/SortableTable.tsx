import { useState, useMemo, useCallback, memo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface SortableTableProps {
  data: Record<string, unknown>[];
  columns: Column[];
  searchable?: boolean;
}

interface SortState {
  key: string | null;
  direction: SortDirection;
}

// Memoized row to prevent unnecessary re-renders when sort/filter state changes
// but the row's own data hasn't changed.
const DataRow = memo(function DataRow({
  row,
  columns,
}: {
  row: Record<string, unknown>;
  columns: Column[];
}) {
  return (
    <tr>
      {columns.map((col) => (
        <td key={col.key}>{String(row[col.key] ?? '')}</td>
      ))}
    </tr>
  );
});

export default function SortableTable({
  data,
  columns,
  searchable = false,
}: SortableTableProps) {
  const [sort, setSort] = useState<SortState>({ key: null, direction: null });
  const [query, setQuery] = useState('');

  // Stable reference — no deps means this never re-creates. Safe because setSort
  // uses the functional updater form and reads no outer state.
  const handleSort = useCallback((key: string) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: null }; // third click clears sort
    });
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  // All filtering and sorting happens here, memoized so DataRow siblings don't
  // re-render on unrelated state changes.
  const processedData = useMemo(() => {
    let result = data;

    if (query.trim()) {
      const lower = query.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) =>
          String(row[col.key] ?? '').toLowerCase().includes(lower)
        )
      );
    }

    if (sort.key && sort.direction) {
      const { key, direction } = sort;
      result = [...result].sort((a, b) => {
        const aVal = String(a[key] ?? '');
        const bVal = String(b[key] ?? '');
        const cmp = aVal.localeCompare(bVal);
        return direction === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, query, sort, columns]);

  return (
    <div>
      {searchable && (
        <input
          type="text"
          placeholder="Search…"
          value={query}
          onChange={handleSearch}
          aria-label="Search"
        />
      )}
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                aria-sort={
                  sort.key === col.key && sort.direction
                    ? sort.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
                style={{ cursor: col.sortable ? 'pointer' : 'default' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {processedData.map((row, i) => (
            <DataRow key={i} row={row} columns={columns} />
          ))}
        </tbody>
      </table>
      <p aria-live="polite">
        {processedData.length} result{processedData.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

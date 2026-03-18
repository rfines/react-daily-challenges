/**
 * The Mistrusted Table — fix-tests challenge
 *
 * The component (SortableTable.tsx) is correct and fully working.
 * This test file contains exactly 4 bugs. Find them and fix them so all tests pass.
 *
 * Hints are in the README.
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SortableTable from './SortableTable';
import type { Column } from './SortableTable';

const columns: Column[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'age',  label: 'Age',  sortable: true },
  { key: 'city', label: 'City', sortable: false },
];

const data: Record<string, unknown>[] = [
  { name: 'Charlie', age: 30, city: 'Chicago' },
  { name: 'Alice',   age: 25, city: 'Austin'  },
  { name: 'Bob',     age: 35, city: 'Boston'  },
];

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('SortableTable — rendering', () => {
  it('renders a row for each data item plus one header row', () => {
    render(<SortableTable data={data} columns={columns} />);

    // BUG 1: getAllByRole('row') returns every <tr> in the table, including the
    // header row. How many total rows should there be?
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });

  it('renders all column headers', () => {
    render(<SortableTable data={data} columns={columns} />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();
    // BUG 2: Check the columns array above — what is the third column actually labeled?
    expect(screen.getByRole('columnheader', { name: 'City' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

describe('SortableTable — sorting', () => {
  it('sorts rows ascending on the first click', async () => {
    const user = userEvent.setup();
    render(<SortableTable data={data} columns={columns} />);

    await user.click(screen.getByRole('columnheader', { name: 'Name' }));

    const dataRows = screen.getAllByRole('row').slice(1); // skip header
    const names = dataRows.map(
      (row) => within(row).getAllByRole('cell')[0].textContent
    );

    // BUG 3: What is the correct alphabetical ascending order for
    // ['Charlie', 'Alice', 'Bob']?
    expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('applies descending sort on the second click', async () => {
    const user = userEvent.setup();
    render(<SortableTable data={data} columns={columns} />);

    const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
    await user.click(nameHeader); // first click  → asc
    await user.click(nameHeader); // second click → desc

    // BUG 4: After the second click the column is sorted descending.
    // What aria-sort value does the spec require for a descending column?
    expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
  });

  it('clears sort on the third click', async () => {
    const user = userEvent.setup();
    render(<SortableTable data={data} columns={columns} />);

    const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
    await user.click(nameHeader); // asc
    await user.click(nameHeader); // desc
    await user.click(nameHeader); // clear

    expect(nameHeader).not.toHaveAttribute('aria-sort');
  });

  it('does not sort on a non-sortable column click', async () => {
    const user = userEvent.setup();
    render(<SortableTable data={data} columns={columns} />);

    await user.click(screen.getByRole('columnheader', { name: 'City' }));

    expect(
      screen.getByRole('columnheader', { name: 'City' })
    ).not.toHaveAttribute('aria-sort');
  });
});

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

describe('SortableTable — search', () => {
  it('filters rows by search query', async () => {
    const user = userEvent.setup();
    render(<SortableTable data={data} columns={columns} searchable />);

    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'ali');

    expect(screen.getByText('1 result')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(2); // header + 1 match
  });

  it('shows plural result count when multiple rows match', async () => {
    const user = userEvent.setup();
    render(<SortableTable data={data} columns={columns} searchable />);

    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'o'); // Bob, Charlie

    expect(screen.getByText('2 results')).toBeInTheDocument();
  });

  it('shows zero results for a non-matching query', async () => {
    const user = userEvent.setup();
    render(<SortableTable data={data} columns={columns} searchable />);

    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'zzz');

    expect(screen.getByText('0 results')).toBeInTheDocument();
  });
});

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const columns = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Name' },
];

const rows = [
    { id: 3, name: 'Item 3' },
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
];

export default function MyTable() {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id}>{column.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

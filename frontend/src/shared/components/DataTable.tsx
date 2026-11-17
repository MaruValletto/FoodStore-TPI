import { useState } from 'react';
import type { ReactNode } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Button } from '../ui/Button';

interface Props<T> {
  data: T[];
  columns: ColumnDef<T>[];
  label: string;
  serverPagination?: boolean;
  renderMobile?: (item: T) => ReactNode;
}

export function DataTable<T>({data, columns, label, serverPagination=false, renderMobile}: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({data, columns, state: {sorting}, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(), manualPagination: serverPagination,
    initialState: {pagination: {pageSize: 8}},
  });
  const rows = table.getRowModel().rows;
  const sortable = table.getAllLeafColumns().filter(column => column.getCanSort());
  return <>
    {sortable.length > 0 && <label className="mb-4 block text-sm font-medium lg:hidden">
      Ordenar {label.toLowerCase()}
      <select className="field mt-2" value={sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : ''}
        onChange={event => {const [id, direction] = event.target.value.split(':'); setSorting(id ? [{id, desc: direction === 'desc'}] : []);}}>
        <option value="">Orden original</option>
        {sortable.flatMap(column => (['asc','desc'] as const).map(direction => <option key={column.id+direction} value={`${column.id}:${direction}`}>
          {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id} · {direction === 'asc' ? 'ascendente' : 'descendente'}
        </option>))}
      </select>
    </label>}
    <div className={renderMobile ? "grid items-start gap-4 sm:grid-cols-2 md:grid-cols-3 lg:hidden" : "space-y-4 lg:hidden"} aria-label={`${label}, vista de tarjetas`}>
      {rows.map(row => <article key={row.id} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {renderMobile ? renderMobile(row.original) : <dl className="divide-y divide-slate-100 px-5">
          {row.getVisibleCells().map(cell => <div key={cell.id} className="flex flex-wrap items-start justify-between gap-x-5 gap-y-2 py-4">
            <dt className="text-xs font-semibold text-slate-500">{typeof cell.column.columnDef.header === 'string' ? cell.column.columnDef.header : cell.column.id}</dt>
            <dd className="min-w-0 max-w-full break-words text-sm [overflow-wrap:anywhere]">{flexRender(cell.column.columnDef.cell, cell.getContext())}</dd>
          </div>)}
        </dl>}
      </article>)}
    </div>
    <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white lg:block">
      <table className="w-full min-w-[780px] text-left text-sm" aria-label={label}>
        <thead className="bg-slate-100">{table.getHeaderGroups().map(group => <tr key={group.id}>
          {group.headers.map(header => <th key={header.id} className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600" scope="col"
            aria-sort={header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : 'none'}>
            {header.column.getCanSort() ? <button className="inline-flex items-center gap-2 whitespace-nowrap" onClick={header.column.getToggleSortingHandler()}>
              {flexRender(header.column.columnDef.header, header.getContext())}
              <span aria-hidden="true" className="text-sm text-slate-400">{header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : '↕'}</span>
            </button> : flexRender(header.column.columnDef.header, header.getContext())}
          </th>)}
        </tr>)}</thead>
        <tbody>{rows.map(row => <tr key={row.id} className="border-t border-slate-100 align-middle hover:bg-slate-50/70">
          {row.getVisibleCells().map(cell => <td key={cell.id} className="px-4 py-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
    {!data.length && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">No hay registros.</p>}
    {!serverPagination && <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
      <span className="text-xs text-slate-500">Página {table.getState().pagination.pageIndex+1} de {Math.max(1,table.getPageCount())}</span>
      <Button secondary disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Anterior</Button>
      <Button secondary disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Siguiente</Button>
    </div>}
  </>;
}

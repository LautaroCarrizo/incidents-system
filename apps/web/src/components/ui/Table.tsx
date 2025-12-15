import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeadProps {
  children: ReactNode;
}

interface TableBodyProps {
  children: ReactNode;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export const Table = ({ children, className = '' }: TableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
};

Table.Head = ({ children }: TableHeadProps) => {
  return <thead className="bg-gray-50">{children}</thead>;
};

Table.Body = ({ children }: TableBodyProps) => {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
};

Table.Row = ({ children, className = '' }: TableRowProps) => {
  return <tr className={className}>{children}</tr>;
};

Table.Header = ({ children, className = '' }: TableHeaderProps) => {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
};

Table.Cell = ({ children, className = '' }: TableCellProps) => {
  return <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>{children}</td>;
};


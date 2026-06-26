// Table primitives per tables.md — card-wrapped wrapper, header band, row hover.
export const TableWrap = ({ children, className = '' }) => (
  <div
    className={`overflow-x-auto rounded-card border border-border-default bg-neutral-primary-soft shadow-xs ${className}`}
  >
    <table className="w-full text-sm text-body">{children}</table>
  </div>
);

export const Thead = ({ children }) => (
  <thead className="border-b border-border-default bg-neutral-secondary-soft text-body">{children}</thead>
);

export const Tbody = ({ children }) => <tbody>{children}</tbody>;

export const Tr = ({ children, className = '', ...props }) => (
  <tr
    className={`border-b border-border-default transition-colors last:border-0 hover:bg-neutral-secondary-soft ${
      props.onClick ? 'cursor-pointer' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const Th = ({ children, className = '' }) => (
  <th className={`whitespace-nowrap px-6 py-3 text-start font-medium ${className}`}>{children}</th>
);

export const Td = ({ children, className = '' }) => (
  <td className={`px-6 py-4 align-middle ${className}`}>{children}</td>
);

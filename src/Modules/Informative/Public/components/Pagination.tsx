import React from 'react';

export function getPaginationRange(
  current: number,
  total: number,
  maxVisible = 5,
): (number | 'dots')[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  let end = start + maxVisible - 1;
  if (end > total) {
    end = total;
    start = end - maxVisible + 1;
  }

  const range: (number | 'dots')[] = [];
  for (let p = start; p <= end; p++) range.push(p);
  if (start > 1) range.unshift('dots');
  if (end < total) range.push('dots');
  return range;
}


type PaginationClasses = Record<string, string>;

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  classes: PaginationClasses;
  maxVisible?: number;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  classes,
  maxVisible = 5,
}) => {
  if (totalPages <= 1) return null;

  const items = getPaginationRange(currentPage, totalPages, maxVisible);

  return (
    <div className={classes.pagination}>
      <button
        className={classes.pageBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >←</button>

      {items.map((item, i) =>
        item === 'dots' ? (
          <span
            key={`dots-${i}`}
            aria-hidden="true"
            style={{
              minWidth: 24,
              height: 36,
              display: 'inline-flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              color: 'var(--mid)',
              userSelect: 'none',
            }}
          >…</span>
        ) : (
          <button
            key={item}
            className={`${classes.pageBtn} ${item === currentPage ? classes.pageBtnActive : ''}`}
            onClick={() => onPageChange(item)}
            aria-label={`Ir a página ${item}`}
            aria-current={item === currentPage ? 'page' : undefined}
          >{item}</button>
        ),
      )}

      <button
        className={classes.pageBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
      >→</button>
    </div>
  );
};

export default Pagination;

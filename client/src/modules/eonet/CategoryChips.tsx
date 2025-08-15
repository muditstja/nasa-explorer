import React from 'react';
import { DEFAULT_CATEGORY_FILTERS, colorForCategory } from '../../helpers/eonet';

type Props = {
  selected: string[];
  onToggle: (title: string) => void;
};

/** Category filter chips. Controlled by parent via selected/onToggle. */
export default function CategoryChips({ selected, onToggle }: Props) {
  return (
    <div className="chips margin-btm-12">
      {DEFAULT_CATEGORY_FILTERS.map((title: any) => {
        const active = selected.includes(title);
        return (
          <label
            key={title}
            className="chip sub"
            style={{ borderColor: active ? 'var(--accent, #8bd3ff)' : undefined }}
          >
            <input
              type="checkbox"
              checked={active}
              onChange={() => onToggle(title)}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                display: 'inline-block',
                background: colorForCategory(title),
                marginRight: 6,
              }}
            />
            {title}
          </label>
        );
      })}
    </div>
  );
}

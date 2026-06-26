# Border Radius

| Token | Value | Default usage |
|---|---|---|
| base | 9999px | Buttons, inputs, modals, sections, badges, tooltips, dropdown items, small controls — all pill-shaped |
| default | 9999px | Same as base; used interchangeably for any non-card element |
| sm | 4px | Checkboxes, tiny elements |
| full | 9999px | Avatars, toggles, dot indicators |
| card | 24px | Cards, card-like containers, table wrappers |

## Rules

- 9999px (pill) is the default radius across the product for all elements except cards
- Cards and card-like containers use 24px radius
- Never use arbitrary radius values outside this scale
- Radius must be consistent within each component family

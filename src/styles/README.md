# Styling Guidelines

This project uses a component-based CSS approach with CSS Modules for better maintainability and style isolation.

## Structure

```
src/
├── styles/
│   ├── shared.module.css     # Shared/common styles
│   └── README.md            # This file
├── components/
│   ├── JokeCard/
│   │   ├── JokeCard.tsx
│   │   ├── JokeCard.module.css
│   │   └── index.ts
│   ├── JokeForm/
│   │   ├── JokeForm.tsx
│   │   ├── JokeForm.module.css
│   │   └── index.ts
│   └── ...
└── App.css                  # Global styles only
```

## Guidelines

### 1. Component-Specific Styles
- Each component should have its own CSS module file
- File naming: `ComponentName.module.css`
- Import styles as: `import styles from './ComponentName.module.css'`
- Use camelCase for class names in CSS modules

### 2. Shared Styles
- Common styles (buttons, inputs, containers) go in `shared.module.css`
- Import shared styles where needed: `import shared from '../../styles/shared.module.css'`
- Combine classes: `className={`${styles.card} ${shared.container}`}`

### 3. Global Styles
- Only truly global styles should remain in `App.css`
- Examples: body, html, font-family, CSS custom properties
- Avoid component-specific styles in global CSS

### 4. CSS Module Benefits
- **Scoped styles**: No style conflicts between components
- **Better organization**: Styles are co-located with components
- **Type safety**: TypeScript can check class name usage
- **Tree shaking**: Unused styles can be removed during build

### 5. Migration Strategy
1. Create component-specific CSS module files
2. Move relevant styles from `App.css` to component modules
3. Update component imports to use CSS modules
4. Remove migrated styles from `App.css`
5. Keep only truly global styles in `App.css`

## Example Usage

```tsx
import React from 'react';
import styles from './MyComponent.module.css';
import shared from '../../styles/shared.module.css';

export const MyComponent: React.FC = () => {
  return (
    <div className={`${styles.container} ${shared.container}`}>
      <button className={shared.btnPrimary}>
        Click me
      </button>
    </div>
  );
};
```

## Alternative Approaches

If you prefer different styling solutions, consider:

1. **Styled Components**: CSS-in-JS with dynamic styling
2. **Emotion**: Similar to styled-components but more performant
3. **Tailwind CSS**: Utility-first CSS framework
4. **Sass/SCSS**: Preprocessor with better CSS organization

The current CSS Modules approach provides a good balance of simplicity, performance, and maintainability. 
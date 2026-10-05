# example-shared

Private helper package used by the web examples (never published): renderer boot (`bootRenderer`, `?webgl` switch, resize),
asset loading (`loadTexture`, `registerInterFonts`) and procedural Canvas2D art (gem atlas, walk cycle, nine-patch, avatars).
Examples may use DOM APIs; the libraries never do. Exports TypeScript source directly (consumed by Vite).

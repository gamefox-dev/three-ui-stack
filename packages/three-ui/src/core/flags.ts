/** Per-node invalidation flags (spec §10.5). */
export const STYLE_DIRTY = 1
export const LAYOUT_DIRTY = 2
export const PAINT_DIRTY = 4
export const TEXT_DIRTY = 8
export const CHILD_ORDER_DIRTY = 16
/** Internal: some descendant has STYLE_DIRTY (lets style resolution skip clean subtrees). */
export const SUBTREE_STYLE_DIRTY = 32

/** Class-resolution dependency bits reported by a `ClassNameResolver`. */
export const DEP_HOVER = 1
export const DEP_ACTIVE = 2
export const DEP_FOCUS = 4
export const DEP_DISABLED = 8
export const DEP_COLOR_SCHEME = 16
export const DEP_VIEWPORT = 32
export const DEP_THEME = 64
export const DEP_MOTION = 128

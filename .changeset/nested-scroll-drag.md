---
"@implicit-invocation/three-ui": patch
---

ScrollView: nested scrollers no longer fight for pointer capture. The innermost scroller owns a drag and hands the gesture to an outer scroller only when it cannot scroll in that direction (fixes drag being nearly impossible in a ScrollView inside another ScrollView).

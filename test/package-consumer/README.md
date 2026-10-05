# package-consumer

Template for the clean-room consumer used by `bun run pack:smoke`.
`scripts/pack-smoke-test.ts` packs every public package with `bun pm pack`, validates the tarball manifests
(no `workspace:`/`catalog:`, only intended files, no absolute paths in source maps), installs the tarballs into a
fresh temp project and runs `smoke.mjs` there under both Bun and Node.

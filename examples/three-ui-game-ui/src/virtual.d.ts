declare module 'virtual:three-ui-tailwind' {
  import type { TailwindRegistry } from '@implicit-invocation/three-ui-tailwind'
  const registry: TailwindRegistry
  export default registry
}
declare module 'virtual:three-ui-tailwind/register' {
  import type { TailwindResolver } from '@implicit-invocation/three-ui-tailwind'
  export const resolver: TailwindResolver
  export default resolver
}

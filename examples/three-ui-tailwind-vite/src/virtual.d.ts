declare module 'virtual:three-ui-tailwind' {
  import type { TailwindRegistry } from 'three-ui-tailwind'
  const registry: TailwindRegistry
  export default registry
}
declare module 'virtual:three-ui-tailwind/register' {
  import type { TailwindResolver } from 'three-ui-tailwind'
  export const resolver: TailwindResolver
  export default resolver
}

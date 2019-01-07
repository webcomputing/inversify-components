/**
 * Returns injection name of the meta information (including configuration) of a given component. Currently resolves to `meta:component//${componentName}`.
 * @param {string} componentName component to resolve meta information for
 * @return {string} injection string, ready to use in `@inject()`
 */
export function getMetaInjectionName(componentName: string) {
  return `meta:component//${componentName}`;
}

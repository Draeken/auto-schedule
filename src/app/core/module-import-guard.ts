export function throwIfAlreadyLoaded(parentModule: any, moduleName: string) {
  if (parentModule) {
    console.error('error');
    throw new Error(`${moduleName} has already been loaded. Import Core modules in the AppModule only.`);
  }
}

import { resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

const srcRoot = resolvePath(import.meta.dirname, "../src");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = pathToFileURL(resolvePath(srcRoot, `${specifier.slice(2)}.ts`)).href;
    return nextResolve(target, context);
  }
  return nextResolve(specifier, context);
}

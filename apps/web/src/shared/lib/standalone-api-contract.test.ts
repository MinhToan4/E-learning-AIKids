import { readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../..',
)

function sourceFiles(root: string, predicate: (path: string) => boolean) {
  const files: string[] = []
  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name)
      if (entry.isDirectory()) visit(path)
      else if (predicate(path)) files.push(path)
    }
  }
  visit(root)
  return files
}

function routeMatches(clientPath: string, serverPath: string) {
  const client = clientPath.replace(/^\/|\/$/g, '').split('/')
  const server = serverPath.replace(/^\/|\/$/g, '').split('/')
  return (
    client.length === server.length &&
    client.every(
      (segment, index) =>
        server[index]?.startsWith(':') ||
        segment.includes('${') ||
        segment === server[index],
    )
  )
}

function expressionStrings(expression: ts.Expression): string[] {
  if (
    ts.isStringLiteral(expression) ||
    ts.isNoSubstitutionTemplateLiteral(expression)
  ) {
    return [expression.text]
  }
  if (ts.isTemplateExpression(expression)) {
    return [
      `${expression.head.text}${expression.templateSpans
        .map((span) => `\${value}${span.literal.text}`)
        .join('')}`,
    ]
  }
  if (ts.isConditionalExpression(expression)) {
    return [
      ...expressionStrings(expression.whenTrue),
      ...expressionStrings(expression.whenFalse),
    ]
  }
  return []
}

function apiCalls(path: string) {
  const source = readFileSync(path, 'utf8')
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const calls: Array<{ method: string; path: string }> = []
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'api' &&
      node.arguments[0]
    ) {
      const paths = expressionStrings(node.arguments[0]).map(
        (clientPath) => clientPath.split('?')[0],
      )
      let methods = ['GET']
      const options = node.arguments[1]
      if (options && ts.isObjectLiteralExpression(options)) {
        const methodProperty = options.properties.find(
          (property): property is ts.PropertyAssignment =>
            ts.isPropertyAssignment(property) &&
            ((ts.isIdentifier(property.name) &&
              property.name.text === 'method') ||
              (ts.isStringLiteral(property.name) &&
                property.name.text === 'method')),
        )
        if (methodProperty) {
          methods = expressionStrings(methodProperty.initializer).map(
            (method) => method.toUpperCase(),
          )
        }
      }
      const pairs =
        paths.length > 1 && paths.length === methods.length
          ? paths.map((clientPath, index) => ({
              method: methods[index] ?? 'GET',
              path: clientPath,
            }))
          : paths.flatMap((clientPath) =>
              methods.map((method) => ({ method, path: clientPath })),
            )
      for (const pair of pairs) {
        if (pair.path.startsWith('/api/')) {
          calls.push(pair)
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return calls
}

describe('standalone FE/API route contract', () => {
  it('does not call a Fastify endpoint that the standalone API does not expose', () => {
    const backendRoutes = sourceFiles(
      resolve(repositoryRoot, 'apps/api/src/modules'),
      (path) => path.endsWith('.routes.ts'),
    ).flatMap((path) => {
      const source = readFileSync(path, 'utf8')
      return [
        ...source.matchAll(
          /app\.(?:get|post|put|patch|delete)\s*\(\s*['"](?<path>\/api\/[^'"]+)/g,
        ),
      ].map((match) => match.groups?.path ?? '')
    })

    const frontendPaths = sourceFiles(
      resolve(repositoryRoot, 'apps/web/src'),
      (path) =>
        ['.ts', '.tsx'].includes(extname(path)) &&
        !path.endsWith('.test.ts') &&
        !path.endsWith('.test.tsx') &&
        path !==
          resolve(repositoryRoot, 'apps/web/src/shared/lib/api.ts'),
    ).flatMap((path) => {
      const source = readFileSync(path, 'utf8')
      return [
        ...source.matchAll(/['"`](?<path>\/api\/[^'"`\s]+)['"`]/g),
      ].map((match) => (match.groups?.path ?? '').split('?')[0])
    })

    const gatewayOnly = new Set([
      '/api/auth/login/child-profile',
      '/api/parent/family-login-code',
    ])
    const unmatched = [...new Set(frontendPaths)]
      .filter((path) => path !== '/api/...' && !path.startsWith('/api/v1/'))
      .filter((path) => !gatewayOnly.has(path))
      .filter(
        (clientPath) =>
          !backendRoutes.some((serverPath) =>
            routeMatches(clientPath, serverPath),
          ),
      )

    expect(unmatched).toEqual([])
  })

  it('uses an HTTP method exposed by the matching Fastify route', () => {
    const backendRoutes = sourceFiles(
      resolve(repositoryRoot, 'apps/api/src/modules'),
      (path) => path.endsWith('.routes.ts'),
    ).flatMap((path) => {
      const source = readFileSync(path, 'utf8')
      return [
        ...source.matchAll(
          /app\.(?<method>get|post|put|patch|delete)\s*\(\s*['"](?<path>\/api\/[^'"]+)/g,
        ),
      ].map((match) => ({
        method: (match.groups?.method ?? '').toUpperCase(),
        path: match.groups?.path ?? '',
      }))
    })
    const frontendCalls = sourceFiles(
      resolve(repositoryRoot, 'apps/web/src'),
      (path) =>
        ['.ts', '.tsx'].includes(extname(path)) &&
        !path.endsWith('.test.ts') &&
        !path.endsWith('.test.tsx') &&
        path !== resolve(repositoryRoot, 'apps/web/src/shared/lib/api.ts'),
    ).flatMap(apiCalls)
    const gatewayOnly = new Set([
      'POST /api/auth/login/child-profile',
      'GET /api/parent/family-login-code',
    ])
    const unmatched = frontendCalls
      .filter(({ path }) => !path.startsWith('/api/v1/'))
      .filter(({ method, path }) => !gatewayOnly.has(`${method} ${path}`))
      .filter(
        (call) =>
          !backendRoutes.some(
            (route) =>
              route.method === call.method &&
              routeMatches(call.path, route.path),
          ),
      )

    expect(unmatched).toEqual([])
  })
})

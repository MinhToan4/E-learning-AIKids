import { readdirSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const sourceRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../..',
)

function tsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return tsxFiles(path)
    return entry.name.endsWith('.tsx') && !entry.name.includes('.test.')
      ? [path]
      : []
  })
}

function attributeNames(node: ts.JsxOpeningLikeElement, source: ts.SourceFile) {
  return new Set(
    node.attributes.properties
      .filter(ts.isJsxAttribute)
      .map((attribute) => attribute.name.getText(source)),
  )
}

function hasNamedWrapper(
  ancestors: ts.Node[],
  source: ts.SourceFile,
) {
  return ancestors.some(
    (ancestor) =>
      ts.isJsxElement(ancestor) &&
      ['label', 'Field', 'FieldShell'].includes(
        ancestor.openingElement.tagName.getText(source),
      ),
  )
}

describe('accessible form controls', () => {
  it('gives every input, select and textarea a stable accessible name', () => {
    const findings: string[] = []

    for (const path of tsxFiles(sourceRoot)) {
      const source = ts.createSourceFile(
        path,
        readFileSync(path, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      )

      const visit = (node: ts.Node, ancestors: ts.Node[]) => {
        if (
          ts.isJsxOpeningElement(node) ||
          ts.isJsxSelfClosingElement(node)
        ) {
          const tag = node.tagName.getText(source)
          if (['input', 'select', 'textarea'].includes(tag)) {
            const names = attributeNames(node, source)
            const hasSpread = node.attributes.properties.some(
              ts.isJsxSpreadAttribute,
            )
            const named =
              hasNamedWrapper(ancestors, source) ||
              hasSpread ||
              names.has('id') ||
              names.has('aria-label') ||
              names.has('aria-labelledby')

            if (!named) {
              const position = source.getLineAndCharacterOfPosition(
                node.getStart(source),
              )
              findings.push(
                `${relative(sourceRoot, path)}:${position.line + 1} <${tag}>`,
              )
            }
          }
        }

        ts.forEachChild(node, (child) =>
          visit(child, [...ancestors, node]),
        )
      }

      visit(source, [])
    }

    expect(findings).toEqual([])
  })
})

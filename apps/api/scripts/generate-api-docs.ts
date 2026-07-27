import { Project, SyntaxKind, Type, ObjectLiteralExpression } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

function generateSampleFromType(type: Type, depth = 0): any {
  if (depth > 3) return {}; 
  if (type.isString()) return "string";
  if (type.isNumber()) return 0;
  if (type.isBoolean()) return true;
  if (type.isArray()) {
    const elementType = type.getArrayElementType();
    return elementType ? [generateSampleFromType(elementType, depth + 1)] : [];
  }
  if (type.isUnion()) {
    const nonNull = type.getUnionTypes().find(t => !t.isNull() && !t.isUndefined());
    return nonNull ? generateSampleFromType(nonNull, depth) : null;
  }
  
  if (type.isObject() || type.isIntersection()) {
    if (type.getSymbol()?.getName() === 'Date') return "2023-01-01T00:00:00Z";
    
    const sample: any = {};
    const props = type.getProperties();
    for (const prop of props) {
      try {
        const declarations = prop.getDeclarations();
        const propType = prop.getValueDeclaration()?.getType() || (declarations && declarations.length > 0 ? prop.getTypeAtLocation(declarations[0]) : null);
        if (propType) {
          sample[prop.getName()] = generateSampleFromType(propType, depth + 1);
        }
      } catch(e) {}
    }
    return sample;
  }
  return null;
}

interface ZodProp {
  name: string;
  type: string;
  required: boolean;
  desc: string;
}

function parseZodSchemaToProps(objectLiteral: ObjectLiteralExpression): ZodProp[] {
  const props: ZodProp[] = [];
  for (const prop of objectLiteral.getProperties()) {
    if (prop.getKind() === SyntaxKind.PropertyAssignment) {
      const assignment = prop.asKind(SyntaxKind.PropertyAssignment);
      const name = assignment.getName();
      const initializer = assignment.getInitializer();
      if (initializer) {
        const text = initializer.getText();
        const isOptional = text.includes('.optional()') || text.includes('.nullish()') || text.includes('.nullable()');
        
        let type = 'any';
        if (text.includes('z.string(')) type = 'string';
        else if (text.includes('z.number(')) type = 'number';
        else if (text.includes('z.boolean(')) type = 'boolean';
        else if (text.includes('z.array(')) type = 'array';
        else if (text.includes('z.object(')) type = 'object';
        else if (text.includes('z.enum(')) type = 'enum';
        
        let desc = '';
        const descMatch = text.match(/\.describe\(['"`](.*?)['"`]\)/);
        if (descMatch) desc = descMatch[1];
        
        props.push({ name, type, required: !isOptional, desc });
      }
    }
  }
  return props;
}

const project = new Project({
  tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
});
const typeChecker = project.getTypeChecker();
const sourceFiles = project.getSourceFiles('src/modules/**/*.ts');

let md = '# AIKids API Full Documentation\n\n';
md += '> Tài liệu API chi tiết với toàn bộ tham số đầu vào (Input Parameters) và kết quả trả về (Response Samples) được tổ chức logic, khoa học.\n\n';

// Group by modules
const modules = new Map<string, any[]>();

for (const sourceFile of sourceFiles) {
  const filePath = sourceFile.getFilePath();
  const match = filePath.match(/src[\\/]modules[\\/]([^\\/]+)[\\/]/);
  const moduleName = match ? match[1] : 'core';
  
  const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
  
  for (const callExpr of callExpressions) {
    const expr = callExpr.getExpression();
    if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
      const propAccess = expr.asKind(SyntaxKind.PropertyAccessExpression);
      const name = propAccess?.getName();
      if (name && ['get', 'post', 'put', 'patch', 'delete'].includes(name)) {
        const caller = propAccess?.getExpression().getText();
        if (caller === 'app' || caller === 'fastify') {
          const args = callExpr.getArguments();
          if (args.length > 0 && args[0].getKind() === SyntaxKind.StringLiteral) {
            const route = args[0].getText().replace(/['"]/g, '');
            const method = name.toUpperCase();
            
            let authorizations = 'None';
            let bodyProps: ZodProp[] = [];
            let queryProps: ZodProp[] = [];
            
            const block = callExpr.getFirstDescendantByKind(SyntaxKind.Block);
            if (block) {
              const text = block.getText();
              if (text.includes('requireUser')) authorizations = 'User Token (x-api-key / Bearer)';
              if (text.includes('requireRole')) {
                const roleMatch = text.match(/requireRole\([^,]+,\s*([^)]+)\)/);
                if (roleMatch) authorizations = `Role: ${roleMatch[1]}`;
                else authorizations = 'Role Required';
              }
              
              const parseCalls = block.getDescendantsOfKind(SyntaxKind.CallExpression)
                .filter(c => c.getExpression().getText().endsWith('.parse'));
                
              for (const parseCall of parseCalls) {
                const parseArg = parseCall.getArguments()[0]?.getText();
                if (parseArg && (parseArg.includes('request.body') || parseArg.includes('request.query'))) {
                  const propAccess2 = parseCall.getExpression().asKind(SyntaxKind.PropertyAccessExpression);
                  if (propAccess2) {
                    const schemaExpr = propAccess2.getExpression();
                    let objectLiteral: ObjectLiteralExpression | undefined;
                    
                    if (schemaExpr.getKind() === SyntaxKind.CallExpression && schemaExpr.getText().startsWith('z.object')) {
                       objectLiteral = (schemaExpr as any).getArguments()[0]?.asKind(SyntaxKind.ObjectLiteralExpression);
                    } else if (schemaExpr.getKind() === SyntaxKind.Identifier) {
                       const symbol = typeChecker.getSymbolAtLocation(schemaExpr);
                       if (symbol) {
                         const decl = symbol.getDeclarations()[0];
                         if (decl && decl.getKind() === SyntaxKind.VariableDeclaration) {
                           const init = (decl as any).getInitializer();
                           if (init && init.getKind() === SyntaxKind.CallExpression && init.getText().startsWith('z.object')) {
                              objectLiteral = init.getArguments()[0]?.asKind(SyntaxKind.ObjectLiteralExpression);
                           }
                         }
                       }
                    }
                    
                    if (objectLiteral) {
                      if (parseArg.includes('request.body')) bodyProps = parseZodSchemaToProps(objectLiteral);
                      else if (parseArg.includes('request.query')) queryProps = parseZodSchemaToProps(objectLiteral);
                    }
                  }
                }
              }
            }

            // Extract Response Sample
            let sampleJson = null;
            let statusCode = '200';
            
            const callback = args.find(a => a.getKind() === SyntaxKind.ArrowFunction || a.getKind() === SyntaxKind.FunctionExpression);
            if (callback) {
              const signature = typeChecker.getSignatureFromNode(callback);
              if (signature) {
                let returnType = signature.getReturnType();
                if (returnType.getTargetType()?.getSymbol()?.getName() === 'Promise') {
                  returnType = returnType.getTypeArguments()[0];
                }
                
                if (returnType.getSymbol()?.getName() === 'FastifyReply') {
                  const sendCalls = callback.getDescendantsOfKind(SyntaxKind.CallExpression)
                    .filter(c => c.getExpression().getText().endsWith('.send'));
                  
                  if (sendCalls.length > 0) {
                    const lastSend = sendCalls[sendCalls.length - 1];
                    const sendArgs = lastSend.getArguments();
                    if (sendArgs.length > 0) {
                      const sendArgType = typeChecker.getTypeAtLocation(sendArgs[0]);
                      sampleJson = generateSampleFromType(sendArgType);
                    }
                    const codeMatch = lastSend.getFullText().match(/\.code\((\d+)\)/);
                    if (codeMatch) statusCode = codeMatch[1];
                  }
                } else {
                  sampleJson = generateSampleFromType(returnType);
                  if (!sampleJson || Object.keys(sampleJson).length === 0) {
                     const sendCalls = callback.getDescendantsOfKind(SyntaxKind.CallExpression)
                      .filter(c => c.getExpression().getText().endsWith('.send'));
                     if (sendCalls.length > 0) {
                        const sendArgs = sendCalls[sendCalls.length - 1].getArguments();
                        if (sendArgs.length > 0) {
                          const sendArgType = typeChecker.getTypeAtLocation(sendArgs[0]);
                          sampleJson = generateSampleFromType(sendArgType);
                        }
                     }
                  }
                }
              }
            }
            
            const pathParams = [...route.matchAll(/:([a-zA-Z0-9_]+)/g)];
            const pathProps = pathParams.map(m => ({ name: m[1], type: 'string', required: true, desc: '' }));
            
            if (!modules.has(moduleName)) modules.set(moduleName, []);
            modules.get(moduleName)!.push({
              method,
              route,
              authorizations,
              pathProps,
              queryProps,
              bodyProps,
              statusCode,
              sampleJson
            });
          }
        }
      }
    }
  }
}

// Render Markdown
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

for (const [moduleName, endpoints] of Array.from(modules.entries()).sort()) {
  md += `## 📦 Module: ${capitalize(moduleName)}\n\n`;
  
  for (const ep of endpoints) {
    md += `### \`${ep.method}\` ${ep.route}\n\n`;
    md += `**Authorizations:** \`${ep.authorizations}\`\n\n`;
    
    // Header
    md += `#### Header Parameters\n`;
    md += `| Field | Required | Type | Description |\n`;
    md += `| --- | --- | --- | --- |\n`;
    md += `| \`x-api-key\` | Yes | \`string\` | API Key for merchant/user authentication |\n\n`;
    
    // Path & Query
    if (ep.pathProps.length > 0 || ep.queryProps.length > 0) {
      md += `#### URL Parameters (Path & Query)\n`;
      md += `| Field | In | Required | Type | Description |\n`;
      md += `| --- | --- | --- | --- | --- |\n`;
      for (const p of ep.pathProps) {
        md += `| \`${p.name}\` | Path | ${p.required ? 'Yes' : 'No'} | \`${p.type}\` | ${p.desc} |\n`;
      }
      for (const p of ep.queryProps) {
        md += `| \`${p.name}\` | Query | ${p.required ? 'Yes' : 'No'} | \`${p.type}\` | ${p.desc} |\n`;
      }
      md += `\n`;
    }
    
    // Body
    if (['POST', 'PUT', 'PATCH'].includes(ep.method)) {
      md += `#### Request Body \`(application/json)\`\n`;
      if (ep.bodyProps.length > 0) {
        md += `| Field | Required | Type | Description |\n`;
        md += `| --- | --- | --- | --- |\n`;
        for (const p of ep.bodyProps) {
          md += `| \`${p.name}\` | ${p.required ? 'Yes' : 'No'} | \`${p.type}\` | ${p.desc} |\n`;
        }
      } else {
        md += `_No body required or schema not specified._\n`;
      }
      md += `\n`;
    }
    
    // Response
    md += `#### Responses\n`;
    md += `**Status ${ep.statusCode}** - Successful response\n`;
    md += `\`\`\`json\n`;
    md += JSON.stringify(ep.sampleJson || {}, null, 2) + '\n';
    md += `\`\`\`\n\n`;
    
    md += `---\n\n`;
  }
}

const artifactsDir = 'C:/Users/Vidtory Dev/.gemini/antigravity-ide/brain/798c91a5-4ada-4a4c-ac46-c5faaec1d5b4';
const outputPath = path.join(artifactsDir, 'api_docs_final.md');
fs.writeFileSync(outputPath, md);
console.log(`Generated FINAL API documentation with ${modules.size} modules at ${outputPath}`);

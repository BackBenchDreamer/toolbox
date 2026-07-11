import type { ToolManifest, FieldDef } from '@toolbox/shared';
import { ALL_TOOLS } from '@toolbox/registry';

interface OpenApiSchema {
  type?: string;
  format?: string;
  description?: string;
  enum?: (string | number)[];
  items?: OpenApiSchema;
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  minimum?: number;
  maximum?: number;
  default?: unknown;
}

interface OpenApiSpec {
  openapi: string;
  info: object;
  servers: object[];
  security: object[];
  tags: object[];
  paths: Record<string, unknown>;
  components: { schemas: Record<string, unknown> };
}

/**
 * Generate an OpenAPI 3.1 spec from the tool registry.
 * Called once per server start — the registry is immutable at runtime.
 */
export function generateOpenApiSpec(baseUrl = 'http://127.0.0.1:3001'): OpenApiSpec {
  const publicTools = ALL_TOOLS.filter((t) => t.visibility !== 'hidden' && t.interfaces.api);

  const paths: Record<string, unknown> = {};
  const schemas: Record<string, unknown> = {};

  for (const tool of publicTools) {
    const inputSchema = buildObjectSchema(tool.inputs, tool);
    const outputSchema = buildObjectSchema(tool.outputs, tool);

    const inputRef = `${pascalCase(tool.id)}Input`;
    const outputRef = `${pascalCase(tool.id)}Output`;
    schemas[inputRef] = inputSchema;
    schemas[outputRef] = outputSchema;

    paths[tool.apiEndpoint] = {
      post: {
        operationId: tool.id,
        summary: tool.name,
        description: tool.longDescription ?? tool.description,
        tags: [tool.category],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${inputRef}` },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successful calculation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', enum: [true] },
                    data: { $ref: `#/components/schemas/${outputRef}` },
                  },
                  required: ['success', 'data'],
                },
              },
            },
          },
          '422': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    };
  }

  // Standard error schema
  schemas['ErrorResponse'] = {
    type: 'object',
    properties: {
      success: { type: 'boolean', enum: [false] },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          field: { type: 'string' },
        },
        required: ['code', 'message'],
      },
    },
    required: ['success', 'error'],
  };

  const tags = [...new Set(publicTools.map((t) => t.category))].map((cat) => ({
    name: cat,
    description: `${capitalize(cat)} tools`,
  }));

  return {
    openapi: '3.1.0',
    info: {
      title: 'Toolbox API',
      description: 'Computational core of the Toolbox platform. Reusable capabilities exposed as a REST API.',
      version: '1.0.0',
      contact: { url: 'https://github.com/BackBenchDreamer/toolbox' },
      license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
    },
    servers: [{ url: `${baseUrl}/api/v1`, description: 'Local development server' }],
    /** No authentication required — all endpoints are public. */
    security: [],
    tags,
    paths,
    components: { schemas },
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function buildObjectSchema(fields: FieldDef[], tool: ToolManifest): OpenApiSchema {
  const properties: Record<string, OpenApiSchema> = {};
  const required: string[] = [];

  for (const f of fields) {
    const schema = fieldToJsonSchema(f);
    if (f.description) schema.description = f.description;
    properties[f.name] = schema;
    if (!f.optional) required.push(f.name);
  }

  const schema: OpenApiSchema = {
    type: 'object',
    description: `${tool.name} ${fields === tool.inputs ? 'input' : 'output'}`,
    properties,
  };
  if (required.length) schema.required = required;
  return schema;
}

function fieldToJsonSchema(f: FieldDef): OpenApiSchema {
  switch (f.type) {
    case 'number':
      return {
        type: 'number',
        ...(f.min !== undefined ? { minimum: f.min } : {}),
        ...(f.max !== undefined ? { maximum: f.max } : {}),
        ...(f.defaultValue !== undefined ? { default: f.defaultValue } : {}),
      };
    case 'boolean':
      return { type: 'boolean', ...(f.defaultValue !== undefined ? { default: f.defaultValue } : {}) };
    case 'select':
    case 'enum': {
      const values = f.options?.map((o) => o.value) ?? [];
      // Detect the value type from the first option so the enum type matches.
      const enumType = values.length > 0 && typeof values[0] === 'number' ? 'number' : 'string';
      return {
        type: enumType,
        enum: values,
        ...(f.defaultValue !== undefined ? { default: f.defaultValue } : {}),
      };
    }
    case 'array':
      return { type: 'array', items: { type: 'object' } };
    case 'object':
      return { type: 'object' };
    default:
      return { type: 'string', ...(f.defaultValue !== undefined ? { default: f.defaultValue } : {}) };
  }
}

function pascalCase(id: string): string {
  return id.replace(/(^\w|-\w)/g, (m) => m.replace('-', '').toUpperCase());
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

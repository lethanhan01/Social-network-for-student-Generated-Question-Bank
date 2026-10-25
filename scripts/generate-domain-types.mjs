import fs from 'node:fs'
import path from 'node:path'

const SPEC_PATH = 'C:/Users/An/.gemini/antigravity-ide/brain/ccb08a9d-ea90-44db-8fcb-b067ba57979d/.system_generated/steps/38/content.md'
const content = fs.readFileSync(SPEC_PATH, 'utf8')
const spec = JSON.parse(content.slice(content.indexOf('{')))
const schemas = spec.components.schemas || {}

function cleanRef(ref) {
  let refName = ref.split('/').pop()
  if (refName.startsWith('GlobalResponse')) refName = refName.replace('GlobalResponse', '')
  return refName
}

function convertProperty(prop) {
  if (!prop) return 'unknown'
  if (prop.$ref) {
    return cleanRef(prop.$ref)
  }
  if (prop.enum) {
    return [...new Set(prop.enum)].map(e => JSON.stringify(e)).join(' | ')
  }
  if (prop.type === 'array') {
    return `${convertProperty(prop.items)}[]`
  }
  if (prop.type === 'integer' || prop.type === 'number') {
    return 'number'
  }
  if (prop.type === 'boolean') {
    return 'boolean'
  }
  if (prop.type === 'string') {
    return 'string'
  }
  if (prop.type === 'object') {
    if (prop.properties) {
      const inner = Object.entries(prop.properties).map(([k, v]) => {
        const isReq = prop.required && prop.required.includes(k)
        return `  ${k}${isReq ? '' : '?'}: ${convertProperty(v)}`
      }).join('\n')
      return `{\n${inner}\n}`
    }
    return 'Record<string, unknown>'
  }
  return 'unknown'
}

function generateType(name, schema) {
  if (name.startsWith('GlobalResponse')) return null
  if (schema.enum) {
    return `export type ${name} = ${[...new Set(schema.enum)].map(e => JSON.stringify(e)).join(' | ')};\n`
  }
  if (schema.type === 'object' || schema.properties) {
    const props = Object.entries(schema.properties || {}).map(([key, prop]) => {
      const isReq = schema.required && schema.required.includes(key)
      const desc = prop.description ? `  /** ${prop.description.replace(/\n/g, ' ')} */\n` : ''
      return `${desc}  ${key}${isReq ? '' : '?'}: ${convertProperty(prop)};`
    }).join('\n')
    const headerDesc = schema.description ? `/**\n * ${schema.description.replace(/\n/g, '\n * ')}\n */\n` : ''
    return `${headerDesc}export interface ${name} {\n${props}\n}\n`
  }
  return `export type ${name} = ${convertProperty(schema)};\n`
}

const outDir = 'src/types'
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

// 1. Generate full api.generated.ts
const allTypeDefs = []
for (const [name, schema] of Object.entries(schemas)) {
  const code = generateType(name, schema)
  if (code) allTypeDefs.push(code)
}

fs.writeFileSync(
  path.join(outDir, 'api.generated.ts'),
  `/**\n * Complete OpenAPI 3.1 Type Definitions for SQB HUST\n */\n\n${allTypeDefs.join('\n')}`,
  'utf8'
)
console.log(`Generated api.generated.ts with ${allTypeDefs.length} types.`)

// Domain mapping
function getDomain(name) {
  const n = name.toLowerCase()
  if (n.includes('login') || n.includes('auth') || n.includes('token') || n.includes('changepassword')) return 'auth'
  if (n.includes('device') || n.includes('fid')) return 'device'
  if (n.includes('profile') || n.includes('userprofile') || n.includes('usersummary')) return 'user'
  if (n.includes('friend') || n.includes('follow') || n.includes('block') || n.includes('relationship')) return 'relationship'
  if (n.includes('post') && !n.includes('game')) return 'post'
  if (n.includes('comment')) return 'comment'
  if (n.includes('react')) return 'reaction'
  if (n.includes('feed') || n.includes('activity')) return 'feed'
  if (n.includes('conversation') || n.includes('message') || n.includes('hiddenchat') || n.includes('group')) return 'chat'
  if (n.includes('ws') || n.includes('stomp')) return 'websocket'
  if (n.includes('subject') || n.includes('courseclass') || n.includes('classstudent') || n.includes('lecturer')) return 'course'
  if (n.includes('session') && (n.includes('propose') || n.includes('submission') || n.includes('enrolled'))) return 'session'
  if (n.includes('review') || n.includes('approve') || n.includes('reject') || n.includes('editquestion')) return 'review'
  if (n.includes('question') && (n.includes('answer') || n.includes('rate') || n.includes('statistic') || n.includes('rating'))) return 'practice'
  if (n.includes('exam')) return 'exam'
  if (n.includes('game') || n.includes('prediction') || n.includes('leaderboard') || n.includes('badge') || n.includes('checkin')) return 'gamification'
  if (n.includes('cosmetic')) return 'cosmetic'
  if (n.includes('search') || n.includes('report') || n.includes('media') || n.includes('presign') || n.includes('ai') || n.includes('verify')) return 'utility'
  if (n.includes('notification') || n.includes('pushsettings')) return 'notification'
  return 'common'
}

const domainExports = {}
for (const name of Object.keys(schemas)) {
  if (name.startsWith('GlobalResponse')) continue
  const d = getDomain(name)
  if (!domainExports[d]) domainExports[d] = []
  domainExports[d].push(name)
}

// 2. Generate domain type files re-exporting from api.generated
for (const [domain, names] of Object.entries(domainExports)) {
  const fileName = `${domain}.types.ts`
  const filePath = path.join(outDir, fileName)
  const content = `/**\n * Domain Types: ${domain}\n */\nexport type {\n  ${names.join(',\n  ')}\n} from './api.generated'\n`
  fs.writeFileSync(filePath, content, 'utf8')
}

// 3. Generate index.ts
fs.writeFileSync(
  path.join(outDir, 'index.ts'),
  `// Central export of all API and Domain types for SQB HUST\nexport * from './api-envelope'\nexport * from './api.generated'\n`,
  'utf8'
)
console.log('Domain type files generated successfully.')

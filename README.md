# Clinical Trials MCP Server

English | [简体中文](./README_CN.md)

MCP server for querying clinical trials from ClinicalTrials.gov API v2. Provides intelligent search with defaults optimized for finding relevant, currently recruiting trials.

## 功能特性 Features

- 🔍 **Smart Search**: Keywords, disease type, location-based search
- 📍 **Geographic**: Search by country, city, or coordinates
- ⏰ **Time Filters**: Default to past 3 months (recruiting trials)
- 📊 **Detailed Info**: Complete trial details including PI, contacts, eligibility
- 🌐 **Bilingual**: Supports Chinese and English queries

## Quick Start with npx

**No installation required! Run directly:**

```bash
npx xiaoyibao-clinical-trials
```

## MCP Client Configuration

Add to your MCP client settings:

### Using npx (Recommended)

```json
{
  "mcpServers": {
    "clinical-trials": {
      "command": "npx",
      "args": ["-y", "xiaoyibao-clinical-trials"]
    }
  }
}
```

### Using local installation

```bash
npm install -g xiaoyibao-clinical-trials
```

```json
{
  "mcpServers": {
    "clinical-trials": {
      "command": "xiaoyibao-clinical-trials"
    }
  }
}
```

## Available Tools

### 1. `search_clinical_trials`

Search for clinical trials with intelligent defaults.

**Default Behavior:**
- Status: `RECRUITING` (currently recruiting)
- Time: Past 3 months (trials more likely to be open)
- Results: 30 most relevant trials, sorted by recent updates

**Parameters:**
- `keywords` (string): Keywords like "KRAS G12D", "PD-1", "Pembrolizumab"
- `condition` (string): Disease/condition like "Pancreatic Cancer", "肠癌"
- `country` (string): Country name like "China", "United States", "中国"
- `city` (string): City name like "Beijing", "上海", "New York"
- `months` (number): Time range in months (default: 3)
- `status` (string): Recruitment status (default: "RECRUITING")
- `pageSize` (number): Results per page (default: 30, max: 100)
- `pageToken` (string): Pagination token

**Example:**

```json
{
  "keywords": "KRAS G12D",
  "condition": "Pancreatic Cancer",
  "country": "China"
}
```

### 2. `get_trial_details`

Get comprehensive trial details including:
- Principal Investigators (PI) information
- Hospital locations by city
- Contact details (phone, email)
- Detailed study description
- Eligibility criteria (inclusion/exclusion)
- Primary/secondary outcomes

**Parameters:**
- `nctId` (string, required): NCT number like "NCT04852770"

**Example:**

```json
{
  "nctId": "NCT04852770"
}
```

### 3. `search_by_location`

Search trials by geographic coordinates.

**Parameters:**
- `latitude` (number, required): Latitude
- `longitude` (number, required): Longitude
- `radius` (number): Search radius in miles (default: 50)
- `condition` (string): Disease/condition (optional)
- `keywords` (string): Keywords (optional)
- `status` (string): Recruitment status (default: "RECRUITING")
- `months` (number): Time range (default: 3)
- `pageSize` (number): Results per page (default: 30)

**Example:**

```json
{
  "latitude": 39.9042,
  "longitude": 116.4074,
  "radius": 50,
  "condition": "Lung Cancer"
}
```

## Output Format

All responses are in JSON format, optimized for LLM processing.

### Search Results

```json
{
  "totalCount": 13,
  "count": 13,
  "studies": [
    {
      "nctId": "NCT06218914",
      "title": "Phase 1 Study to Investigate TCRTs KRAS Mutation...",
      "status": "RECRUITING",
      "conditions": ["Pancreatic Cancer", "KRAS G12D"],
      "interventions": [{"type": "Drug", "name": "NT-112"}],
      "sponsor": "AstraZeneca",
      "studyType": "INTERVENTIONAL",
      "phase": ["PHASE1"],
      "lastUpdate": "2024-10-15"
    }
  ]
}
```

### Trial Details

Includes all search fields plus:
- `investigators[]` - PI and research team
- `overallOfficials[]` - Study officials
- `centralContacts[]` - Global contact info (phone, email)
- `locations[]` - All hospital sites with local contacts
- `locationsSummary` - Statistics (countries, cities, total sites)
- `eligibility` - Detailed inclusion/exclusion criteria
- `primaryOutcomes[]`, `secondaryOutcomes[]` - Study endpoints
- `briefSummary`, `detailedDescription` - Full study description

## Toolchain Prompt Guidance

- **Purpose**: Provide LLMs with a clear playbook for combining MCP tools (search → details → structured answer) in real clinical-query workflows.
- **Prompt files**:
  - `CLINICAL_TRIALS_PROMPT_REFERENCE.md`: full version with detailed scenarios和说明。
  - `CLINICAL_TRIALS_PROMPT_REFERENCE_COMPACT.md`: 精简版，适合作为 MCP 客户端的 system / developer prompt 使用（推荐）。
- **Typical usage**:
  - 对于问题如 “查询 GFH276 的临床信息，浙江有哪些医院可以申请”，LLM 应按照提示词中的链路：
    - 先用 `search_clinical_trials` 通过关键词和国家筛选得到 NCT 编号；
    - 再用 `get_trial_details` 查询该 NCT 的详细信息和地点；
    - 最后按文档中的四段式结构（结论先行 → 依据与说明 → 重点提示 → 风险&渠道提醒）输出给患者/家属。

## API Reference

- [ClinicalTrials.gov API Documentation](https://clinicaltrials.gov/data-api/api)
- [Complex Query Construction](https://clinicaltrials.gov/find-studies/constructing-complex-search-queries)
- [Search Areas](https://clinicaltrials.gov/data-api/about-api/search-areas)

## Development

```bash
# Clone repository
git clone https://github.com/PancrePal-xiaoyibao/xiaoyibao-clinical-trials-mcp-server.git

cd xiaoyibao-clinical-trials-mcp-server

# Install dependencies
npm install

# Run tests
npm test

# Start server
npm start
```

## Publishing to npm

```bash
# Login to npm
npm login

# Publish package
npm publish
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

Speical thanks to the contribution & development of [Xiaoyibao-Pancrepal](www.xiaoyibao.com.cn) & [xiao-x-bao community](https://info.xiao-x-bao.com.cn) to support cancer/rare disease patients and their families with ❤️ & AI！
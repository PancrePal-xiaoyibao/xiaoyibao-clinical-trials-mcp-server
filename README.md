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

To ensure **stability, accuracy, and user experience** when calling this MCP service, we provide dedicated toolchain prompt documentation. These prompts are not just optional references—they are **essential foundations** for using this service effectively.

### Why Toolchain Prompts Matter

- **Stability**: Prompts standardize tool-calling sequences (search → details → structured output), preventing LLM from making arbitrary calls that result in low efficiency or messy results.
- **Accuracy**: Clear parameter-selection rules and location-filtering logic ensure search results match patient questions precisely (e.g., drug name + province like GFH276 + Zhejiang hospitals).
- **User Experience**: A unified four-part output structure (conclusion first → evidence & explanation → key tips → risks & channel reminders) helps patients/families understand quickly, avoid risks, and find next-step support.

### Prompt Files & Usage Methods

#### 1. Compact Version (Recommended for Production)
- **File**: [`CLINICAL_TRIALS_PROMPT_REFERENCE_COMPACT.md`](./CLINICAL_TRIALS_PROMPT_REFERENCE_COMPACT.md)  
- **Purpose**: Use directly as the **system prompt / developer prompt** for MCP clients (e.g., Claude Desktop).  
- **Benefits**: Concise and powerful; contains all core rules and scenarios; minimizes token waste.  
- **How to use**:
  1. Copy or reference the file content into your LLM's system prompt.
  2. LLM will automatically call `search_clinical_trials` and `get_trial_details` following the toolchain rules.
  3. Output will auto-organize into the four-part structure, optimized for patient/family reading.

#### 2. Full Version (Reference & Documentation)
- **File**: [`CLINICAL_TRIALS_PROMPT_REFERENCE.md`](./CLINICAL_TRIALS_PROMPT_REFERENCE.md)  
- **Purpose**: Detailed explanations and additional scenarios for developers to understand or customize.  
- **When to use**:
  - Need to understand the full toolchain design philosophy.
  - Adding new clinical query scenarios.
  - Team training or documentation reference.

### Typical Usage Scenarios

**Scenario 1: Query GFH276 + Zhejiang Hospitals**
```
Patient question → Search GFH276 (keyword) + China (country)
             → Get NCT number (e.g., NCT07198321)
             → Query trial details & hospital locations
             → Filter hospitals in Zhejiang cities (Hangzhou/Ningbo/Wenzhou, etc.)
             → Output in four-part structure
```

**Scenario 2: Find Trials Near Patient**
```
Patient question (with city or coordinates) → Use search_by_location or search_clinical_trials (city param)
                                        → List trials in patient's city/nearby
                                        → Call get_trial_details for key trials
                                        → Output in four-part structure
```

### Integration Recommendations

- **Claude Desktop Users**: Paste `CLINICAL_TRIALS_PROMPT_REFERENCE_COMPACT.md` content into your Claude Desktop custom system prompt, or reference the file at conversation start.
- **Other MCP Clients**: Based on your client's system prompt / instruction configuration, integrate the prompt content accordingly.
- **API Callers**: If using this MCP via API, include the compact prompt version in your system prompt parameter to ensure every call follows the standard.

### Commitment to Stability

We commit to **long-term stability of toolchain prompts**. When updating:
- Backward compatibility of core rules is maintained.
- Breaking changes (if any) are clearly marked in git commits.
- Migration guides and version cross-reference docs are provided.

Welcome feedback or improvement suggestions! Contact us via GitHub issue or the "XiaoYiBao Assistant" WeChat official account.

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
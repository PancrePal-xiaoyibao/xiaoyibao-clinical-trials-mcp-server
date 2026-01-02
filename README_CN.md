# Clinical Trials MCP 服务器

[English](./README.md) | 简体中文

基于 ClinicalTrials.gov API v2 的 MCP 服务器，提供智能临床试验查询功能，默认优化为查找相关的、正在招募的试验。

## 功能特性

- 🔍 **智能搜索**：支持关键词、疾病类型、地理位置搜索
- 📍 **地理定位**：支持国家、城市或地理坐标查询
- ⏰ **时间过滤**：默认查询过去3个月（招募中的试验）
- 📊 **详细信息**：包含 PI、联系方式、入选标准的完整试验详情
- 🌐 **双语支持**：支持中英文查询

## 快速开始

**无需安装！直接运行：**

```bash
npx xiaoyibao-clinical-trials
```

## MCP 客户端配置

添加到你的 MCP 客户端设置：

### 使用 npx（推荐）

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

### 使用本地安装

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

## 可用工具

### 1. `search_clinical_trials`

搜索临床试验，使用智能默认值。

**默认行为：**
- 状态：`RECRUITING`（正在招募）
- 时间：过去3个月（更有可能开放）
- 结果：30个最相关试验，按最近更新排序

**参数：**
- `keywords` (string): 关键词，如 "KRAS G12D"、"PD-1"、"Pembrolizumab"
- `condition` (string): 疾病/状况，如 "胰腺癌"、"Pancreatic Cancer"
- `country` (string): 国家名称，如 "中国"、"China"、"United States"
- `city` (string): 城市名称，如 "北京"、"上海"、"New York"
- `months` (number): 时间范围（月），默认：3
- `status` (string): 招募状态，默认："RECRUITING"
- `pageSize` (number): 每页结果数，默认：30，最大：100
- `pageToken` (string): 分页令牌

**示例：**

```json
{
  "keywords": "KRAS G12D",
  "condition": "胰腺癌",
  "country": "中国"
}
```

### 2. `get_trial_details`

获取全面的试验详情，包括：
- 主要研究者（PI）信息
- 各城市医院地点
- 联系方式（电话、邮箱）
- 详细研究介绍
- 入选/排除标准
- 主要/次要结果指标

**参数：**
- `nctId` (string, 必需): NCT 编号，如 "NCT04852770"

**示例：**

```json
{
  "nctId": "NCT04852770"
}
```

### 3. `search_by_location`

根据地理坐标搜索试验。

**参数：**
- `latitude` (number, 必需): 纬度
- `longitude` (number, 必需): 经度
- `radius` (number): 搜索半径（英里），默认：50
- `condition` (string): 疾病/状况（可选）
- `keywords` (string): 关键词（可选）
- `status` (string): 招募状态，默认："RECRUITING"
- `months` (number): 时间范围，默认：3
- `pageSize` (number): 每页结果数，默认：30

**示例：**

```json
{
  "latitude": 39.9042,
  "longitude": 116.4074,
  "radius": 50,
  "condition": "肺癌"
}
```

## 输出格式

所有响应均为 JSON 格式，优化供 LLM 处理。

### 搜索结果

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

### 试验详情

包含所有搜索字段，以及：
- `investigators[]` - PI 和研究团队
- `overallOfficials[]` - 研究负责人
- `centralContacts[]` - 全局联系信息（电话、邮箱）
- `locations[]` - 所有医院地点及当地联系人
- `locationsSummary` - 统计信息（国家、城市、总地点数）
- `eligibility` - 详细入选/排除标准
- `primaryOutcomes[]`, `secondaryOutcomes[]` - 研究终点
- `briefSummary`, `detailedDescription` - 完整研究描述

## 工具链提示词指南

为了确保 LLM 在调用本 MCP 服务时的 **稳定性、准确性和用户体验**，我们提供了专门的工具链提示词文档。这些提示词不仅是可选参考，而是 **使用本服务的必要基础**。

### 为什么需要工具链提示词？

- **稳定性**：提示词规范了工具调用顺序（先搜索 → 再详情 → 最后结构化输出），避免 LLM 的随意调用导致查询效率低或结果混乱。
- **准确性**：通过明确的参数选择规则和地点筛选逻辑，确保搜索结果与患者问题高度匹配（如 GFH276 + 浙江医院这类地域敏感问题）。
- **用户体验**：统一的四段式输出结构（结论先行 → 依据与说明 → 重点提示 → 风险&渠道提醒），帮助患者/家属快速理解、规避风险、获得后续支持渠道。

### 提示词文件与使用方法

#### 1. 快速版本（推荐用于生产环境）
- **文件**：[`CLINICAL_TRIALS_PROMPT_REFERENCE_COMPACT.md`](./CLINICAL_TRIALS_PROMPT_REFERENCE_COMPACT.md)  
- **用途**：作为 MCP 客户端（如 Claude Desktop）的 **system prompt / developer prompt** 直接使用。  
- **优点**：精简有力，包含所有核心规则和场景，避免 token 浪费。  
- **使用步骤**：
  1. 将文件内容复制或引用到你的 LLM system prompt 中；
  2. LLM 会自动按照提示词中的工具链规则调用 `search_clinical_trials` 和 `get_trial_details`；
  3. 输出会自动按四段式结构组织，适合患者/家属阅读。

#### 2. 完整版本（参考与文档用）
- **文件**：[`CLINICAL_TRIALS_PROMPT_REFERENCE.md`](./CLINICAL_TRIALS_PROMPT_REFERENCE.md)  
- **用途**：更详细的说明和补充场景，用于开发者理解或自定义扩展。  
- **何时使用**：
  - 需要理解工具链的完整设计思路；
  - 要添加新的临床查询场景；
  - 团队内部培训或文档参考。

### 典型使用场景

**场景 1：查询 GFH276 + 浙江可申请医院**
```
患者问题 → 搜索 GFH276（关键词）+ 中国（国家）
       → 获得 NCT 编号（如 NCT07198321）
       → 查询该 NCT 的详细信息和医院地点
       → 筛选城市属于浙江的医院（杭州/宁波/温州等）
       → 按四段式结构输出给患者
```

**场景 2：搜索患者附近的临床试验**
```
患者问题（含城市或经纬度）→ 用 search_by_location 或 search_clinical_trials（city 参数）
                      → 列出所在城市或附近的试验
                      → 对关键试验调用 get_trial_details
                      → 按四段式结构输出
```

### 集成建议

- **Claude Desktop 用户**：将 `CLINICAL_TRIALS_PROMPT_REFERENCE_COMPACT.md` 的内容粘贴到你的 Claude Desktop 自定义 system prompt 中，或在会话开始时告诉 Claude 参考该文件。
- **其他 MCP 客户端**：根据客户端的 system prompt / instruction 配置方式，集成提示词内容。
- **API 调用者**：如果你通过 API 使用本 MCP，建议在 system prompt 参数中包含压缩版本的工具链提示词，确保每次调用都遵循规范。

### 关键承诺

我们承诺 **工具链提示词的长期稳定性**。在更新时，会：
- 保持核心规则的向后兼容性；
- 在 git commit 中明确标注 breaking changes（若有）；
- 提供迁移指南和版本对照说明。

欢迎反馈问题或建议改进！可通过 GitHub issue 或「小胰宝助手」公众号联系我们。

## API 参考

- [ClinicalTrials.gov API 文档](https://clinicaltrials.gov/data-api/api)
- [构建复杂查询](https://clinicaltrials.gov/find-studies/constructing-complex-search-queries)
- [搜索区域](https://clinicaltrials.gov/data-api/about-api/search-areas)

## 开发

```bash
# 克隆仓库
git clone https://github.com/PancrePal-xiaoyibao/xiaoyibao-clinical-trials-mcp-server.git
cd xiaoyibao-clinical-trials-mcp-server

# 安装依赖
npm install

# 运行测试
npm test

# 启动服务器
npm start
```

## 发布到 npm

```bash
# 登录 npm
npm login

# 发布包
npm publish
```

## 许可证

MIT

## 贡献

欢迎贡献！请提交 issue 或 pull request。

特别感谢[小胰宝](www.xiaoyibao.com.cn)和 [小x宝社区](https://info.xiao-x-bao.com.cn)的贡献与付出，用爱心与人工智能为癌症/罕见病患者及其家庭提供支持！
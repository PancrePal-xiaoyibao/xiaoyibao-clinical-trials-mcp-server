# ClinicalTrials.gov MCP 服务 - 项目总结

## 项目概述

已成功开发一个基于 ClinicalTrials.gov API v2 的 Model Context Protocol (MCP) 服务，满足对临床试验查询的需求。

## 完成的功能

### ✅ 1. MCP 服务核心

- **服务名称**: clinical-trials-mcp
- **版本**: 1.0.0
- **协议**: Model Context Protocol (MCP)
- **通信方式**: Stdio Transport

**文件位置**: `src/index.js`

### ✅ 2. ClinicalTrials API 客户端

完整封装了 ClinicalTrials.gov API v2 的调用，支持：

- 多条件搜索（关键词、疾病、地理位置、时间范围）
- 地理坐标查询
- 试验详情获取
- 分页支持
- 错误处理

**文件位置**: `src/clinical-trials-client.js`

### ✅ 3. 三个核心工具

#### 工具 1: search_clinical_trials

**功能**: 根据多种条件搜索临床试验

**支持的查询条件**:
- `keywords`: 关键词（如 KRAS-12D、PD-1）
- `condition`: 疾病类型（如胰腺癌、Pancreatic Cancer）
- `country`: 国家（支持中英文）
- `city`: 城市
- `months`: 时间范围（过去 N 个月）
- `status`: 招募状态
- `pageSize`: 分页大小
- `pageToken`: 分页令牌

#### 工具 2: get_trial_details

**功能**: 获取指定 NCT 编号的临床试验详细信息

**参数**:
- `nctId`: NCT 编号（必需）

#### 工具 3: search_by_location

**功能**: 根据地理坐标搜索附近的临床试验

**参数**:
- `latitude`: 纬度（必需）
- `longitude`: 经度（必需）
- `radius`: 搜索半径（英里）
- `condition`: 疾病类型（可选）
- `keywords`: 关键词（可选）

## 满足 plan.md 的所有要求

### ✅ 功能需求

1. **根据问题输入的关键词查询** ✓
   - 支持 KRAS-12D + 癌症种类 + 国家的组合查询
   - 示例：查询中国的 KRAS G12D 胰腺癌临床试验

2. **时间范围过滤** ✓
   - 支持查询过去 N 个月的临床试验
   - 基于 LastUpdatePostDate 字段过滤

3. **地理位置查询** ✓
   - 支持国家、城市查询
   - 支持地理坐标 + 半径查询
   - 国家查询通过 AREA[LocationCountry] 实现
   - 城市查询通过 SEARCH[Location] 操作符确保精确匹配

4. **输出内容** ✓
   - 默认输出：NCT编号 + 标题 + 状态 + 疾病 + 地点等
   - 详细输出：完整的试验信息，包括入选标准、结果指标、联系方式等

### ✅ API 规范遵循

严格按照 ClinicalTrials.gov API v2 规范实现：

- 使用正确的查询操作符（AREA、RANGE、SEARCH、DISTANCE 等）
- 遵循 API 的查询表达式语法
- 正确处理分页和字段选择
- 实现了错误处理和速率限制建议

## 技术实现

### 依赖包

```json
{
  "@modelcontextprotocol/sdk": "^1.22.0",
  "axios": "^1.13.2",
  "dotenv": "^17.2.3",
  "zod": "^3.25.76"
}
```

### 项目结构

```
clinical_trials_mcp/
├── src/
│   ├── index.js                    # MCP 服务器主入口
│   ├── clinical-trials-client.js   # API 客户端
│   └── test.js                     # 测试脚本
├── package.json
├── README.md                       # 使用说明
├── USAGE_EXAMPLES.md              # 详细使用示例
├── PROJECT_SUMMARY.md             # 项目总结（本文件）
├── plan.md                        # 原始需求文档
├── query-instruction.md           # API 查询规范
└── query_schema.json              # API 数据结构
```

## 测试结果

### 测试 1: KRAS-12D 胰腺癌查询（中国，过去3个月）

✅ **通过** - 成功找到 2 个符合条件的临床试验

```
1. NCT06586515: MOONRAY-01, LY3962673 研究
   - 状态: RECRUITING
   - 地点: Beijing, Shanghai, Harbin (China)

2. NCT06770452: HRS-4642 联合化疗研究
   - 状态: RECRUITING
   - 地点: Hangzhou (China)
```

### 测试 2: 城市查询

✅ **通过** - 成功查询北京的癌症临床试验，找到 4951 个结果

### 测试 3: 获取试验详情

✅ **通过** - 成功获取完整的试验详细信息，包括：
- 基本信息
- 入选标准
- 干预措施
- 研究设计
- 联系方式
- 地点详情

## 使用方法

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务

```bash
npm start
```

### 3. 运行测试

```bash
npm test
```

### 4. 配置 MCP 客户端

在 Claude Desktop 配置中添加：

```json
{
  "mcpServers": {
    "clinical-trials": {
      "command": "node",
      "args": ["/path/to/clinical_trials_mcp/src/index.js"]
    }
  }
}
```

## 关键特性

1. **智能查询构建**
   - 自动组合多个查询条件
   - 使用 SEARCH 操作符确保地理位置准确匹配
   - 支持时间范围计算

2. **灵活的地理查询**
   - 支持国家+城市组合
   - 支持地理坐标半径查询
   - 中英文国家/城市名称支持

3. **完整的数据格式化**
   - 结构化的 JSON 输出
   - 清晰的字段映射
   - 易于解析和展示

4. **错误处理**
   - 友好的错误提示
   - HTTP 状态码处理
   - 网络超时处理

## API 限制和建议

- **速率限制**: 约 50 请求/分钟
- **建议**: 实现缓存机制以减少重复请求
- **分页**: 大结果集使用分页（pageSize 最大 100）
- **查询优化**: 使用精确的搜索条件以获得更相关的结果

## 下一步可能的改进

1. **缓存机制**: 实现查询结果缓存以提高性能
2. **批量查询**: 支持批量 NCT ID 查询
3. **导出功能**: 支持导出为 CSV、Excel 等格式
4. **中文翻译**: 自动翻译英文结果为中文
5. **高级过滤**: 支持更多自定义过滤条件
6. **数据分析**: 提供统计和趋势分析功能

## 文档

- `README.md`: 基本使用说明和常见问题
- `USAGE_EXAMPLES.md`: 详细的使用示例和场景
- `query-instruction.md`: ClinicalTrials API 查询规范
- `query_schema.json`: API 数据结构定义

## 总结

✅ **项目已完成所有核心功能**

本项目成功实现了一个功能完整的 ClinicalTrials.gov MCP 服务，完全满足 plan.md 中的所有要求：

1. ✅ 支持关键词、疾病、地理位置的组合查询
2. ✅ 支持时间范围过滤
3. ✅ 支持通过城市和坐标查询地理位置
4. ✅ 提供结构化的输出格式
5. ✅ 严格遵循 ClinicalTrials.gov API 规范

服务已经过测试验证，可以直接使用。

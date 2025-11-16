# ClinicalTrials MCP 服务使用示例

## 示例 1: 搜索 KRAS-12D 相关的胰腺癌临床试验（中国，过去3个月）

这是你在 plan.md 中提到的典型使用场景。

### 请求参数：

```json
{
  "name": "search_clinical_trials",
  "arguments": {
    "keywords": "KRAS G12D",
    "condition": "Pancreatic Cancer",
    "country": "China",
    "months": 3,
    "pageSize": 10
  }
}
```

### 返回结果示例：

```json
{
  "totalCount": 2,
  "count": 2,
  "studies": [
    {
      "nctId": "NCT06586515",
      "title": "MOONRAY-01, A Study of LY3962673 in Participants With KRAS G12D-Mutant Solid Tumors",
      "status": "RECRUITING",
      "conditions": [
        "Pancreatic Ductal Adenocarcinoma",
        "Non-small Cell Lung Cancer",
        "Colorectal Cancer"
      ],
      "interventions": [
        {
          "type": "DRUG",
          "name": "LY3962673"
        }
      ],
      "phase": ["PHASE1"],
      "locations": [
        {
          "city": "Beijing",
          "country": "China"
        },
        {
          "city": "Shanghai",
          "country": "China"
        }
      ]
    }
  ]
}
```

## 示例 2: 搜索特定城市的临床试验

### 请求参数：

```json
{
  "name": "search_clinical_trials",
  "arguments": {
    "condition": "Lung Cancer",
    "city": "Beijing",
    "country": "China",
    "status": "RECRUITING",
    "pageSize": 5
  }
}
```

### 说明：
- 使用 `city` 和 `country` 参数可以精确定位到特定城市
- `status` 参数可以过滤招募状态（RECRUITING、COMPLETED 等）

## 示例 3: 获取临床试验详细信息

### 请求参数：

```json
{
  "name": "get_trial_details",
  "arguments": {
    "nctId": "NCT06586515"
  }
}
```

### 返回详细信息包括：

- 完整的试验标题和描述
- 详细的入选/排除标准
- 所有研究地点和联系方式
- 主要和次要结果指标
- 研究设计详情
- 主办方和合作方信息

## 示例 4: 多条件组合搜索

### 搜索中国正在招募的二期临床试验（过去6个月）

```json
{
  "name": "search_clinical_trials",
  "arguments": {
    "condition": "Cancer",
    "country": "China",
    "status": "RECRUITING",
    "months": 6,
    "pageSize": 20
  }
}
```

### 搜索特定药物的临床试验

```json
{
  "name": "search_clinical_trials",
  "arguments": {
    "keywords": "Pembrolizumab",
    "condition": "Melanoma",
    "status": "RECRUITING,ACTIVE_NOT_RECRUITING",
    "pageSize": 10
  }
}
```

## 示例 5: 使用地理坐标搜索

### 搜索北京附近的临床试验

```json
{
  "name": "search_by_location",
  "arguments": {
    "latitude": 39.9042,
    "longitude": 116.4074,
    "radius": 50,
    "condition": "Cancer",
    "pageSize": 10
  }
}
```

### 主要城市坐标参考：

| 城市 | 纬度 | 经度 |
|------|------|------|
| 北京 | 39.9042 | 116.4074 |
| 上海 | 31.2304 | 121.4737 |
| 广州 | 23.1291 | 113.2644 |
| 深圳 | 22.5431 | 114.0579 |
| 成都 | 30.5728 | 104.0668 |
| 杭州 | 30.2741 | 120.1551 |

## 示例 6: 分页查询

### 第一页

```json
{
  "name": "search_clinical_trials",
  "arguments": {
    "condition": "Diabetes",
    "country": "China",
    "pageSize": 20
  }
}
```

### 第二页（使用返回的 nextPageToken）

```json
{
  "name": "search_clinical_trials",
  "arguments": {
    "condition": "Diabetes",
    "country": "China",
    "pageSize": 20,
    "pageToken": "eyJxdWVyeUhhc2giOiIxMjM0NTYifQ=="
  }
}
```

## 招募状态说明

可用的招募状态值：

- `RECRUITING` - 正在招募
- `NOT_YET_RECRUITING` - 尚未开始招募
- `ACTIVE_NOT_RECRUITING` - 进行中但不招募
- `COMPLETED` - 已完成
- `SUSPENDED` - 已暂停
- `TERMINATED` - 已终止
- `WITHDRAWN` - 已撤回

可以使用逗号分隔多个状态，例如：`"RECRUITING,NOT_YET_RECRUITING"`

## 在 MCP 客户端中使用

### Claude Desktop 配置示例

在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "clinical-trials": {
      "command": "node",
      "args": ["/Users/qinxiaoqiang/Downloads/clinical_trials_mcp/src/index.js"]
    }
  }
}
```

### 在对话中使用

```
用户：请帮我查询中国正在招募的 KRAS G12D 胰腺癌临床试验，只要过去3个月的。

Claude：我来帮你查询中国的 KRAS G12D 胰腺癌临床试验...
（调用 search_clinical_trials 工具）

结果显示找到 2 个符合条件的临床试验：

1. NCT06586515 - MOONRAY-01 研究
   - 状态：正在招募
   - 地点：北京、上海等
   - 阶段：I期
   ...
```

## 输出格式定制

默认输出包含：
- NCT编号
- 试验标题
- 招募状态  
- 疾病/状况
- 干预措施（药物/治疗）
- 研究阶段
- 地点信息
- 最后更新日期

根据 plan.md 的要求，默认输出格式为：**临床试验编号 + 标题 + 其他关键信息**

## 注意事项

1. **速率限制**：ClinicalTrials.gov API 限制约每分钟 50 个请求
2. **中文支持**：国家、城市名称支持中英文，建议使用英文以获得更准确的结果
3. **时间范围**：`months` 参数基于 `LastUpdatePostDate`（最后更新日期）
4. **地理查询**：地理坐标查询可能在某些情况下受限，建议优先使用城市+国家的组合查询
5. **分页**：大量结果需要使用分页，每页最多 100 条记录

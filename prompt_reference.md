# KnowS MCP 工具调用策略指南

本文档为 AI 助手提供 **KnowS MCP 工具** 的正确使用方法，确保在不同场景下高效组合工具调用链。

---

## 📋 工具分类

### 🔍 问答类工具（常用）
- `knows_ai_search` - 检索临床证据，返回 question_id + evidences
- `knows_answer` - 基于 question_id 生成场景化答案

### 📚 文献类工具（学术深度使用）
- `knows_evidence_summary` - 单篇证据 AI 概要
- `knows_evidence_highlight` - 原文高亮片段
- `knows_get_paper_en` / `knows_get_paper_cn` - 英/中文文献详情
- `knows_get_guide` - 指南详情
- `knows_get_meeting` - 会议摘要详情

### 🔧 辅助工具
- `knows_auto_tagging` - 自动标签与结构化要素抽取
- `knows_list_question` - 历史提问列表
- `knows_list_interpretation` - 历史单篇解读列表

---

## 🎯 典型场景与调用流程

### 1️⃣ 患者问答场景（最常用）

**调用流程：**
```
用户提问 
  ↓
knows_ai_search (检索证据) 
  ↓ 获取 question_id + evidences
knows_answer (生成场景化答案)
  ↓
返回答案给用户
```

**answer_type 选择策略：**
- **普通患者**（问"怎么办""有什么药"等）→ `POPULAR_SCIENCE`
- **专业病友-研究向**（问"有什么研究""最新进展"等）→ `RESEARCH`
- **专业病友-临床决策**（问"治疗方案""临床建议"等）→ `CLINICAL`

**关键词映射（参考）：**
- 科普、患者、怎么办、如何处理 → `POPULAR_SCIENCE`
- 研究、文献、最新进展、证据 → `RESEARCH`
- 临床、治疗方案、诊疗、医生建议 → `CLINICAL`

**典型对话示例：**

```
用户："患者使用脂质体四药方案，出现腹泻，怎么处理？"

AI 操作：
1. knows_ai_search(question="患者使用脂质体四药方案，出现腹泻，怎么处理？")
   → 返回：{ question_id: "8bad9c37b1c94f3e82e5a8439333b3a6", evidences: [...] }

2. knows_answer(question_id="8bad9c37b1c94f3e82e5a8439333b3a6", answer_type="CLINICAL")
   → 返回：临床场景化答案

3. 呈现给用户：格式化的临床建议 + 引用的证据来源
```

---

### 2️⃣ 学术研究场景

**调用流程：**
```
用户提出研究需求
  ↓
knows_ai_search (检索相关证据)
  ↓ 获取 evidences 列表
筛选感兴趣的 evidence_id
  ↓
knows_evidence_summary (快速概要) 或
knows_get_paper_en/cn (详细结构化信息)
  ↓
[可选] knows_evidence_highlight (原文片段引用)
  ↓
[可选] knows_auto_tagging (结构化要素抽取)
  ↓
[可选] knows_answer (生成病友向总结)
  ↓
返回研究结果给用户
```

**典型对话示例：**

```
用户："帮我找几篇关于胰腺癌免疫治疗的最新研究"

AI 操作：
1. knows_ai_search(question="胰腺癌免疫治疗最新研究", data_scope=["PAPER", "GUIDE"])
   → 返回：{ question_id: "xxx", evidences: [ev1, ev2, ev3, ...] }

2. 对前 3 篇感兴趣的证据：
   - knows_evidence_summary(evidence_id="ev1_id")
   - knows_evidence_summary(evidence_id="ev2_id")
   - knows_evidence_summary(evidence_id="ev3_id")

3. 如用户需要详细信息，进一步调用：
   - knows_get_paper_en(evidence_id="ev1_id", translate_to_chinese=true)
   - knows_evidence_highlight(evidence_id="ev1_id")

4. 呈现给用户：文献列表 + 核心摘要 + 原文关键段落
```

---

### 3️⃣ 快速验证场景

**调用流程：**
```
用户只想要证据列表（不需要答案）
  ↓
knows_ai_search (检索证据)
  ↓
直接返回 evidences 列表给用户
```

**典型对话示例：**

```
用户："有没有关于胰腺癌化疗副作用的文献？给我列个表就行"

AI 操作：
1. knows_ai_search(question="胰腺癌化疗副作用", data_scope=["PAPER", "PAPER_CN"])
   → 返回：{ question_id: "xxx", evidences: [...] }

2. 呈现给用户：格式化的文献列表（标题、作者、期刊、年份等）
```

---

## ⚠️ 关键规则与注意事项

### ✅ 必须遵守

1. **question_id 传递**
   - `knows_answer` 的 `question_id` **必须**来自 `knows_ai_search` 的返回结果
   - ❌ 错误：`knows_answer(question_id="患者使用脂质体四药方案...")`
   - ✅ 正确：先调 `knows_ai_search` 获取 question_id，再传递给 `knows_answer`

2. **answer_type 单选**
   - `answer_type` 是**字符串**，只能选一个值：`"CLINICAL"` 或 `"RESEARCH"` 或 `"POPULAR_SCIENCE"`
   - ❌ 错误：`answer_type=["CLINICAL", "RESEARCH"]`
   - ✅ 正确：`answer_type="CLINICAL"`

3. **优先完整链路**
   - 除非用户**明确只要文献列表**，否则应该调用完整链路（search → answer）
   - 大多数提问都期望得到答案，而不是原始证据列表

4. **data_scope 灵活配置**
   - 如用户没有指定，使用默认配置（环境变量 `DEFAULT_DATA_SCOPE` 或全部）
   - 如用户明确只要"指南"或"中文文献"，则传递相应的 `data_scope` 参数

---

## 🔄 典型错误与修正

### 错误 1：跳过 search 直接调 answer

```
❌ 错误操作：
knows_answer(question_id="胰腺癌患者化疗副作用怎么处理？", answer_type="CLINICAL")

✅ 正确操作：
1. knows_ai_search(question="胰腺癌患者化疗副作用怎么处理？")
2. 获取返回的 question_id（如 "abc123"）
3. knows_answer(question_id="abc123", answer_type="CLINICAL")
```

### 错误 2：answer_type 传数组

```
❌ 错误操作：
knows_answer(question_id="abc123", answer_type=["CLINICAL", "RESEARCH"])

✅ 正确操作：
knows_answer(question_id="abc123", answer_type="CLINICAL")
```

### 错误 3：不需要答案时仍调用 answer

```
用户："给我列几篇胰腺癌的文献"

❌ 错误操作：
1. knows_ai_search(...)
2. knows_answer(...)  ← 用户只要列表，不需要生成答案

✅ 正确操作：
1. knows_ai_search(...)
2. 直接返回 evidences 列表
```

---

## 💡 进阶技巧

### 1. 多轮对话优化
- 如用户追问"再详细点"，可以：
  - 保留上一次的 question_id，切换 answer_type（如从 POPULAR_SCIENCE 切到 CLINICAL）
  - 或调用 `knows_evidence_summary` 展示更多证据细节

### 2. 证据溯源
- 当用户质疑答案时，使用 `knows_evidence_highlight` 展示原文片段
- 使用 `knows_get_paper_en/cn` 提供完整文献信息

### 3. 结构化要素提取
- 当用户需要"研究设计""样本量""终点指标"等信息时
- 使用 `knows_auto_tagging` 自动抽取结构化要素

---

## 📝 总结

**核心原则：**
1. **先 search，后 answer**（除非用户只要列表）
2. **question_id 必须来自 search 结果**
3. **answer_type 根据用户角色和提问风格自动选择**
4. **灵活组合文献类工具，满足学术深度需求**

按照本指南操作，可确保 KnowS MCP 工具在各类场景下高效、准确地为用户提供医学知识服务。

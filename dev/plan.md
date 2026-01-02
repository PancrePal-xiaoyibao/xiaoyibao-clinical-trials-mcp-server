# 目的
开发一个基于clinicaltrials api的mcp服务，能够满足对于临床试验查询的需要
API Server地址：https://clinicaltrials.gov/api/v2

# 开发工作：
1. 创建mcp服务，定义服务名，定义服务端口，定义服务路径，定义服务处理函数
2. 创建clinicaltrials api客户端，定义api地址，定义api端口，定义api路径，定义api处理函数
3. 创建mcp服务与clinicaltrials api客户端的映射关系，定义映射关系
4. 创建mcp服务启动函数，调用clinicaltrials api客户端处理函数，返回结果

# 知识背景
clinical trials的api文档规范，请阅读并保存到记忆，对于开发api的规范，请严格按照api规范执行。
https://clinicaltrials.gov/data-api/api#extapi

# 功能满足
1. 根据问题输入的关键词，比如KRAS-12D + 癌症种类比如胰腺癌 + 中国，能够查询过去3个月的KRAS-12D的临床试验详情
2. 地区/国家不支持直接查询，需要通过API地址坐标转化，进行查询
2. 输出内容
2.1. 默认为输出 临床试验编号，试验内容，发起人，发起机构，联络方式，招募状态
2.2  根据临床试验编号，查询完整详情
2.3  根据关键词，查询结果包括该要详情

# samples
1. curl -X GET "https://clinicaltrials.gov/api/v2/studies?query.term=kras+pancreatic&postFilter.overallStatus=RECRUITING" \
 -H "accept: application/json" \

response: /Users/qinxiaoqiang/Downloads/clinical_trials_mcp/query_response.md, 注意有多页，有  "nextPageToken": "ZVNj7o2Elu8o3lptRcizoKb-mpOQJJxuYfCk3_AckA"参数。
}

# 查询返回参数
Study Title	, NCT Number,	Status,	Conditions,	Interventions,	Sponsor	Study ,Type

- data_sample
 
1
A Phase II Study Evaluating JAB-21822 Monotherapy in Adult Patients With Pancreatic Cancer and Other Solid Tumors Harboring the KRAS p.G12C Mutation.,
NCT06008288,
Recruiting,
KRAS P.G12C|Pancreatic Cancer|Solid Tumor,
Drug: JAB-21822,
Allist Pharmaceuticals, Inc.,
Interventional

# 单一查询返回结果数据
/Users/qinxiaoqiang/Downloads/clinical_trials_mcp/NCT06008288.json
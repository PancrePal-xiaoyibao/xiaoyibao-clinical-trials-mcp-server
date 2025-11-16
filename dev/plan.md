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
1. 根据问题输入的关键词，比如KRAS-12D + 癌症种类比如胰腺癌 + 中国，能够查询过去3个月的KRAS-12D的临床试验
2. 国家不支持直接查询，需要通过API地址坐标转化，进行查询
2. 输出内容
2.1. 默认为输出 临床试验编号+
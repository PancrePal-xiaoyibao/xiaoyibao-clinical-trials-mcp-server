#!/usr/bin/env node

/**
 * ClinicalTrials.gov MCP Server
 * 提供临床试验查询的 MCP 服务
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ClinicalTrialsClient } from './clinical-trials-client.js';

// 创建 MCP 服务器实例
const server = new Server(
  {
    name: 'xiaoyibao-clinical-trials',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 创建 ClinicalTrials API 客户端
const clinicalTrialsClient = new ClinicalTrialsClient();

/**
 * 工具列表处理器
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_clinical_trials',
        description: '搜索临床试验。默认查询招募中且过去3个月内更新的试验，按更新时间降序返回30个最相关结果。支持根据关键词（如KRAS-12D）、疾病类型（如胰腺癌）、地理位置（国家/城市）等条件查询。',
        inputSchema: {
          type: 'object',
          properties: {
            keywords: {
              type: 'string',
              description: '关键词，例如：KRAS-12D、PD-1、Pembrolizumab等',
            },
            condition: {
              type: 'string',
              description: '疾病或状况，例如：胰腺癌、肺癌、Pancreatic Cancer等',
            },
            country: {
              type: 'string',
              description: '国家，例如：中国、美国、China、United States等',
            },
            city: {
              type: 'string',
              description: '城市名称，例如：北京、上海、Beijing等',
            },
            months: {
              type: 'number',
              description: '查询过去N个月的临床试验，默认3个月（推荐：3个月内的更有可能还在招募）',
              default: 3,
            },
            status: {
              type: 'string',
              description: '招募状态，默认RECRUITING（招募中）。其他选项：COMPLETED、NOT_YET_RECRUITING等。多个状态用逗号分隔',
              default: 'RECRUITING',
            },
            pageSize: {
              type: 'number',
              description: '每页返回的结果数量，默认30，最大100（推荐：20-30个最相关结果已足够）',
              default: 30,
            },
            pageToken: {
              type: 'string',
              description: '分页令牌，用于获取下一页结果',
            },
          },
        },
      },
      {
        name: 'get_trial_details',
        description: '获取指定临床试验的详细信息，包括：PI研究者信息、各地医院地点、联系方式（电话/邮箱）、详细研究介绍、入选/排除标准、结果指标等全面信息',
        inputSchema: {
          type: 'object',
          properties: {
            nctId: {
              type: 'string',
              description: 'NCT编号，例如：NCT04852770',
            },
          },
          required: ['nctId'],
        },
      },
      {
        name: 'search_by_location',
        description: '根据地理坐标搜索附近的临床试验。默认查询招募中且3个月内更新的30个最相关结果。',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
              description: '纬度',
            },
            longitude: {
              type: 'number',
              description: '经度',
            },
            radius: {
              type: 'number',
              description: '搜索半径（英里），默认50英里',
              default: 50,
            },
            condition: {
              type: 'string',
              description: '疾病或状况（可选）',
            },
            keywords: {
              type: 'string',
              description: '关键词（可选）',
            },
            status: {
              type: 'string',
              description: '招募状态，默认RECRUITING',
              default: 'RECRUITING',
            },
            months: {
              type: 'number',
              description: '时间范围（月），默认3个月',
              default: 3,
            },
            pageSize: {
              type: 'number',
              description: '每页返回的结果数量，默认30',
              default: 30,
            },
          },
          required: ['latitude', 'longitude'],
        },
      },
    ],
  };
});

/**
 * 工具调用处理器
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_clinical_trials': {
        const results = await clinicalTrialsClient.searchTrials(args);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'get_trial_details': {
        const { nctId } = args;
        if (!nctId) {
          throw new Error('NCT编号是必需的');
        }
        
        const details = await clinicalTrialsClient.getTrialDetails(nctId);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(details, null, 2),
            },
          ],
        };
      }

      case 'search_by_location': {
        const { latitude, longitude, radius = 50, ...otherParams } = args;
        
        if (latitude === undefined || longitude === undefined) {
          throw new Error('经纬度是必需的');
        }
        
        const results = await clinicalTrialsClient.searchByLocation(
          latitude,
          longitude,
          radius,
          otherParams
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`未知工具: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `错误: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * 启动服务器
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('XiaoYiBao ClinicalTrials MCP Server 正在运行...');
}

main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});

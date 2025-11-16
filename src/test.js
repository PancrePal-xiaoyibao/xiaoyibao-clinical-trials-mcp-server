/**
 * ClinicalTrials MCP 服务测试脚本
 */

import { ClinicalTrialsClient } from './clinical-trials-client.js';

const client = new ClinicalTrialsClient();

async function testSearchTrials() {
  console.log('\n=== 测试1: 搜索 KRAS-12D 胰腺癌临床试验（使用默认设置：招募中、3个月内、30个结果） ===\n');
  
  try {
    const results = await client.searchTrials({
      keywords: 'KRAS G12D',
      condition: 'Pancreatic Cancer',
      // 使用默认值：
      // months: 3 - 过去3个月
      // status: 'RECRUITING' - 招募中
      // pageSize: 30 - 30个结果
    });
    
    console.log(`找到 ${results.totalCount} 个临床试验（符合条件：招募中且3个月内更新）`);
    console.log(`返回 ${results.count} 个最相关结果\n`);
    
    // 输出前5个结果的关键信息
    results.studies.slice(0, 5).forEach((study, index) => {
      console.log(`${index + 1}. ${study.nctId}: ${study.title}`);
      console.log(`   状态: ${study.status}`);
      console.log(`   疾病: ${study.conditions.join(', ')}`);
      console.log(`   主办方: ${study.sponsor}`);
      console.log();
    });
  } catch (error) {
    console.error('搜索失败:', error.message);
  }
}

async function testSearchByLocation() {
  console.log('\n=== 测试2: 搜索纽约的癌症临床试验（使用默认设置） ===\n');
  
  try {
    const results = await client.searchTrials({
      condition: 'Cancer',
      city: 'New York',
      // 使用默认值：招募中、3个月内、30个结果
    });
    
    console.log(`找到 ${results.totalCount} 个临床试验（招募中且3个月内）`);
    console.log(`返回 ${results.count} 个最相关结果\n`);
    
    // 输出前3个结果
    results.studies.slice(0, 3).forEach((study, index) => {
      console.log(`${index + 1}. ${study.nctId}: ${study.title}`);
      console.log(`   状态: ${study.status}`);
      console.log();
    });
  } catch (error) {
    console.error('搜索失败:', error.message);
  }
}

async function testGetTrialDetails() {
  console.log('\n=== 测试3: 获取临床试验详情 ===\n');
  
  try {
    // 先搜索获取一个 NCT ID（使用默认设置）
    const searchResults = await client.searchTrials({
      condition: 'Lung Cancer',
      // status: 'RECRUITING' - 默认招募中
      // months: 3 - 默认3个月
      pageSize: 1,
    });
    
    if (searchResults.studies.length > 0) {
      const nctId = searchResults.studies[0].nctId;
      console.log(`获取 ${nctId} 的详细信息...\n`);
      
      const details = await client.getTrialDetails(nctId);
      
      // === 基本信息 ===
      console.log('=== 基本信息 ===');
      console.log(`NCT ID: ${details.nctId}`);
      console.log(`标题: ${details.title}`);
      console.log(`官方标题: ${details.officialTitle}`);
      console.log(`状态: ${details.status}`);
      console.log(`研究类型: ${details.studyType}`);
      console.log(`阶段: ${details.phase.join(', ')}`);
      console.log(`计划入组人数: ${details.enrollmentCount}`);
      console.log(`疾病: ${details.conditions.join(', ')}`);
      console.log(`关键词: ${details.keywords.join(', ')}`);
      
      // === 主办方和协作者 ===
      console.log('\n=== 主办方和协作者 ===');
      console.log(`主办方: ${details.leadSponsor.name} (${details.leadSponsor.class})`);
      if (details.collaborators.length > 0) {
        console.log(`协作者: ${details.collaborators.map(c => c.name).join(', ')}`);
      }
      
      // === 研究者（PI等） ===
      if (details.investigators && details.investigators.length > 0) {
        console.log('\n=== 研究者（PI等） ===');
        details.investigators.forEach(inv => {
          console.log(`  - ${inv.name} (${inv.role}) - ${inv.affiliation}`);
        });
      }
      
      // === 研究负责人 ===
      if (details.overallOfficials && details.overallOfficials.length > 0) {
        console.log('\n=== 研究负责人/主要研究者 ===');
        details.overallOfficials.forEach(official => {
          console.log(`  - ${official.name} (${official.role}) - ${official.affiliation}`);
        });
      }
      
      // === 中心联系人 ===
      if (details.centralContacts && details.centralContacts.length > 0) {
        console.log('\n=== 中心联系人 ===');
        details.centralContacts.forEach(contact => {
          console.log(`  - ${contact.name} (${contact.role})`);
          if (contact.phone) console.log(`    电话: ${contact.phone}${contact.phoneExt ? ' ext ' + contact.phoneExt : ''}`);
          if (contact.email) console.log(`    邮箱: ${contact.email}`);
        });
      }
      
      // === 干预措施 ===
      console.log('\n=== 干预措施 ===');
      details.interventions.forEach(intervention => {
        console.log(`  - ${intervention.type}: ${intervention.name}`);
        if (intervention.description) {
          console.log(`    ${intervention.description.substring(0, 100)}...`);
        }
      });
      
      // === 入选/排除标准 ===
      console.log('\n=== 入选/排除标准 ===');
      console.log(`性别: ${details.eligibility.sex}`);
      console.log(`年龄范围: ${details.eligibility.minimumAge} - ${details.eligibility.maximumAge}`);
      console.log(`健康志愿者: ${details.eligibility.healthyVolunteers}`);
      if (details.eligibility.eligibilityCriteria) {
        console.log(`\n详细标准:\n${details.eligibility.eligibilityCriteria.substring(0, 300)}...`);
      }
      
      // === 研究地点统计 ===
      console.log('\n=== 研究地点统计 ===');
      console.log(`总地点数: ${details.locationsSummary.totalLocations}`);
      console.log(`涉及国家: ${details.locationsSummary.countries.join(', ')}`);
      console.log(`主要城市: ${details.locationsSummary.cities.slice(0, 10).join(', ')}${details.locationsSummary.cities.length > 10 ? '...' : ''}`);
      
      // === 具体地点信息（显示前3个） ===
      if (details.locations && details.locations.length > 0) {
        console.log('\n=== 具体地点信息（前3个） ===');
        details.locations.slice(0, 3).forEach((loc, idx) => {
          console.log(`\n${idx + 1}. ${loc.facility}`);
          console.log(`   地址: ${loc.city}${loc.state ? ', ' + loc.state : ''}, ${loc.country} ${loc.zip || ''}`);
          console.log(`   状态: ${loc.status}`);
          
          if (loc.contacts && loc.contacts.length > 0) {
            console.log(`   联系人:`);
            loc.contacts.forEach(contact => {
              console.log(`     - ${contact.name} (${contact.role})`);
              if (contact.phone) console.log(`       电话: ${contact.phone}`);
              if (contact.email) console.log(`       邮箱: ${contact.email}`);
            });
          }
        });
      }
      
      // === 研究简介 ===
      console.log('\n=== 研究简介 ===');
      console.log(`${details.briefSummary?.substring(0, 400)}...`);
      
    } else {
      console.log('未找到可用的临床试验');
    }
  } catch (error) {
    console.error('获取详情失败:', error.message);
  }
}

async function runTests() {
  console.log('开始测试 ClinicalTrials MCP 服务...\n');
  
  await testSearchTrials();
  await testSearchByLocation();
  await testGetTrialDetails();
  
  console.log('\n测试完成！');
}

runTests().catch(console.error);

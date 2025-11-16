/**
 * ClinicalTrials.gov API 客户端
 * 封装对 ClinicalTrials.gov API v2 的调用
 */

import axios from 'axios';

const BASE_URL = 'https://clinicaltrials.gov/api/v2';

export class ClinicalTrialsClient {
  constructor() {
    this.axios = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  /**
   * 搜索临床试验
   * @param {Object} params 搜索参数
   * @returns {Promise<Object>} 搜索结果
   */
  async searchTrials(params) {
    const {
      keywords,
      condition,
      country,
      city,
      months = 3,  // 默认过去3个月，更符合实际需求
      status = 'RECRUITING',  // 默认只查询招募中的
      pageSize = 30,  // 默认返回30个最相关的结果
      pageToken,
    } = params;

    const queryParams = new URLSearchParams();

    // 构建查询条件
    const queryParts = [];

    // 关键词查询（可以是药物名称、基因突变等）
    if (keywords) {
      queryParts.push(keywords);
    }

    // 疾病/状况查询
    if (condition) {
      queryParams.append('query.cond', condition);
    }

    // 其他关键词
    if (queryParts.length > 0) {
      queryParams.append('query.term', queryParts.join(' AND '));
    }

    // 地理位置过滤
    if (country) {
      queryParams.append('filter.advanced', `AREA[LocationCountry]${country}`);
    }

    if (city) {
      // 使用 SEARCH 操作符确保城市和国家在同一位置记录中
      const locationQuery = country 
        ? `SEARCH[Location](AREA[LocationCity]${city} AND AREA[LocationCountry]${country})`
        : `AREA[LocationCity]${city}`;
      
      if (queryParams.has('filter.advanced')) {
        const existing = queryParams.get('filter.advanced');
        queryParams.set('filter.advanced', `${existing} AND ${locationQuery}`);
      } else {
        queryParams.set('filter.advanced', locationQuery);
      }
    }

    // 时间范围过滤（过去N个月）
    // 默认3个月内的更新，更有可能还在招募
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const startDateStr = this.formatDate(startDate);
    const endDateStr = this.formatDate(endDate);
    
    const dateQuery = `AREA[LastUpdatePostDate]RANGE[${startDateStr},${endDateStr}]`;
    
    if (queryParams.has('filter.advanced')) {
      const existing = queryParams.get('filter.advanced');
      queryParams.set('filter.advanced', `${existing} AND ${dateQuery}`);
    } else {
      queryParams.set('filter.advanced', dateQuery);
    }

    // 招募状态过滤（默认只查招募中的）
    queryParams.append('filter.overallStatus', status);

    // 分页参数（默认30个，满足大部分需求）
    queryParams.append('pageSize', pageSize.toString());

    if (pageToken) {
      queryParams.append('pageToken', pageToken);
    }

    // 指定返回字段
    queryParams.append('fields', [
      'NCTId',
      'BriefTitle',
      'OfficialTitle',
      'OverallStatus',
      'Condition',
      'InterventionName',
      'Phase',
      'StudyType',
      'StartDate',
      'PrimaryCompletionDate',
      'CompletionDate',
      'EnrollmentCount',
      'LeadSponsorName',
      'BriefSummary',
      'LocationCity',
      'LocationCountry',
      'LocationStatus',
      'LastUpdatePostDate',
    ].join(','));

    // 设置排序（按最近更新时间降序）
    queryParams.append('sort', 'LastUpdatePostDate:desc');

    // 计算总数
    queryParams.append('countTotal', 'true');

    try {
      const response = await this.axios.get('/studies', {
        params: queryParams,
      });

      return this.formatSearchResults(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 根据地理坐标搜索临床试验
   * @param {number} latitude 纬度
   * @param {number} longitude 经度
   * @param {number} radius 半径（英里）
   * @param {Object} otherParams 其他搜索参数
   * @returns {Promise<Object>} 搜索结果
   */
  async searchByLocation(latitude, longitude, radius, otherParams = {}) {
    const queryParams = new URLSearchParams();

    // 使用 AREA 和 DISTANCE 操作符进行地理位置查询
    const geoQuery = `AREA[LocationGeoPoint]DISTANCE[${latitude},${longitude},${radius}mi]`;
    queryParams.append('filter.advanced', geoQuery);

    // 疾病/状况
    if (otherParams.condition) {
      queryParams.append('query.cond', otherParams.condition);
    }

    // 关键词
    if (otherParams.keywords) {
      queryParams.append('query.term', otherParams.keywords);
    }

    // 默认只查招募中的
    const status = otherParams.status || 'RECRUITING';
    queryParams.append('filter.overallStatus', status);

    // 时间过滤：默认3个月内
    const months = otherParams.months || 3;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const startDateStr = this.formatDate(startDate);
    const endDateStr = this.formatDate(endDate);
    
    const dateQuery = `AREA[LastUpdatePostDate]RANGE[${startDateStr},${endDateStr}]`;
    const existing = queryParams.get('filter.advanced');
    queryParams.set('filter.advanced', `${existing} AND ${dateQuery}`);

    // 分页：默认30个结果
    const pageSize = otherParams.pageSize || 30;
    queryParams.append('pageSize', pageSize.toString());

    if (otherParams.pageToken) {
      queryParams.append('pageToken', otherParams.pageToken);
    }

    // 指定返回字段
    queryParams.append('fields', [
      'NCTId',
      'BriefTitle',
      'OfficialTitle',
      'OverallStatus',
      'Condition',
      'InterventionName',
      'Phase',
      'StudyType',
      'LocationFacility',
      'LocationCity',
      'LocationState',
      'LocationCountry',
      'LocationStatus',
      'LocationGeoPoint',
      'ContactName',
      'ContactPhone',
      'ContactEmail',
      'BriefSummary',
    ].join(','));

    // 排序
    queryParams.append('sort', 'LastUpdatePostDate:desc');
    queryParams.append('countTotal', 'true');

    try {
      const response = await this.axios.get('/studies', {
        params: queryParams,
      });

      return this.formatSearchResults(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 获取单个临床试验详情
   * @param {string} nctId NCT编号
   * @returns {Promise<Object>} 试验详情
   */
  async getTrialDetails(nctId) {
    try {
      const response = await this.axios.get(`/studies/${nctId}`);
      return this.formatTrialDetails(response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 格式化搜索结果
   * @param {Object} data API返回的原始数据
   * @returns {Object} 格式化后的结果
   */
  formatSearchResults(data) {
    const { studies = [], totalCount = 0, nextPageToken } = data;

    const formattedStudies = studies.map(study => {
      const protocol = study.protocolSection || {};
      const identification = protocol.identificationModule || {};
      const status = protocol.statusModule || {};
      const description = protocol.descriptionModule || {};
      const conditions = protocol.conditionsModule || {};
      const design = protocol.designModule || {};
      const arms = protocol.armsInterventionsModule || {};
      const sponsor = protocol.sponsorCollaboratorsModule || {};
      const contacts = protocol.contactsLocationsModule || {};

      return {
        nctId: identification.nctId,
        title: identification.briefTitle,
        officialTitle: identification.officialTitle,
        status: status.overallStatus,
        conditions: conditions.conditions || [],
        interventions: arms.interventions?.map(i => ({
          type: i.type,
          name: i.name,
          description: i.description,
        })) || [],
        phase: design.phases || [],
        studyType: design.studyType,
        enrollmentCount: design.enrollmentInfo?.count,
        startDate: status.startDateStruct?.date,
        completionDate: status.completionDateStruct?.date,
        sponsor: sponsor.leadSponsor?.name,
        summary: description.briefSummary,
        locations: contacts.locations?.map(loc => ({
          facility: loc.facility,
          city: loc.city,
          state: loc.state,
          country: loc.country,
          status: loc.status,
          coordinates: loc.geoPoint,
        })) || [],
        lastUpdate: status.lastUpdatePostDateStruct?.date,
      };
    });

    return {
      totalCount,
      count: formattedStudies.length,
      nextPageToken,
      studies: formattedStudies,
    };
  }

  /**
   * 格式化试验详情
   * @param {Object} data API返回的原始数据
   * @returns {Object} 格式化后的详情
   */
  formatTrialDetails(data) {
    const protocol = data.protocolSection || {};
    const identification = protocol.identificationModule || {};
    const status = protocol.statusModule || {};
    const description = protocol.descriptionModule || {};
    const conditions = protocol.conditionsModule || {};
    const design = protocol.designModule || {};
    const arms = protocol.armsInterventionsModule || {};
    const outcomes = protocol.outcomesModule || {};
    const eligibility = protocol.eligibilityModule || {};
    const sponsor = protocol.sponsorCollaboratorsModule || {};
    const contacts = protocol.contactsLocationsModule || {};

    return {
      // === 基本信息 ===
      nctId: identification.nctId,
      title: identification.briefTitle,
      officialTitle: identification.officialTitle,
      acronym: identification.acronym,
      status: status.overallStatus,
      whyStopped: status.whyStopped,
      
      // === 疾病和关键词 ===
      conditions: conditions.conditions || [],
      keywords: conditions.keywords || [],
      
      // === 干预措施 ===
      interventions: arms.interventions?.map(i => ({
        type: i.type,
        name: i.name,
        description: i.description,
        otherNames: i.otherNames || [],
      })) || [],
      
      // === 研究设计 ===
      studyType: design.studyType,
      phase: design.phases || [],
      designInfo: design.designInfo,
      enrollmentCount: design.enrollmentInfo?.count,
      enrollmentType: design.enrollmentInfo?.type,
      
      // === 时间信息 ===
      startDate: status.startDateStruct?.date,
      primaryCompletionDate: status.primaryCompletionDateStruct?.date,
      completionDate: status.completionDateStruct?.date,
      lastUpdate: status.lastUpdatePostDateStruct?.date,
      studyFirstPostDate: status.studyFirstPostDateStruct?.date,
      
      // === 主办方和研究者 ===
      leadSponsor: {
        name: sponsor.leadSponsor?.name,
        class: sponsor.leadSponsor?.class,
      },
      collaborators: sponsor.collaborators?.map(c => ({
        name: c.name,
        class: c.class,
      })) || [],
      responsibleParty: sponsor.responsibleParty,
      
      // === 研究者信息（PI等） ===
      investigators: protocol.sponsorCollaboratorsModule?.investigators?.map(inv => ({
        name: inv.name,
        role: inv.role,
        affiliation: inv.affiliation,
      })) || [],
      
      // === 描述信息 ===
      briefSummary: description.briefSummary,
      detailedDescription: description.detailedDescription,
      
      // === 结果指标 ===
      primaryOutcomes: outcomes.primaryOutcomes?.map(outcome => ({
        measure: outcome.measure,
        description: outcome.description,
        timeFrame: outcome.timeFrame,
      })) || [],
      secondaryOutcomes: outcomes.secondaryOutcomes?.map(outcome => ({
        measure: outcome.measure,
        description: outcome.description,
        timeFrame: outcome.timeFrame,
      })) || [],
      otherOutcomes: outcomes.otherOutcomes?.map(outcome => ({
        measure: outcome.measure,
        description: outcome.description,
        timeFrame: outcome.timeFrame,
      })) || [],
      
      // === 入选/排除标准（详细） ===
      eligibility: {
        eligibilityCriteria: eligibility.eligibilityCriteria,
        sex: eligibility.sex,
        genderBased: eligibility.genderBased,
        genderDescription: eligibility.genderDescription,
        minimumAge: eligibility.minimumAge,
        maximumAge: eligibility.maximumAge,
        stdAges: eligibility.stdAges || [],
        healthyVolunteers: eligibility.healthyVolunteers,
      },
      
      // === 中心联系人（全局） ===
      centralContacts: contacts.centralContacts?.map(contact => ({
        name: contact.name,
        role: contact.role,
        phone: contact.phone,
        phoneExt: contact.phoneExt,
        email: contact.email,
      })) || [],
      
      overallOfficials: contacts.overallOfficials?.map(official => ({
        name: official.name,
        affiliation: official.affiliation,
        role: official.role,
      })) || [],
      
      // === 研究地点（按城市/医院） ===
      locations: contacts.locations?.map(loc => ({
        facility: loc.facility,
        city: loc.city,
        state: loc.state,
        zip: loc.zip,
        country: loc.country,
        status: loc.status,
        coordinates: loc.geoPoint,
        // 地点联系人（PI、招募协调员等）
        contacts: loc.contacts?.map(contact => ({
          name: contact.name,
          role: contact.role,
          phone: contact.phone,
          phoneExt: contact.phoneExt,
          email: contact.email,
        })) || [],
      })) || [],
      
      // === 研究地点统计 ===
      locationsSummary: {
        totalLocations: contacts.locations?.length || 0,
        countries: [...new Set(contacts.locations?.map(l => l.country).filter(Boolean))] || [],
        cities: [...new Set(contacts.locations?.map(l => l.city).filter(Boolean))] || [],
      },
    };
  }

  /**
   * 格式化日期为 API 所需格式 (yyyy-MM-dd)
   * @param {Date} date 日期对象
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 错误处理
   * @param {Error} error 错误对象
   * @returns {Error} 处理后的错误
   */
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      if (status === 404) {
        return new Error(`未找到临床试验: ${message}`);
      } else if (status === 429) {
        return new Error('请求过于频繁，请稍后再试');
      } else if (status === 400) {
        return new Error(`查询参数无效: ${message}`);
      } else {
        return new Error(`API错误 (${status}): ${message}`);
      }
    } else if (error.request) {
      return new Error('无法连接到 ClinicalTrials.gov API');
    } else {
      return error;
    }
  }
}

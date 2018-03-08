/**
 * GuanPlus.Identity.WebApi
 *
 * OpenAPI spec version: v1
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as models from './models';

/**
 * Tenant
 */
export interface TenantModel {
    /**
     * TenantNo
     */
    tenantNo?: number;

    /**
     * 主机名称
     */
    serverName?: string;

    /**
     * 用户名称
     */
    userName?: string;

    /**
     * 数据库名称
     */
    databaseName?: string;

    /**
     * Tenant 名称 TEST
     */
    name?: string;

    /**
     * 密码
     */
    password?: string;

    /**
     * 端口号
     */
    port?: string;

    /**
     * 是否测试用户
     */
    isTestUser?: boolean;

}
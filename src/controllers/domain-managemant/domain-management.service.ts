import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DomainManagementService {
  private CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

  private loadWorkerScript(): string {
    const scriptPath = path.resolve(process.cwd(), 'cdn-worker/dist/index.js');

    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Worker script not found at: ${scriptPath}`);
    }

    return fs.readFileSync(scriptPath, 'utf-8');
  }

  async addDomain(
    email: string,
    apiToken: string,
    domain: string,
    accountId: string,
  ): Promise<any> {
    // Step 1: Add the domain to Cloudflare
    const script = this.loadWorkerScript();
    const zoneId = await this.addZone(apiToken, domain, accountId);

    // Step 2: Deploy Worker for the domain
    await this.deployWorker(apiToken, accountId, domain, script, zoneId);

    // Step 3: Return instructions for DNS configuration
    return {
      message:
        'Domain successfully added and worker deployed. Update NS records as follows:',
      nsRecords: [
        { name: 'ns1.cloudflare.com' },
        { name: 'ns2.cloudflare.com' },
      ],
      domain,
    };
  }

  private async addZone(
    apiToken: string,
    domain: string,
    accountId: string,
  ): Promise<string> {
    try {
      const body = {
        account: { id: accountId },
        name: domain,
        type: 'full',
      };

      const response = await axios.post(
        `${this.CLOUDFLARE_API_BASE}/zones`,
        body,
        {
          headers: {
            'X-Auth-Email': 'aniadvetski@rooh.co',
            'X-Auth-Key': `a2203d1685d41ebe3b3d979d1d54123401a6a`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        return response.data.result.id;
      } else {
        throw new Error(
          response.data.errors?.[0]?.message ||
            'Failed to add domain to Cloudflare',
        );
      }
    } catch (error) {
      console.error('Error adding domain:', error.message);
      if (error.response) {
        console.error(
          'Response data:',
          JSON.stringify(error.response.data, null, 2),
        );
      }
      throw new HttpException(
        'Failed to add domain to Cloudflare',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async deployWorker(
    apiToken: string,
    accountId: string, // Используем accountId
    domain: string,
    script: string, // Передаем готовый код скрипта
    zoneId: string,
  ): Promise<void> {
    try {
      const workerName = domain.replace(/\./g, '-'); // Имя скрипта, совместимое с Cloudflare

      // Шаг 1: Публикуем воркер
      console.log(`Deploying worker script for domain: ${domain}`);
      const publishResponse = await axios.put(
        `${this.CLOUDFLARE_API_BASE}/accounts/${accountId}/workers/scripts/${workerName}`,
        script,
        {
          headers: {
            'X-Auth-Email': 'aniadvetski@rooh.co',
            'X-Auth-Key': `a2203d1685d41ebe3b3d979d1d54123401a6a`,
            'Content-Type': 'application/javascript',
          },
        },
      );

      if (publishResponse.status !== 200) {
        console.error('Failed to deploy worker:', publishResponse.data);
        throw new Error('Worker deployment failed');
      }
      console.log(`Worker script ${workerName} deployed successfully.`);

      // Шаг 2: Маппим воркер на домен
      console.log(`Mapping worker to domain: ${domain}`);
      const mapResponse = await axios.post(
        `${this.CLOUDFLARE_API_BASE}/zones/${zoneId}/workers/routes`,
        {
          pattern: `${domain}/*`, // Поддомен или основной домен
          script: workerName, // Имя воркера
        },
        {
          headers: {
            'X-Auth-Email': 'aniadvetski@rooh.co',
            'X-Auth-Key': `a2203d1685d41ebe3b3d979d1d54123401a6a`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Worker mapped successfully:', mapResponse.data);

      if (mapResponse.status !== 200) {
        console.error('Failed to map worker to domain:', mapResponse.data);
        throw new Error('Domain mapping failed');
      }
      console.log(`Worker mapped to domain ${domain} successfully.`);
    } catch (error) {
      console.error(
        'Error deploying worker:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        'Failed to deploy worker',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

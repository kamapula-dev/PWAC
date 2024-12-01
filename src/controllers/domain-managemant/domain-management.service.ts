import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
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
    gApiKey: string,
    domain: string,
  ): Promise<any> {
    const script = this.loadWorkerScript();
    const response = await axios.get(
      `${this.CLOUDFLARE_API_BASE}/accounts`,
      this.getHeaders(email, gApiKey),
    );

    const accountId = response.data?.result?.[0]?.id;

    if (!accountId) {
      throw new HttpException(
        'Failed to retrieve accountId',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const zoneId = await this.addZone(email, gApiKey, domain, accountId);

    await this.deployWorker(email, gApiKey, accountId, domain, script, zoneId);

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
    email,
    gApiKey: string,
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
        this.getHeaders(email, gApiKey),
      );

      Logger.log(JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        return response.data.result.id;
      } else {
        throw new Error(
          response.data.errors?.[0]?.message ||
            'Failed to add domain to Cloudflare',
        );
      }
    } catch (error) {
      Logger.error('Error adding domain:', error.message);

      if (error.response) {
        Logger.error(
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
    email,
    gApiKey: string,
    accountId: string,
    domain: string,
    script: string,
    zoneId: string,
  ): Promise<void> {
    try {
      const workerName = domain.replace(/\./g, '-');

      Logger.log(`Deploying worker script for domain: ${domain}`);

      const publishResponse = await axios.put(
        `${this.CLOUDFLARE_API_BASE}/accounts/${accountId}/workers/scripts/${workerName}`,
        script,
        this.getHeaders(email, gApiKey, true),
      );

      if (publishResponse.status !== 200) {
        Logger.error('Failed to deploy worker:', publishResponse.data);
        throw new Error('Worker deployment failed');
      }

      Logger.log(`Worker script ${workerName} deployed successfully.`);

      Logger.log(`Mapping worker to domain: ${domain}`);

      const mapResponse = await axios.post(
        `${this.CLOUDFLARE_API_BASE}/zones/${zoneId}/workers/routes`,
        {
          pattern: `${domain}/*`,
          script: workerName,
        },
        this.getHeaders(email, gApiKey),
      );

      Logger.log('Worker mapped successfully:', mapResponse.data);

      if (mapResponse.status !== 200) {
        Logger.error('Failed to map worker to domain:', mapResponse.data);
        throw new Error('Domain mapping failed');
      }

      Logger.log(`Worker mapped to domain ${domain} successfully.`);
    } catch (error) {
      Logger.error(
        'Error deploying worker:',
        JSON.stringify(error.response?.data || error.message, null, 2),
      );

      throw new HttpException(
        'Failed to deploy worker',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getHeaders(email: string, gApiKey: string, js?: true) {
    return {
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': gApiKey,
        'Content-Type': js ? 'application/jacascript' : 'application/json',
      },
    };
  }
}

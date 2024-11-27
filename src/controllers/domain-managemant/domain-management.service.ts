import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DomainManagementService {
  private CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

  async addDomain(
    email: string,
    apiToken: string,
    domain: string,
  ): Promise<any> {
    // Step 1: Add the domain to Cloudflare
    const zoneId = await this.addZone(apiToken, domain);

    // Step 2: Deploy Worker for the domain
    await this.deployWorker(
      apiToken,
      zoneId,
      domain,
      '/usr/src/app/cdn-worker/dist/index.js',
    );

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

  private async addZone(apiToken: string, domain: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.CLOUDFLARE_API_BASE}/zones`,
        { name: domain, jump_start: true },
        { headers: { Authorization: `Bearer ${apiToken}` } },
      );

      console.log(JSON.stringify(response, null, 2));

      if (response.data.success) {
        return response.data.result.id;
      } else {
        throw new Error(
          response.data.errors[0].message ||
            'Failed to add domain to Cloudflare',
        );
      }
    } catch (error) {
      console.log(error.response.data, 'error');
      console.log(JSON.stringify(error.config.data, null, 2), 'error');

      console.error('Error adding domain:', error.message);
      throw new HttpException(
        'Failed to add domain to Cloudflare',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async deployWorker(
    apiToken: string,
    zoneId: string,
    domain: string,
    scriptPath: string,
  ): Promise<void> {
    try {
      const script = this.loadWorkerScript(scriptPath);

      // Publish the Worker
      await axios.put(
        `${this.CLOUDFLARE_API_BASE}/accounts/${zoneId}/workers/scripts/${domain.replace(/\./g, '-')}`,
        script,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/javascript',
          },
        },
      );

      // Map Worker to Route
      await axios.post(
        `${this.CLOUDFLARE_API_BASE}/zones/${zoneId}/workers/routes`,
        { pattern: `${domain}/*`, script: domain.replace(/\./g, '-') },
        { headers: { Authorization: `Bearer ${apiToken}` } },
      );
    } catch (error) {
      console.error('Error deploying worker:', error.message);
      throw new HttpException(
        'Failed to deploy worker',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private loadWorkerScript(scriptPath: string): string {
    const fullPath = path.resolve(scriptPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Worker script not found at: ${fullPath}`);
    }

    return fs.readFileSync(fullPath, 'utf-8');
  }
}

import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';

import * as fs from 'fs';
import * as path from 'path';
import { DomainMappingService } from '../domain-mapping/domain-mapping.service';
import { UserService } from '../user/user.service';

@Injectable()
export class DomainManagementService {
  private CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

  constructor(
    private readonly domainMappingService: DomainMappingService,
    private readonly userService: UserService,
  ) {}

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
    pwaId: string,
    userId: string,
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

    const { zoneId, nsRecords } = await this.addZone(
      email,
      gApiKey,
      domain,
      accountId,
      pwaId,
      userId,
    );

    await this.deployWorker(email, gApiKey, accountId, domain, script, zoneId);

    return {
      message:
        'Domain successfully added and worker deployed. Update NS records as follows:',
      nsRecords,
      domain,
    };
  }

  private async addZone(
    email: string,
    gApiKey: string,
    domain: string,
    accountId: string,
    pwaId: string,
    userId: string,
  ): Promise<{ zoneId: string; nsRecords: { name: string }[] }> {
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
        const zoneId = response.data.result.id;
        const nsRecords = response.data.result.name_servers.map(
          (ns: string) => ({
            name: ns,
          }),
        );

        const dnsRecordBody = {
          type: 'A',
          name: domain,
          content: '192.0.2.1',
          ttl: 3600,
          proxied: true,
        };

        try {
          const dnsRecordResponse = await axios.post(
            `${this.CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records`,
            dnsRecordBody,
            this.getHeaders(email, gApiKey),
          );

          Logger.log(JSON.stringify(dnsRecordResponse.data, null, 2));
        } catch (dnsError) {
          if (
            dnsError.response?.data?.errors &&
            dnsError.response.data.errors.some(
              (error: any) => error.code === 81058,
            )
          ) {
            Logger.log('DNS record already exists, skipping creation.');
          } else {
            Logger.error('Error creating DNS record:', dnsError.message);

            if (dnsError.response) {
              Logger.error(
                'DNS Error response data:',
                JSON.stringify(dnsError.response.data, null, 2),
              );
            }

            throw dnsError;
          }
        }

        await Promise.all([
          this.domainMappingService.addDomainMapping(
            domain,
            pwaId,
            userId,
            zoneId,
          ),
          this.userService.enrichPwa(userId, pwaId, {
            email,
            domain,
            gApiKey,
          }),
        ]);

        return { zoneId, nsRecords };
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

  async removeDomain(
    email: string,
    gApiKey: string,
    domain: string,
    pwaId: string,
    userId: string,
  ): Promise<any> {
    const accountId = await this.getAccountId(email, gApiKey);

    if (!accountId) {
      throw new HttpException(
        'Failed to retrieve accountId',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const data = await this.domainMappingService.getMappingByDomain(domain);

    if (!data.zoneId) {
      throw new HttpException(
        `Zone ID for domain ${domain} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    await Promise.all([
      this.deleteWorker(email, gApiKey, accountId, domain),
      this.deleteZone(email, gApiKey, data.zoneId),
      this.domainMappingService.removeDomainMapping(domain, pwaId, userId),
    ]);

    return {
      message: `Domain ${domain} and associated worker have been successfully removed.`,
    };
  }

  private async deleteZone(
    email: string,
    gApiKey: string,
    zoneId: string,
  ): Promise<void> {
    try {
      const recordsResponse = await axios.get(
        `${this.CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records`,
        this.getHeaders(email, gApiKey),
      );

      const dnsRecords = recordsResponse.data.result;

      const deletePromises = dnsRecords.map((record: any) => {
        return axios.delete(
          `${this.CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records/${record.id}`,
          this.getHeaders(email, gApiKey),
        );
      });

      await Promise.all(deletePromises);

      Logger.log(`All DNS records for zone ${zoneId} deleted successfully.`);

      const response = await axios.delete(
        `${this.CLOUDFLARE_API_BASE}/zones/${zoneId}`,
        this.getHeaders(email, gApiKey),
      );

      if (response.status !== 200) {
        throw new Error(
          response.data.errors?.[0]?.message ||
            'Failed to delete zone from Cloudflare',
        );
      }

      Logger.log(`Zone ${zoneId} deleted successfully.`);
    } catch (error) {
      Logger.error('Error deleting zone or DNS records:', error.message);

      if (error.response) {
        Logger.error(
          'Response data:',
          JSON.stringify(error.response.data, null, 2),
        );
      }

      throw new HttpException(
        'Failed to delete zone and DNS records from Cloudflare',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async deleteWorker(
    email: string,
    gApiKey: string,
    accountId: string,
    domain: string,
  ): Promise<void> {
    try {
      const workerName = domain.replace(/\./g, '-');

      const response = await axios.delete(
        `${this.CLOUDFLARE_API_BASE}/accounts/${accountId}/workers/scripts/${workerName}`,
        this.getHeaders(email, gApiKey),
      );

      if (response.status !== 200) {
        throw new Error(
          response.data.errors?.[0]?.message ||
            `Failed to delete worker ${workerName}`,
        );
      }

      Logger.log(`Worker ${workerName} deleted successfully.`);
    } catch (error) {
      Logger.error('Error deleting worker:', error.message);

      if (error.response) {
        Logger.error(
          'Response data:',
          JSON.stringify(error.response.data, null, 2),
        );
      }

      throw new HttpException(
        'Failed to delete worker from Cloudflare',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkDomainAddition(
    email: string,
    gApiKey: string,
    domain: string,
  ): Promise<{ canBeAdded: boolean; message: string }> {
    try {
      const accountResponse = await axios.get(
        `${this.CLOUDFLARE_API_BASE}/accounts`,
        this.getHeaders(email, gApiKey),
      );

      const accountId = accountResponse.data?.result?.[0]?.id;

      if (!accountId) {
        throw new HttpException(
          'Failed to retrieve accountId',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const zonesResponse = await axios.get(
        `${this.CLOUDFLARE_API_BASE}/zones`,
        this.getHeaders(email, gApiKey),
      );

      const existingZone = zonesResponse.data.result.find(
        (z: { name: string }) => z.name === domain,
      );

      if (existingZone) {
        return {
          canBeAdded: false,
          message: 'Domain already exists in your Cloudflare account.',
        };
      }

      return {
        canBeAdded: true,
        message: 'Domain can be added to Cloudflare without issues.',
      };
    } catch (error) {
      Logger.error('Error checking domain addition:', error.message);

      if (error.response) {
        Logger.error(
          'Response data:',
          JSON.stringify(error.response.data, null, 2),
        );
      }

      return {
        canBeAdded: false,
        message: error.message,
      };
    }
  }

  private async getAccountId(email: string, gApiKey: string): Promise<string> {
    const response = await axios.get(
      `${this.CLOUDFLARE_API_BASE}/accounts`,
      this.getHeaders(email, gApiKey),
    );

    return response.data?.result?.[0]?.id || null;
  }

  private getHeaders(email: string, gApiKey: string, js?: true) {
    return {
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': gApiKey,
        'Content-Type': js ? 'application/javascript' : 'application/json',
      },
    };
  }
}

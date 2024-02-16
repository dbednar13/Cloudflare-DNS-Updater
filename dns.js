import axios from 'axios';
import Logger from './logger.js';

const AUTH_EMAIL = ''; // Your Email here
const AUTH_TOKEN = ''; // Your api key here

const ZONE_IDS = ['']; // List of all zones you wish to update

async function getCurrentIPs() {
  const v4 = (await axios.get('http://api.ipify.org')).data;
  Logger.info(`Received IPv4 ${v4}`);

  let v6;
  try {
    v6 = (await axios.get('http://api6.ipify.org')).data;
    Logger.info(`Received IPv6 ${v6}`);
  } catch {
    Logger.warn('No IPv6 IP address.');
  }

  return { v4, v6 };
}

async function getZoneData(zoneId) {
  Logger.info(`Getting zone data for zone ${zoneId}`);
  const zoneData = (
    await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
      {
        headers: {
          'X-Auth-Key': AUTH_TOKEN,
          'X-Auth-Email': AUTH_EMAIL,
        },
      }
    )
  ).data;

  const results = {
    A: [],
    AAAA: [],
  };

  if (zoneData.success) {
    Logger.info('Received a success message from Cloudflare');
    results.A = zoneData.result.filter((x) => x.type === 'A');
    results.AAAA = zoneData.result.filter((x) => x.type === 'AAAA');
  } else {
    Logger.info('Received a non-success message from Cloudflare');
  }

  return results;
}

async function updateEntry(zoneId, data) {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${data.id}`;
  Logger.warn(`Updating ${url} with data ${JSON.stringify(data)}`);
  await axios.put(url, data, {
    headers: {
      'X-Auth-Key': AUTH_TOKEN,
      'X-Auth-Email': AUTH_EMAIL,
    },
  });
}

(async () => {
  const ips = await getCurrentIPs();

  ZONE_IDS.forEach(async (zoneId) => {
    const zoneResults = await getZoneData(zoneId);

    zoneResults.A.forEach(async (a) => {
      if (a.content !== ips.v4) {
        Logger.info(`Updating ${a.name} from ip ${a.content} to ${ips.v4}`);
        a.content = ips.v4;
        await updateEntry(zoneId, a);
      } else {
        Logger.info(`IPv4 matches for ${a.name}`);
      }
    });

    zoneResults.AAAA.forEach(async (aaaa) => {
      if (aaaa.content !== ips.v6) {
        Logger.info(
          `Updating ${aaaa.name} from ip ${aaaa.content} to ${ips.v6}`
        );
        aaaa.content = ips.v6;
        await updateEntry(zoneId, aaaa);
      } else {
        Logger.info(`IPv6 matches for ${aaaa.name}`);
      }
    });
  });
})();

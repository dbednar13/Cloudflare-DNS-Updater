import axios from 'axios';

const AUTH_EMAIL = ''; // Your Email here
const AUTH_TOKEN = ''; // Your api key here

const ZONE_IDS = ['']; // List of all zones you wish to update

async function getCurrentIPs() {
  const v4 = (await axios.get('http://api.ipify.org')).data;

  let v6;
  try {
    v6 = (await axios.get('http://api6.ipify.org')).data;
  } catch {
    console.log('No IPv6 IP address.');
  }

  return { v4, v6 };
}

async function getZoneData(zoneId) {
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
    results.A = zoneData.result.filter((x) => x.type === 'A');
    results.AAAA = zoneData.result.filter((x) => x.type === 'AAAA');
  }

  return results;
}

async function updateEntry(zoneId, data) {
  await axios.put(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${data.id}`,
    data,
    {
      headers: {
        'X-Auth-Key': AUTH_TOKEN,
        'X-Auth-Email': AUTH_EMAIL,
      },
    }
  );
}

(async () => {
  const ips = await getCurrentIPs();

  ZONE_IDS.forEach(async (zoneId) => {
    const zoneResults = await getZoneData(zoneId);

    zoneResults.A.forEach(async (a) => {
      if (a.content !== ips.v4) {
        a.content = ips.v4;
        await updateEntry(zoneId, a);
      }
    });

    zoneResults.AAAA.forEach(async (aaaa) => {
      if (aaaa.content !== ips.v6) {
        aaaa.content = ips.v6;
        await updateEntry(zoneId, aaaa);
      }
    });
  });
})();

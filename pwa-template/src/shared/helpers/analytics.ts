import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

function generateRandomEmail() {
  const randomString = Math.random().toString(36).substring(2, 8);
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com"];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  return `${randomString}@${randomDomain}`;
}

function generateRandomPhoneNumber() {
  const randomDigits = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  return `1${randomDigits}`;
}

function generateRandomName() {
  const firstNames = [
    "John",
    "Jane",
    "Alice",
    "Bob",
    "Charlie",
    "Eve",
    "Frank",
    "Grace",
    "Hannah",
    "Ivy",
    "Jack",
    "Karen",
    "Liam",
    "Mia",
    "Noah",
    "Olivia",
    "Paul",
    "Quinn",
    "Ruby",
    "Sophia",
    "Thomas",
    "Uma",
    "Violet",
    "William",
    "Xander",
    "Yara",
    "Zoe",
    "Emma",
    "Lily",
    "James",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Jones",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Thompson",
    "Garcia",
    "Martinez",
    "Robinson",
    "Clark",
    "Rodriguez",
    "Lewis",
    "Lee",
    "Walker",
    "Hall",
    "Allen",
    "Young",
    "King",
    "Scott",
  ];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return {
    firstName,
    lastName,
  };
}

function generateRandomBirthdate() {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 45;
  const endYear = currentYear - 22;
  const year =
    Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function getExternalId() {
  let externalId = localStorage.getItem("external_id");

  if (!externalId) {
    externalId = uuidv4();
    localStorage.setItem("external_id", externalId);
  }

  return externalId;
}

export function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramsString = urlParams.toString();

  localStorage.setItem("url_params", paramsString);

  return paramsString;
}

export function buildAppLink(
  appLink: string,
  fbc: string | null,
  fbp: string | null
) {
  const externalId = getExternalId();
  const urlParams = getUrlParams();
  const domain = window.location.hostname;

  const url = new URL(appLink, window.location.origin);

  for (const [key, value] of url.searchParams.entries()) {
    if (
      value.includes("{external_id}") ||
      value.includes('"{external_id}"') ||
      value.includes("'{external_id}'") ||
      value.includes("`{external_id}`")
    ) {
      url.searchParams.set(
        key,
        value
          .replace(/\{external_id\}/g, externalId)
          .replace(/"\{external_id\}"/g, externalId)
          .replace(/'\{external_id\}'/g, externalId)
          .replace(/`\{external_id\}`/g, externalId)
      );
    } else if (
      value.includes("{domain}") ||
      value.includes('"{domain}"') ||
      value.includes("'{domain}'") ||
      value.includes("`{domain}`")
    ) {
      url.searchParams.set(
        key,
        value
          .replace(/\{domain\}/g, domain)
          .replace(/"\{domain\}"/g, domain)
          .replace(/'\{domain\}'/g, domain)
          .replace(/`\{domain\}`/g, domain)
      );
    } else if (
      value.includes("{fbp}") ||
      value.includes('"{fbp}"') ||
      value.includes("'{fbp}'") ||
      value.includes("`{fbp}`")
    ) {
      url.searchParams.set(
        key,
        value
          .replace(/\{fbp\}/g, fbp || "")
          .replace(/"\{fbp\}"/g, fbp || "")
          .replace(/'\{fbp\}'/g, fbp || "")
          .replace(/`\{fbp\}`/g, fbp || "")
      );
    } else if (
      value.includes("{fbc}") ||
      value.includes('"{fbc}"') ||
      value.includes("'{fbc}'") ||
      value.includes("`{fbc}`")
    ) {
      url.searchParams.set(
        key,
        value
          .replace(/\{fbc\}/g, fbc || "")
          .replace(/"\{fbc\}"/g, fbc || "")
          .replace(/'\{fbc\}'/g, fbc || "")
          .replace(/`\{fbc\}`/g, fbc || "")
      );
    }
  }

  if (urlParams) {
    const additionalParams = new URLSearchParams(urlParams);
    for (const [key, value] of additionalParams.entries()) {
      if (!url.searchParams.has(key)) {
        url.searchParams.append(key, value);
      }
    }
  }

  return url.toString();
}

export async function trackExternalId(pwaId: string) {
  const externalId = getExternalId();

  let ip = null;
  let country = null;

  try {
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipResponse.json();
    ip = ipData.ip;
  } catch (error) {
    console.warn("Failed to retrieve IP:", error);
  }

  try {
    if (ip) {
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      const geoData = await geoResponse.json();
      country = geoData.country_name;
    }
  } catch (error) {
    console.warn("Failed to retrieve country:", error);
  }

  try {
    const { firstName, lastName } = generateRandomName();

    const response = await fetch("https://pwac.world/pwa-external-mapping", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        externalId: externalId,
        pwaContentId: pwaId,
        domain: window.location.hostname,
        ip: ip,
        country: country,
        firstName: firstName,
        lastName: lastName,
        phone: generateRandomPhoneNumber(),
        email: generateRandomEmail(),
        dob: generateRandomBirthdate(),
        userAgent: navigator.userAgent,
        fbp: Cookies.get("_fbp"),
        fbc: Cookies.get("_fbc"),
      }),
    });

    if (!response.ok) {
      console.error(
        "Failed to save external_id mapping:",
        await response.text()
      );
    } else {
      console.log("external_id mapping saved successfully.");
    }
  } catch (error) {
    console.error("Error while saving external_id mapping:", error);
  }
}

export async function logEvent(
  pwaContentId: string,
  domain: string,
  event: string,
  externalId?: string | null,
  value?: number,
  currency?: string
) {
  try {
    const response = await fetch("https://pwac.world/pwa-event-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pwaContentId,
        domain,
        externalId,
        event,
        value,
        currency,
      }),
    });

    if (!response.ok) {
      console.error("Failed to log event:", await response.text());
    } else {
      console.log("Event logged successfully.");
    }
  } catch (error) {
    console.error("Error while logging event:", error);
  }
}

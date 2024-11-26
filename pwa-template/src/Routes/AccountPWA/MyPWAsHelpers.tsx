export enum MyPWAsTabs {
  All = "all",
  Active = "active",
  Draft = "draft",
  Stopped = "stopped",
  CreatedAt = "createdAt",
  Status = "status",
}

export const getTabText = (tab: MyPWAsTabs) => {
  switch (tab) {
    case MyPWAsTabs.All:
      return "Все";
    case MyPWAsTabs.Active:
      return "Активные";
    case MyPWAsTabs.Draft:
      return "Черновики";
    case MyPWAsTabs.Stopped:
      return "Остановленн";
    case MyPWAsTabs.CreatedAt:
      return "Дата создания";
    case MyPWAsTabs.Status:
      return "Статус";
  }
};

export interface PWAData {
  name: string;
  domain: string;
  geo: string;
  createdAt: Date;
  status: "Active" | "Draft" | "Stopped";
  id: string;
}

export const mokePWA_Data: PWAData[] = [
  {
    name: "Best slots",
    domain: "bestslots.com",
    geo: "RU",
    createdAt: new Date(),
    status: "Active",
    id: "1",
  },
  {
    name: "Nine casino",
    domain: "ninecasino.com",
    geo: "RU",
    createdAt: new Date(),
    status: "Draft",
    id: "2",
  },
  {
    name: "Casino 7771",
    domain: "casino777.com",
    geo: "RU",
    createdAt: new Date(),
    status: "Stopped",
    id: "3",
  },
  {
    name: "Best slots 2",
    domain: "bestslots.com",
    geo: "RU",
    createdAt: new Date(),
    status: "Active",
    id: "4",
  },
  {
    name: "Nine casino 9",
    domain: "ninecasino.com",
    geo: "RU",
    createdAt: new Date(),
    status: "Draft",
    id: "5",
  },
  {
    name: "Casino 777",
    domain: "casino777.com",
    geo: "RU",
    createdAt: new Date(),
    status: "Stopped",
    id: "6",
  },
];

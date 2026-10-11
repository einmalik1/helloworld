export type TabId = "status" | "settings";

export type Toast = {
  id: number;
  kind: "info" | "error" | "success";
  message: string;
};

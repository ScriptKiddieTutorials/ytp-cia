export const APP_SERVER = "http://localhost:5000";
export const CSV_COLS = [
  "user_account",
  "role_id",
  "user_id",
  "action",
  "description",
  "timestamp",
  "IP",
];

export const csvToDict = (data) => {
  const res = {};
  const dataList = data.split(";");
  CSV_COLS.forEach((key, index) => {
    res[key] = dataList[index];
  });
  return res;
};

export const dictToCsv = (data) =>
  [
    CSV_COLS.join(";"),
    ...data.map((entry) => CSV_COLS.map((key) => entry[key]).join(";")),
  ].join("\n");

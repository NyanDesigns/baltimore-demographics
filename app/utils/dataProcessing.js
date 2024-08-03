import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

export function readCSVFile(fileName) {
  console.log(`Reading CSV file: ${fileName}`);
  const filePath = path.join(process.cwd(), "data", fileName);
  console.log(`File path: ${filePath}`);
  const fileContent = fs.readFileSync(filePath, "utf8");
  console.log(`File content length: ${fileContent.length}`);
  return parse(fileContent, { skip_empty_lines: true });
}

export function processData(csvData) {
  console.log(`Processing CSV data. Rows: ${csvData.length}`);

  // Extract tract numbers from the second row
  const tractNumbers = csvData[1]
    .slice(1)
    .map((tract) => {
      const match = tract.match(/Census Tract (\d+)/);
      return match ? `tract${match[1]}` : null;
    })
    .filter(Boolean);

  // Process the data rows
  const processedData = csvData.slice(2).reduce((acc, row) => {
    const category = row[0];
    if (category !== "Total:" && category !== "Estimate") {
      const dataPoint = { name: category };
      tractNumbers.forEach((tract, index) => {
        const value = parseInt(row[index + 1], 10);
        if (!isNaN(value)) {
          dataPoint[tract] = value;
        }
      });
      acc.push(dataPoint);
    }
    return acc;
  }, []);

  console.log(`Processed data: ${JSON.stringify(processedData)}`);
  return processedData;
}

export function readTablesList() {
  console.log("Reading tables list");
  const filePath = path.join(process.cwd(), "data", "TablesNamesList.csv");
  const fileContent = fs.readFileSync(filePath, "utf8");
  const parsed = parse(fileContent, { columns: false, skip_empty_lines: true });
  const result = parsed.reduce((acc, [code, name]) => {
    acc[code] = name;
    return acc;
  }, {});
  console.log(`Tables list: ${JSON.stringify(result)}`);
  return result;
}

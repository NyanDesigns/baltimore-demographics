import { NextResponse } from "next/server";
import {
  processData, readCSVFile, readTablesList
} from "../../utils/dataProcessing";

export async function GET(request) {
  console.log("API route handler called");
  const { searchParams } = new URL(request.url);
  const dataset = searchParams.get("dataset");
  console.log(`Requested dataset: ${dataset}`);

  const tablesList = readTablesList();
  const datasetFiles = Object.keys(tablesList).reduce((acc, key) => {
    acc[key] = `acs2022_5yr_${key}_14000US24510190200_${key}.csv`;
    return acc;
  }, {});

  if (!dataset || !datasetFiles[dataset]) {
    console.log("Invalid dataset requested");
    return NextResponse.json({ error: "Invalid dataset" }, { status: 400 });
  }

  console.log(`Reading CSV file: ${datasetFiles[dataset]}`);
  const csvData = readCSVFile(datasetFiles[dataset]);
  console.log(`CSV data read. Rows: ${csvData.length}`);
  const processedData = processData(csvData);

  return NextResponse.json({ data: processedData });
}

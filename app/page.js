"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const userGroups = [
  {
    name: "All Users",
    datasets: [
      "B08303",
      "B11016",
      "B14001",
      "B15003",
      "B17020",
      "B18101",
      "B19001",
      "B23025",
      "B25001",
      "B25002",
      "C24010",
      "B01001",
      "B02001",
      "B08134",
    ],
    description: "Includes all user groups and datasets.",
  },
  {
    name: "1. Residential Users",
    datasets: ["B01001", "B02001", "B11016", "B25001", "B25002"],
    description:
      "Residents (long-term), Renters, Homeowners, Families, Young professionals, Seniors/Retirees",
  },
  {
    name: "2. Community Service Users",
    datasets: ["B17020", "B18101", "B14001", "B23025"],
    description:
      "Community group participants, Healthcare seekers, Low-income individuals and families",
  },
  {
    name: "3. Recreational Users",
    datasets: ["B01001", "B02001", "B19001"],
    description:
      "Park and green space visitors, Fitness enthusiasts, Cultural event attendees",
  },
  {
    name: "4. Transit Users",
    datasets: ["B08303", "B08134", "C24010"],
    description: "Public transportation users, Pedestrians, Cyclists",
  },
  {
    name: "5. Economic Users",
    datasets: ["B17020", "B19001", "B23025"],
    description: "Shoppers and retail customers, Visitors and tourists",
  },
  {
    name: "6. Workforce",
    datasets: ["B23025", "C24010", "B15003"],
    description:
      "Commuters, Workers (local and from surrounding areas), Job seekers, Small business owners and entrepreneurs",
  },
  {
    name: "7. Special Populations",
    datasets: ["B01001", "B02001", "B18101"],
    description:
      "People with disabilities, Immigrants and non-native English speakers",
  },
];

const datasetNames = {
  B08303: "Travel Time to Work",
  B11016: "Household Type by Household Size",
  B14001: "School Enrollment by Level of School for the Population 3 Years and Over",
  B15003: "Educational Attainment for the Population 25 Years and Over",
  B17020: "Poverty Status in the Past 12 Months by Age",
  B18101: "Sex by Age by Disability Status",
  B19001:  "Household Income in the Past 12 Months (In 2022 Inflation-adjusted Dollars)",
  B23025: "Employment Status for the Population 16 Years and Over",
  B25001: "Housing Units",
  B25002: "Occupancy Status",
  C24010: "Occupation for the Civilian Employed Population 16 Years and Over",
  B01001: "Sex by Age",
  B02001: "Race",
  B08134: "Means of Transportation",
};

const generateColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 137.508) % 360;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
};

export default function BaltimoreDemographicsDashboard() {
  const [selectedGroup, setSelectedGroup] = useState(userGroups[0]);
  const [selectedDataset, setSelectedDataset] = useState(
    selectedGroup.datasets[0]
  );
  const [data, setData] = useState([]);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const [selectedTracts, setSelectedTracts] = useState([]);
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    console.log(`Selected dataset changed to: ${selectedDataset}`);
    fetchData(selectedDataset);
  }, [selectedDataset]);

  const fetchData = async (dataset) => {
    setIsLoading(true);
    try {
      console.log(`Fetching data for dataset: ${dataset}`);
      const response = await fetch(`/api/data?dataset=${dataset}`);
      const result = await response.json();
      console.log(`Received data: ${JSON.stringify(result)}`);
      setData(result.data || []);
      const tractCount = Object.keys(result.data[0] || {}).filter((key) =>
        key.startsWith("tract")
      ).length;
      setColors(generateColors(tractCount));
      setSelectedTracts(
        Object.keys(result.data[0] || {}).filter((key) =>
          key.startsWith("tract")
        )
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    console.log(`Rendering chart. Data length: ${data.length}`);
    if (data.length === 0) return null;

    const tractKeys = selectedTracts;

    if (chartType === "pie") {
      const pieData = data.map((item) => ({
        name: item.name,
        value: tractKeys.reduce((sum, tract) => sum + (item[tract] || 0), 0),
      }));

      return (
        <div className="flex flex-col items-center">
          <div className="mb-2 font-bold text-black">
            Categories Distribution
          </div>
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(2)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <div className="mb-2 font-bold text-black">Census Tracts</div>
        <ResponsiveContainer width="100%" height={data.length * 40 + 100}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 2, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              label={{
                value: "Population",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={250}
              label={{
                value: "Categories",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend
              wrapperStyle={{ paddingBottom: "40px" }}
              verticalAlign="top"
              align="center"
            />
            {tractKeys.map((tract, index) => (
              <Bar
                key={tract}
                dataKey={tract}
                stackId="a"
                fill={colors[index]}
                name={tract.replace("tract", "")}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const getDataSummary = () => {
    console.log(`Getting data summary. Data length: ${data.length}`);
    if (data.length === 0) return null;

    const tractKeys = selectedTracts;
    const tractTotals = tractKeys.reduce((acc, tract) => {
      acc[tract] = data.reduce((sum, item) => sum + (item[tract] || 0), 0);
      return acc;
    }, {});

    const grandTotal = Object.values(tractTotals).reduce(
      (sum, val) => sum + val,
      0
    );
    const highestCategory = data.reduce(
      (max, item) => {
        const itemTotal = tractKeys.reduce(
          (sum, tract) => sum + (item[tract] || 0),
          0
        );
        return itemTotal > max.total
          ? { name: item.name, total: itemTotal }
          : max;
      },
      { name: "", total: 0 }
    );

    return (
      <div className="p-6 bg-gray-100 rounded-lg shadow-md">
        <h3 className="mb-4 text-xl font-semibold text-black">Data Summary</h3>
        <p className="mb-2 text-black">
          <strong>User Group:</strong> {selectedGroup.name}
        </p>
        <p className="mb-4 text-black">
          <strong>User Description:</strong> {selectedGroup.description}
        </p>
        <p className="mb-2 text-black">
          <strong>Dataset:</strong> {datasetNames[selectedDataset]} (
          {selectedDataset})
        </p>
        <p className="mb-2 text-black">
          <strong>Total Count:</strong> {grandTotal.toLocaleString()}
        </p>
        <p className="mb-2 text-black">
          <strong>Number of Categories:</strong> {data.length}
        </p>
        <p className="mb-2 text-black">
          <strong>Number of Selected Census Tracts:</strong> {tractKeys.length}
        </p>
        <p className="text-black">
          <strong>Highest Category:</strong> {highestCategory.name} (
          {highestCategory.total.toLocaleString()} {" persons "} -{" "}
          {((highestCategory.total / grandTotal) * 100).toFixed(2)}%)
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="p-4 text-white bg-blue-600">
        <h1 className="text-3xl font-bold">
          Baltimore Census Tract Demographics Dashboard
        </h1>
      </nav>
      <main className="container p-6 mx-auto">
        <p className="mb-8 text-lg text-black">
          Source demographics data from the 2022 American Community Survey for
          Selected Baltimore City Census Tracts.
        </p>

        <div className="sticky top-0 z-10 flex flex-col p-4 mb-8 bg-white rounded-lg shadow-md">
          <h1 className="mb-5 text-2xl font-bold text-black">User Groups</h1>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {userGroups.map((group) => (
              <button
                key={group.name}
                onClick={() => {
                  if (selectedGroup.name === group.name) {
                    setSelectedGroup(userGroups[0]);
                    setSelectedDataset(userGroups[0].datasets[0]);
                  } else {
                    setSelectedGroup(group);
                    setSelectedDataset(group.datasets[0]);
                  }
                }}
                className={`px-4 py-2 text-md font-medium rounded-md ${
                  selectedGroup.name === group.name
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-slate-300 border border-slate-500"
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-grow">
              <label
                htmlFor="dataset-select"
                className="block mb-2 font-semibold text-black"
              >
                Dataset:
              </label>
              <select
                id="dataset-select"
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="w-full p-2 text-black border rounded"
              >
                {selectedGroup.datasets.map((dataset) => (
                  <option key={dataset} value={dataset}>
                    {dataset} - {datasetNames[dataset]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-grow">
              <label
                htmlFor="tract-select"
                className="block mb-2 font-semibold text-black"
              >
                Census Tracts:
              </label>
              <select
                id="tract-select"
                multiple
                value={selectedTracts}
                onChange={(e) =>
                  setSelectedTracts(
                    Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    )
                  )
                }
                className="w-full p-2 text-black border rounded"
              >
                {Object.keys(data[0] || {})
                  .filter((key) => key.startsWith("tract"))
                  .map((tract) => (
                    <option key={tract} value={tract}>
                      {tract.replace("tract", "Tract ")}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex-grow">
              <label
                htmlFor="chart-type"
                className="block mb-2 font-semibold text-black"
              >
                Chart Type:
              </label>
              <select
                id="chart-type"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="w-full p-2 text-black border rounded"
              >
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-between">
              <div className="flex">{getDataSummary()}</div>
              <div className="flex-1 max-w-[300px] flex items-center justify-center">
                <Image
                  className="relative my-3 max-w-[300px]"
                  src="https://i.ibb.co/LttswgT/image.png"
                  alt="logo"
                  unoptimized
                  width={100}
                  height={100}
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>
            </div>
            <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
              {renderChart()}
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="mb-4 text-2xl font-bold text-black">
                Data Table
                <button
                  onClick={() => setIsTableExpanded(!isTableExpanded)}
                  className="px-4 py-2 ml-4 text-sm text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600"
                >
                  {isTableExpanded ? "Collapse" : "Expand"}
                </button>
              </h2>
              {isTableExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-2 text-left text-black border">
                          Category
                        </th>
                        {selectedTracts.map((tract) => (
                          <th
                            key={tract}
                            className="p-2 text-left text-black border"
                          >
                            {tract.replace("tract", "Tract ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-gray-50" : ""}
                        >
                          <td className="p-2 text-black border">{item.name}</td>
                          {selectedTracts.map((tract) => (
                            <td key={tract} className="p-2 text-black border">
                              {item[tract]?.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

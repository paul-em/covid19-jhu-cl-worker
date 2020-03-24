function parseCSV(csvString) {
  const header = [];
  const content = [];
  csvString.split('\n').forEach((line, index) => {
    if (!line) {
      return;
    }
    if (index === 0) {
      line.split(',').forEach((headerItem) => {
        header.push(headerItem);
      });
    } else {
      const lineData = {};
      line.split(',').forEach((item, itemIndex) => {
        lineData[header[itemIndex]] = item.trim().replace(/"/g, '');
      });
      content.push(lineData);
    }
  });
  return content;
}

function fill(num) {
  if (num < 10) {
    return `0${num}`;
  }
  return `${num}`;
}

function formatDate(str) {
  const d = new Date(str);
  return `${d.getUTCFullYear()}-${fill(d.getUTCMonth() + 1)}-${fill(d.getUTCDate())}`;
}

function mergeTimelines(a, b) {
  return a.map((item, index) => item + b[index]);
}

function mapData(data) {
  const areas = {};
  const dates = Object.keys(data[0])
    .filter(i => ![
      'Province/State',
      'Country/Region',
      'Lat',
      'Long',
    ].includes(i));
  const formattedDates = {};
  dates.forEach((date) => {
    formattedDates[date] = formatDate(date);
  });
  data.forEach((item, index) => {
    const country = item['Country/Region'];
    const province = item['Province/State'];
    const timeline = dates.map(date => parseInt(item[date]));
    if (province) {
      areas[`${province}, ${country}`] = timeline;
    }
    if (areas[country]) {
      areas[country] = mergeTimelines(areas[country], timeline);
    } else {
      areas[country] = timeline;
    }
  });
  return areas;
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const response = await fetch('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv');
  const csv = await response.text();
  const data = parseCSV(csv);
  return new Response(JSON.stringify(mapData(data)), {
    headers: { 'content-type': 'application/json' },
  })
}
